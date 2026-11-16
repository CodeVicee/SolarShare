import { describe, expect, it } from 'vitest'
import type { EnergyRecord, SharingRecord, SystemAlert } from '@/payload-types'
import {
  aggregateEnergy,
  summarizeAlerts,
  summarizeEnergy,
  summarizeSharing,
} from './analytics'

const energyRecord = (
  overrides: Partial<EnergyRecord> = {},
): EnergyRecord =>
  ({
    id: crypto.randomUUID(),
    owner: 'user-1',
    system: 'system-1',
    kind: 'generation',
    value: 1,
    unit: 'kWh',
    quality: 'verified',
    recordedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }) as EnergyRecord

describe('summarizeEnergy', () => {
  it('maps consistent kWh readings into dashboard totals', () => {
    const summary = summarizeEnergy([
      energyRecord({ kind: 'generation', value: 4.125 }),
      energyRecord({ kind: 'generation', value: 1.25 }),
      energyRecord({ kind: 'consumption', value: 2.5 }),
      energyRecord({ kind: 'grid-export', value: 0.75 }),
    ])

    expect(summary).toMatchObject({
      generationKWh: 5.375,
      consumptionKWh: 2.5,
      gridExportKWh: 0.75,
      recordCount: 4,
    })
  })

  it('excludes instantaneous and unverified readings from energy totals', () => {
    const summary = summarizeEnergy([
      energyRecord({ value: 20, unit: 'kW' }),
      energyRecord({ value: 50, quality: 'unverified' }),
    ])

    expect(summary.generationKWh).toBe(0)
    expect(summary.recordCount).toBe(0)
  })

  it('aggregates only accumulated non-demo energy into UTC periods', () => {
    const series = aggregateEnergy(
      [
        energyRecord({ recordedAt: '2026-01-02T23:00:00.000Z', value: 2 }),
        energyRecord({ recordedAt: '2026-01-02T23:30:00.000Z', value: 3 }),
        energyRecord({ recordedAt: '2026-01-03T00:10:00.000Z', value: 4 }),
        energyRecord({
          recordedAt: '2026-01-03T00:20:00.000Z',
          value: 100,
          telemetryStatus: 'demo',
        }),
      ],
      'daily',
    )

    expect(series.map(({ period, generationKWh }) => ({ period, generationKWh }))).toEqual([
      { period: '2026-01-02', generationKWh: 5 },
      { period: '2026-01-03', generationKWh: 4 },
    ])
  })
})

describe('sharing and alert summaries', () => {
  it('counts only completed allocation records as sharing outcomes', () => {
    const records = [
      { id: '1', direction: 'distributed', energyKWh: 2, status: 'completed' },
      { id: '2', direction: 'distributed', energyKWh: 10, status: 'proposed' },
      { id: '3', direction: 'received', energyKWh: 1.5, status: 'completed' },
    ] as unknown as SharingRecord[]

    expect(summarizeSharing(records)).toEqual({
      completedAllocations: 2,
      receivedKWh: 1.5,
      distributedKWh: 2,
    })
  })

  it('separates open critical alerts from acknowledged alerts', () => {
    const alerts = [
      { status: 'open', severity: 'critical' },
      { status: 'open', severity: 'warning' },
      { status: 'acknowledged', severity: 'critical' },
    ] as SystemAlert[]

    expect(summarizeAlerts(alerts)).toEqual({
      open: 2,
      criticalOpen: 1,
      acknowledged: 1,
    })
  })
})
