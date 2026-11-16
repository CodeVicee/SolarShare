import 'server-only'

import { createHash } from 'node:crypto'
import config from '@payload-config'
import { getPayload } from 'payload'
import type { SolarSystem } from '@/payload-types'
import { enforceTelemetryRateLimit } from './rate-limit'
import type {
  NormalizedTelemetryEvent,
  TelemetryAdapter,
  TelemetryIngestionResult,
} from './types'
import { TelemetryError } from './types'
import { classifyTelemetryReading, telemetryDedupeKey } from './normalization'

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')

const ownerID = (system: SolarSystem) =>
  typeof system.owner === 'object' ? system.owner.id : system.owner

const operationalStatus = (
  event: NormalizedTelemetryEvent,
): SolarSystem['operationalStatus'] => {
  if (event.deviceConnected === false || event.inverterStatus === 'offline') return 'offline'
  if (event.inverterStatus === 'fault' || event.inverterStatus === 'maintenance') {
    return 'maintenance'
  }
  if (event.deviceConnected === true || event.inverterStatus === 'connected') return 'connected'
  return undefined
}

async function writeIngestionEvent({
  adapter,
  event,
  system,
  status,
  accepted,
  duplicates,
  rejected,
  error,
}: {
  adapter: string
  event?: NormalizedTelemetryEvent
  system?: SolarSystem
  status: 'accepted' | 'partial' | 'duplicate' | 'rejected'
  accepted: number
  duplicates: number
  rejected: number
  error?: TelemetryError
}) {
  const payload = await getPayload({ config })
  await payload.create({
    collection: 'telemetry-ingestion-events',
    data: {
      owner: system ? ownerID(system) : undefined,
      system: system?.id,
      adapter,
      eventReferenceHash: event ? sha256(event.eventID) : undefined,
      status,
      acceptedCount: accepted,
      duplicateCount: duplicates,
      rejectedCount: rejected,
      errorCode: error?.code,
      errorMessage: error?.message.slice(0, 240),
      receivedAt: new Date().toISOString(),
      measurementTimestamp: event?.measuredAt,
    },
    depth: 0,
    overrideAccess: true,
  })
}

export async function ingestTelemetry(
  adapter: TelemetryAdapter,
  rawBody: string,
  headers: Headers,
): Promise<TelemetryIngestionResult> {
  adapter.verifyRequest(rawBody, headers)
  enforceTelemetryRateLimit(adapter.id)

  let event: NormalizedTelemetryEvent
  try {
    event = adapter.parseEvent(rawBody)
  } catch (error) {
    if (error instanceof TelemetryError) {
      await writeIngestionEvent({
        adapter: adapter.id,
        status: 'rejected',
        accepted: 0,
        duplicates: 0,
        rejected: 1,
        error,
      })
    }
    throw error
  }

  const payload = await getPayload({ config })
  const systems = await payload.find({
    collection: 'solar-systems',
    where: {
      and: [
        { gatewayReference: { equals: event.systemReference } },
        { integrationAdapter: { equals: adapter.id } },
      ],
    },
    limit: 2,
    depth: 0,
    overrideAccess: true,
  })

  if (systems.totalDocs !== 1) {
    const error = new TelemetryError(
      systems.totalDocs > 1 ? 'AMBIGUOUS_SYSTEM' : 'SYSTEM_NOT_FOUND',
      'No unique configured solar system matches this telemetry source.',
      systems.totalDocs > 1 ? 409 : 404,
    )
    await writeIngestionEvent({
      adapter: adapter.id,
      event,
      status: 'rejected',
      accepted: 0,
      duplicates: 0,
      rejected: event.readings.length,
      error,
    })
    throw error
  }

  const system = systems.docs[0]
  const receivedAt = new Date()
  const staleAfterSeconds = system.telemetryStaleAfterSeconds || 900
 const keys = event.readings.map((reading) =>
  telemetryDedupeKey(event, String(system.id), reading),
)
  const existing = await payload.find({
    collection: 'energy-records',
    where: { dedupeKey: { in: keys } },
    limit: Math.max(1, keys.length),
    depth: 0,
    overrideAccess: true,
  })
  const existingKeys = new Set(existing.docs.map((record) => record.dedupeKey))
  let accepted = 0
  let duplicates = 0
  let rejected = 0

  for (let index = 0; index < event.readings.length; index += 1) {
    const reading = event.readings[index]
    const dedupeKey = keys[index]
    if (existingKeys.has(dedupeKey)) {
      duplicates += 1
      continue
    }
    try {
      await payload.create({
        collection: 'energy-records',
        data: {
          owner: ownerID(system),
          system: system.id,
          kind: reading.kind,
          value: reading.value,
          unit: reading.unit,
          recordedAt: event.measuredAt,
          source: 'gateway',
          sourceReference: event.eventID,
          dedupeKey,
          quality: event.mode === 'demo' ? 'unverified' : reading.quality,
          telemetryStatus: classifyTelemetryReading(
            event,
            reading,
            staleAfterSeconds,
            receivedAt,
          ),
          receivedAt: receivedAt.toISOString(),
        },
        depth: 0,
        overrideAccess: true,
      })
      accepted += 1
    } catch {
      rejected += 1
    }
  }

  if (rejected > 0) {
    await payload.update({
      collection: 'solar-systems',
      id: system.id,
      data: { lastTelemetryErrorAt: receivedAt.toISOString() },
      depth: 0,
      overrideAccess: true,
    })
  }

  const eventTimestamp = Date.parse(event.measuredAt)
  const previousTimestamp = system.lastTelemetryAt ? Date.parse(system.lastTelemetryAt) : 0
  if (accepted > 0 && eventTimestamp >= previousTimestamp) {
    await payload.update({
      collection: 'solar-systems',
      id: system.id,
      data: {
        operationalStatus: operationalStatus(event),
        credentialStatus: 'configured',
        dataSource: event.mode === 'demo' ? 'manual' : 'gateway',
        lastTelemetryAt: event.measuredAt,
        lastConnectedAt:
          event.deviceConnected === true ? receivedAt.toISOString() : system.lastConnectedAt,
      },
      depth: 0,
      overrideAccess: true,
    })
  }

  const status =
    accepted === 0 && duplicates > 0
      ? 'duplicate'
      : rejected > 0 || (accepted > 0 && duplicates > 0)
        ? 'partial'
        : 'accepted'
  await writeIngestionEvent({
    adapter: adapter.id,
    event,
    system,
    status,
    accepted,
    duplicates,
    rejected,
  })

  return {
    status,
    accepted,
    duplicates,
    rejected,
    measuredAt: event.measuredAt,
  }
}
