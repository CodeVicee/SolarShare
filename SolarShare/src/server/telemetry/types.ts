import type { EnergyRecord } from '@/payload-types'

export type TelemetryMode = 'live' | 'historical' | 'demo'
export type TelemetryQuality = 'verified' | 'estimated' | 'unverified'
export type TelemetryReadingKind = EnergyRecord['kind']

export type NormalizedTelemetryReading = {
  kind: TelemetryReadingKind
  value: number
  unit: 'kW' | 'kWh' | '%'
  quality: TelemetryQuality
}

export type NormalizedTelemetryEvent = {
  adapter: string
  systemReference: string
  eventID: string
  measuredAt: string
  mode: TelemetryMode
  readings: NormalizedTelemetryReading[]
  deviceConnected?: boolean
  inverterStatus?: 'connected' | 'standby' | 'offline' | 'fault' | 'maintenance'
}

export type TelemetryAdapter = {
  id: string
  connectionMode: 'webhook' | 'polling'
  verifyRequest(rawBody: string, headers: Headers): void
  parseEvent(rawBody: string): NormalizedTelemetryEvent
}

export class TelemetryError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status = 400) {
    super(message)
    this.name = 'TelemetryError'
    this.code = code
    this.status = status
  }
}

export type TelemetryIngestionResult = {
  status: 'accepted' | 'partial' | 'duplicate'
  accepted: number
  duplicates: number
  rejected: number
  measuredAt: string
}
