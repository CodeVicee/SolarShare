import 'server-only'

import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import config from '@payload-config'
import { getPayload } from 'payload'
import type { SolarSystem } from '@/payload-types'
import { enforceTelemetryRateLimit } from '@/server/telemetry/rate-limit'
import { TelemetryError } from '@/server/telemetry/types'

type ESP32Input = {
  systemReference?: unknown
  deviceReference?: unknown
  eventId?: unknown
  measuredAt?: unknown
  mode?: unknown
  voltage?: unknown
  current?: unknown
  power?: unknown
  relay?: unknown
  voltage2?: unknown
  current2?: unknown
  power2?: unknown
  relay2?: unknown
}

const secureCompare = (actual: string, expected: string) => {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  )
}

const requireNumber = (
  value: unknown,
  field: string,
  maximum: number,
): number => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > maximum
  ) {
    throw new TelemetryError(
      'INVALID_MEASUREMENT',
      `${field} is outside the supported range.`,
    )
  }

  return Math.round(value * 1000) / 1000
}

const requireBoolean = (value: unknown, field: string): boolean => {
  if (typeof value !== 'boolean') {
    throw new TelemetryError(
      'INVALID_MEASUREMENT',
      `${field} must be true or false.`,
    )
  }

  return value
}

const ownerID = (system: SolarSystem): number => {
  const owner =
    typeof system.owner === 'object' ? system.owner.id : system.owner

  if (typeof owner !== 'number' || !Number.isInteger(owner) || owner <= 0) {
    throw new TelemetryError(
      'SYSTEM_OWNER_MISSING',
      'The configured solar system has no valid owner.',
      409,
    )
  }

  return owner
}

export async function ingestESP32Telemetry(
  rawBody: string,
  headers: Headers,
) {
  if (Buffer.byteLength(rawBody, 'utf8') > 16_384) {
    throw new TelemetryError(
      'PAYLOAD_TOO_LARGE',
      'The ESP32 telemetry payload is too large.',
      413,
    )
  }

  const secret = process.env.ESP32_MONITOR_INGESTION_SECRET

  if (!secret || secret.length < 32) {
    throw new TelemetryError(
      'INTEGRATION_NOT_CONFIGURED',
      'ESP32 monitoring ingestion is not configured.',
      503,
    )
  }

  const supplied = headers
    .get('x-solarshare-esp32-signature')
    ?.replace(/^sha256=/, '')

  const expected = createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  if (!supplied || !secureCompare(supplied, expected)) {
    throw new TelemetryError(
      'INVALID_SIGNATURE',
      'ESP32 signature verification failed.',
      401,
    )
  }

  let input: ESP32Input

  try {
    input = JSON.parse(rawBody) as ESP32Input
  } catch {
    throw new TelemetryError(
      'INVALID_JSON',
      'ESP32 telemetry payload must be valid JSON.',
    )
  }

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TelemetryError(
      'INVALID_PAYLOAD',
      'ESP32 telemetry payload must be a JSON object.',
    )
  }

  const systemReference =
    typeof input.systemReference === 'string'
      ? input.systemReference.trim()
      : ''

  const deviceReference =
    typeof input.deviceReference === 'string'
      ? input.deviceReference.trim()
      : ''

  const eventId =
    typeof input.eventId === 'string' ? input.eventId.trim() : ''

  const measuredTimestamp =
    typeof input.measuredAt === 'string'
      ? Date.parse(input.measuredAt)
      : NaN

  if (!systemReference || systemReference.length > 128) {
    throw new TelemetryError(
      'INVALID_SYSTEM_REFERENCE',
      'A valid system reference is required.',
    )
  }

  if (!deviceReference || deviceReference.length > 128) {
    throw new TelemetryError(
      'INVALID_DEVICE_REFERENCE',
      'A valid device reference is required.',
    )
  }

  if (!eventId || eventId.length > 160) {
    throw new TelemetryError(
      'INVALID_EVENT_ID',
      'A valid event identifier is required.',
    )
  }

  if (
    !Number.isFinite(measuredTimestamp) ||
    measuredTimestamp > Date.now() + 5 * 60 * 1000
  ) {
    throw new TelemetryError(
      'INVALID_TIMESTAMP',
      'A valid non-future timestamp is required.',
    )
  }

  if (input.mode !== 'demo' && input.mode !== 'live') {
    throw new TelemetryError(
      'INVALID_MODE',
      'ESP32 telemetry mode must be demo or live.',
    )
  }

  const voltage1 = requireNumber(input.voltage, 'voltage', 300)
  const current1 = requireNumber(input.current, 'current', 100)
  const power1VA = requireNumber(input.power, 'power', 30_000)
  const relay1 = requireBoolean(input.relay, 'relay')

  const voltage2 = requireNumber(input.voltage2, 'voltage2', 300)
  const current2 = requireNumber(input.current2, 'current2', 100)
  const power2VA = requireNumber(input.power2, 'power2', 30_000)
  const relay2 = requireBoolean(input.relay2, 'relay2')

  enforceTelemetryRateLimit(`esp32:${systemReference}`)

  const payload = await getPayload({ config })

  const systems = await payload.find({
    collection: 'solar-systems',
    where: {
      and: [
        { gatewayReference: { equals: systemReference } },
        { integrationAdapter: { equals: 'esp32-monitor' } },
      ],
    },
    limit: 2,
    depth: 0,
    overrideAccess: true,
  })

  if (systems.totalDocs !== 1) {
    throw new TelemetryError(
      systems.totalDocs > 1 ? 'AMBIGUOUS_SYSTEM' : 'SYSTEM_NOT_FOUND',
      'No unique ESP32-configured solar system matches this source.',
      systems.totalDocs > 1 ? 409 : 404,
    )
  }

  const system = systems.docs[0]
  const dedupeKey = createHash('sha256')
    .update(`${system.id}:${deviceReference}:${eventId}`)
    .digest('hex')

  const existing = await payload.find({
    collection: 'esp32-monitor-readings',
    where: {
      dedupeKey: { equals: dedupeKey },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0) {
    return { status: 'duplicate' as const }
  }

  const data = {
    owner: ownerID(system),
    system: system.id,
    deviceReference,
    eventId,
    dedupeKey,
    measuredAt: new Date(measuredTimestamp).toISOString(),
    voltage1,
    current1,
    power1VA,
    relay1,
    voltage2,
    current2,
    power2VA,
    relay2,
    mode: input.mode as 'demo' | 'live',
    quality: 'unverified' as const,
    receivedAt: new Date().toISOString(),
  }

  try {
    await payload.create({
      collection: 'esp32-monitor-readings',
      data,
      overrideAccess: true,
    })
  } catch {
    // A concurrent request may have inserted the same unique dedupe key.
    const duplicateCheck = await payload.find({
      collection: 'esp32-monitor-readings',
      where: {
        dedupeKey: { equals: dedupeKey },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (duplicateCheck.totalDocs > 0) {
      return { status: 'duplicate' as const }
    }

    throw new TelemetryError(
      'ESP32_STORAGE_FAILED',
      'ESP32 telemetry could not be stored.',
      500,
    )
  }

  return {
    status: 'accepted' as const,
    systemId: system.id,
    receivedAt: data.receivedAt,
    quality: 'unverified' as const,
  }
}
