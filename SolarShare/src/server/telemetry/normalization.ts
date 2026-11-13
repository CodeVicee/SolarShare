import { createHash } from 'node:crypto'
import type { NormalizedTelemetryEvent, NormalizedTelemetryReading } from './types'

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')

export const telemetryDedupeKey = (
  event: Pick<NormalizedTelemetryEvent, 'adapter' | 'eventID'>,
  systemID: string,
  reading: Pick<NormalizedTelemetryReading, 'kind' | 'unit'>,
) => sha256(`${event.adapter}:${systemID}:${event.eventID}:${reading.kind}:${reading.unit}`)

export function classifyTelemetryReading(
  event: NormalizedTelemetryEvent,
  reading: NormalizedTelemetryReading,
  staleAfterSeconds: number,
  receivedAt: Date,
): 'live' | 'historical' | 'demo' {
  if (event.mode === 'demo') return 'demo'
  const ageMilliseconds = receivedAt.getTime() - Date.parse(event.measuredAt)
  const connected =
    event.deviceConnected === true ||
    event.inverterStatus === 'connected' ||
    event.inverterStatus === 'standby'
  const unavailable =
    event.deviceConnected === false ||
    event.inverterStatus === 'offline' ||
    event.inverterStatus === 'fault'
  if (
    event.mode !== 'live' ||
    reading.quality !== 'verified' ||
    !connected ||
    unavailable ||
    ageMilliseconds > staleAfterSeconds * 1000
  ) {
    return 'historical'
  }
  return 'live'
}
