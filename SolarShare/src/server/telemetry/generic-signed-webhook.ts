import { createHmac, timingSafeEqual } from 'node:crypto'
import type {
  NormalizedTelemetryEvent,
  NormalizedTelemetryReading,
  TelemetryAdapter,
  TelemetryMode,
  TelemetryQuality,
  TelemetryReadingKind,
} from './types'
import { TelemetryError } from './types'

type ProviderReading = {
  type?: unknown
  value?: unknown
  unit?: unknown
  quality?: unknown
}

const readingMap: Record<
  string,
  { kind: TelemetryReadingKind; category: 'power' | 'energy' | 'percentage' }
> = {
  'solar-generation-power': { kind: 'generation', category: 'power' },
  'solar-generation-energy': { kind: 'generation', category: 'energy' },
  'household-consumption-power': { kind: 'consumption', category: 'power' },
  'household-consumption-energy': { kind: 'consumption', category: 'energy' },
  'battery-state-of-charge': { kind: 'battery-state-of-charge', category: 'percentage' },
  'battery-charge-power': { kind: 'battery-charge', category: 'power' },
  'battery-discharge-power': { kind: 'battery-discharge', category: 'power' },
  'grid-import-power': { kind: 'grid-import', category: 'power' },
  'grid-import-energy': { kind: 'grid-import', category: 'energy' },
  'grid-export-power': { kind: 'grid-export', category: 'power' },
  'grid-export-energy': { kind: 'grid-export', category: 'energy' },
}

const normalizeQuality = (value: unknown): TelemetryQuality => {
  if (value === 'verified' || value === 'estimated' || value === 'unverified') return value
  return 'unverified'
}

const normalizeMode = (value: unknown): TelemetryMode => {
  if (value === 'live' || value === 'historical' || value === 'demo') return value
  return 'historical'
}

const finiteNonNegative = (value: unknown) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new TelemetryError(
      'INVALID_MEASUREMENT',
      'Telemetry values must be finite, non-negative numbers.',
    )
  }
  return value
}

const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000

export function normalizeProviderReading(reading: ProviderReading): NormalizedTelemetryReading {
  if (typeof reading.type !== 'string' || !readingMap[reading.type]) {
    throw new TelemetryError('UNSUPPORTED_MEASUREMENT', 'The measurement type is not supported.')
  }
  const definition = readingMap[reading.type]
  const value = finiteNonNegative(reading.value)

  if (definition.category === 'power') {
    if (reading.unit !== 'W' && reading.unit !== 'kW') {
      throw new TelemetryError('INVALID_UNIT', 'Power readings must use W or kW.')
    }
    const normalized = reading.unit === 'W' ? value / 1000 : value
    if (normalized > 100_000) {
      throw new TelemetryError('OUT_OF_RANGE', 'The power reading exceeds the supported range.')
    }
    return {
      kind: definition.kind,
      value: round(normalized),
      unit: 'kW',
      quality: normalizeQuality(reading.quality),
    }
  }

  if (definition.category === 'energy') {
    if (reading.unit !== 'Wh' && reading.unit !== 'kWh') {
      throw new TelemetryError('INVALID_UNIT', 'Energy readings must use Wh or kWh.')
    }
    const normalized = reading.unit === 'Wh' ? value / 1000 : value
    if (normalized > 1_000_000_000) {
      throw new TelemetryError('OUT_OF_RANGE', 'The energy reading exceeds the supported range.')
    }
    return {
      kind: definition.kind,
      value: round(normalized),
      unit: 'kWh',
      quality: normalizeQuality(reading.quality),
    }
  }

  if (reading.unit !== '%' || value > 100) {
    throw new TelemetryError(
      'INVALID_PERCENTAGE',
      'Battery state of charge must be between 0 and 100 percent.',
    )
  }
  return {
    kind: definition.kind,
    value: round(value),
    unit: '%',
    quality: normalizeQuality(reading.quality),
  }
}

const secureCompare = (actual: string, expected: string) => {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  )
}

export const genericSignedWebhookAdapter: TelemetryAdapter = {
  id: 'generic-signed-webhook',
  connectionMode: 'webhook',
  verifyRequest(rawBody, headers) {
    const secret = process.env.TELEMETRY_INGESTION_SECRET
    if (!secret) {
      throw new TelemetryError(
        'INTEGRATION_NOT_CONFIGURED',
        'Telemetry ingestion is not configured.',
        503,
      )
    }
    const supplied = headers.get('x-solarshare-signature')?.replace(/^sha256=/, '')
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
    if (!supplied || !secureCompare(supplied, expected)) {
      throw new TelemetryError('INVALID_SIGNATURE', 'Telemetry signature verification failed.', 401)
    }
  },
  parseEvent(rawBody) {
    let input: Record<string, unknown>
    try {
      input = JSON.parse(rawBody) as Record<string, unknown>
    } catch {
      throw new TelemetryError('INVALID_JSON', 'Telemetry payload must be valid JSON.')
    }

    const systemReference =
      typeof input.systemReference === 'string' ? input.systemReference.trim() : ''
    const eventID = typeof input.eventId === 'string' ? input.eventId.trim() : ''
    const measured = typeof input.measuredAt === 'string' ? Date.parse(input.measuredAt) : NaN
    if (!systemReference || systemReference.length > 128) {
      throw new TelemetryError('INVALID_SYSTEM_REFERENCE', 'A valid system reference is required.')
    }
    if (!eventID || eventID.length > 160) {
      throw new TelemetryError('INVALID_EVENT_ID', 'A valid event identifier is required.')
    }
    if (!Number.isFinite(measured) || measured > Date.now() + 5 * 60 * 1000) {
      throw new TelemetryError('INVALID_TIMESTAMP', 'A valid non-future timestamp is required.')
    }
    if (!Array.isArray(input.readings) || input.readings.length < 1 || input.readings.length > 50) {
      throw new TelemetryError('INVALID_READINGS', 'Provide between 1 and 50 telemetry readings.')
    }

    const readings = input.readings.map((reading) =>
      normalizeProviderReading(
        reading && typeof reading === 'object' ? (reading as ProviderReading) : {},
      ),
    )
    const keys = readings.map((reading) => `${reading.kind}:${reading.unit}`)
    if (new Set(keys).size !== keys.length) {
      throw new TelemetryError(
        'DUPLICATE_MEASUREMENT',
        'Each event may contain only one reading per measurement kind and unit.',
      )
    }

    const inverterStatuses = ['connected', 'standby', 'offline', 'fault', 'maintenance']
    const inverterStatus = inverterStatuses.includes(String(input.inverterStatus))
      ? (input.inverterStatus as NormalizedTelemetryEvent['inverterStatus'])
      : undefined

    return {
      adapter: this.id,
      systemReference,
      eventID,
      measuredAt: new Date(measured).toISOString(),
      mode: normalizeMode(input.mode),
      readings,
      deviceConnected:
        typeof input.deviceConnected === 'boolean' ? input.deviceConnected : undefined,
      inverterStatus,
    }
  },
}
