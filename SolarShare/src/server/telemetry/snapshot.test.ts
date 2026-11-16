import { describe, expect, it } from 'vitest'
import type { EnergyRecord, SolarSystem } from '@/payload-types'
import { buildTelemetrySnapshot } from './snapshot'
import { classifyTelemetryReading, telemetryDedupeKey } from './normalization'
import type { NormalizedTelemetryEvent } from './types'

const system = {
  id: 1,
  owner: 1,
  name: 'Home',
  operationalStatus: 'connected',
  telemetryStaleAfterSeconds: 900,
  allocatableEnergyKWh: 0,
  inventoryVersion: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as unknown as SolarSystem

const reading = (overrides: Partial<EnergyRecord> = {}) =>
  ({
    id: crypto.randomUUID(),
    owner: 1,
    system: 1,
    kind: 'generation',
    value: 4,
    unit: 'kW',
    quality: 'verified',
    telemetryStatus: 'live',
    recordedAt: '2026-01-01T11:55:00.000Z',
    createdAt: '2026-01-01T11:55:00.000Z',
    updatedAt: '2026-01-01T11:55:00.000Z',
    ...overrides,
  }) as EnergyRecord

describe('telemetry freshness and dashboard mapping', () => {
  it('marks recent connected readings live and older readings historical', () => {
    const current = buildTelemetrySnapshot(
      [system],
      [reading()],
      new Date('2026-01-01T12:00:00.000Z'),
    )
    const stale = buildTelemetrySnapshot(
      [system],
      [reading()],
      new Date('2026-01-01T12:20:01.000Z'),
    )

    expect(current.solarPower.state).toBe('live')
    expect(current.deviceStatus).toBe('connected')
    expect(stale.solarPower.state).toBe('historical')
    expect(stale.deviceStatus).toBe('stale')
  })

  it('keeps missing measurements unavailable and offline systems explicit', () => {
    const snapshot = buildTelemetrySnapshot(
      [{ ...system, operationalStatus: 'offline' } as SolarSystem],
      [reading()],
      new Date('2026-01-01T12:00:00.000Z'),
    )

    expect(snapshot.deviceStatus).toBe('offline')
    expect(snapshot.consumptionPower.state).toBe('unavailable')
    expect(snapshot.batteryStateOfCharge.state).toBe('unavailable')
  })

  it('classifies out-of-order and demo events without presenting them as live', () => {
    const base = {
      adapter: 'generic-signed-webhook',
      systemReference: 'gateway-1',
      eventID: 'event-1',
      measuredAt: '2026-01-01T11:00:00.000Z',
      mode: 'live',
      deviceConnected: true,
      readings: [],
    } satisfies NormalizedTelemetryEvent
    const normalized = {
      kind: 'generation',
      value: 4,
      unit: 'kW',
      quality: 'verified',
    } as const

    expect(
      classifyTelemetryReading(base, normalized, 900, new Date('2026-01-01T12:00:00.000Z')),
    ).toBe('historical')
    expect(
      classifyTelemetryReading(
        { ...base, mode: 'demo' },
        normalized,
        900,
        new Date('2026-01-01T11:00:01.000Z'),
      ),
    ).toBe('demo')
  })

  it('generates deterministic per-measurement duplicate keys', () => {
    const event = { adapter: 'generic-signed-webhook', eventID: 'event-1' }
    const first = telemetryDedupeKey(event, 'system-1', {
      kind: 'generation',
      unit: 'kW',
    })
    const duplicate = telemetryDedupeKey(event, 'system-1', {
      kind: 'generation',
      unit: 'kW',
    })
    const energy = telemetryDedupeKey(event, 'system-1', {
      kind: 'generation',
      unit: 'kWh',
    })

    expect(first).toBe(duplicate)
    expect(first).not.toBe(energy)
  })
})
