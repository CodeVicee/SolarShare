import type { EnergyRecord, SolarSystem } from '@/payload-types'

export type ReadingState = 'live' | 'historical' | 'demo' | 'unavailable'

export type SnapshotMeasurement = {
  value?: number
  unit: 'kW' | 'kWh' | '%'
  state: ReadingState
  measuredAt?: string
  ageSeconds?: number
  quality?: EnergyRecord['quality']
}

export type TelemetrySnapshot = {
  generatedAt: string
  systemID?: string
  systemName?: string
  deviceStatus: 'connected' | 'stale' | 'offline' | 'unavailable'
  lastSuccessfulUpdate?: string
  solarPower: SnapshotMeasurement
  consumptionPower: SnapshotMeasurement
  batteryStateOfCharge: SnapshotMeasurement
  batteryPower: SnapshotMeasurement & {
    operatingState: 'charging' | 'discharging' | 'idle' | 'unavailable'
  }
  gridPower: SnapshotMeasurement & {
    operatingState: 'importing' | 'exporting' | 'idle' | 'unavailable'
  }
  dailyTotals: {
    generationKWh?: number
    consumptionKWh?: number
    gridImportKWh?: number
    gridExportKWh?: number
  }
  powerHistory: Array<{
    measuredAt: string
    generationKW?: number
    consumptionKW?: number
  }>
}

const unavailable = (unit: SnapshotMeasurement['unit']): SnapshotMeasurement => ({
  unit,
  state: 'unavailable',
})

const latest = (
  records: EnergyRecord[],
  kinds: EnergyRecord['kind'][],
  unit: EnergyRecord['unit'],
) =>
  records
    .filter((record) => kinds.includes(record.kind) && record.unit === unit)
    .sort((left, right) => Date.parse(right.recordedAt) - Date.parse(left.recordedAt))[0]

const measurement = (
  record: EnergyRecord | undefined,
  unit: SnapshotMeasurement['unit'],
  system: SolarSystem | undefined,
  now: Date,
): SnapshotMeasurement => {
  if (!record) return unavailable(unit)
  const ageSeconds = Math.max(0, Math.floor((now.getTime() - Date.parse(record.recordedAt)) / 1000))
  const staleAfter = system?.telemetryStaleAfterSeconds || 900
  const state: ReadingState =
    record.telemetryStatus === 'demo'
      ? 'demo'
      : record.telemetryStatus === 'live' &&
          record.quality === 'verified' &&
          system?.operationalStatus === 'connected' &&
          ageSeconds <= staleAfter
        ? 'live'
        : 'historical'
  return {
    value: record.value,
    unit,
    state,
    measuredAt: record.recordedAt,
    ageSeconds,
    quality: record.quality,
  }
}

const sumDaily = (
  records: EnergyRecord[],
  kind: EnergyRecord['kind'],
  date: string,
): number | undefined => {
  const matching = records.filter(
    (record) =>
      record.kind === kind &&
      record.unit === 'kWh' &&
      record.recordedAt.slice(0, 10) === date &&
      record.quality !== 'unverified' &&
      record.telemetryStatus !== 'demo',
  )
  if (!matching.length) return undefined
  return Math.round(matching.reduce((sum, record) => sum + record.value, 0) * 1000) / 1000
}

export function buildTelemetrySnapshot(
  systems: SolarSystem[],
  records: EnergyRecord[],
  now = new Date(),
): TelemetrySnapshot {
  const system = systems[0]
  const scoped = system
    ? records.filter((record) => {
        const systemID = typeof record.system === 'object' ? record.system.id : record.system
        return systemID === system.id
      })
    : []
  const solar = latest(scoped, ['generation'], 'kW')
  const consumption = latest(scoped, ['consumption'], 'kW')
  const batterySOC = latest(scoped, ['battery-state-of-charge'], '%')
  const battery = latest(scoped, ['battery-charge', 'battery-discharge'], 'kW')
  const grid = latest(scoped, ['grid-import', 'grid-export'], 'kW')
  const lastSuccessfulUpdate = scoped
    .filter((record) => record.telemetryStatus !== 'demo')
    .sort((left, right) => Date.parse(right.recordedAt) - Date.parse(left.recordedAt))[0]
    ?.recordedAt
  const ageSeconds = lastSuccessfulUpdate
    ? (now.getTime() - Date.parse(lastSuccessfulUpdate)) / 1000
    : Number.POSITIVE_INFINITY
  const staleAfter = system?.telemetryStaleAfterSeconds || 900
  const deviceStatus =
    !system || !lastSuccessfulUpdate
      ? 'unavailable'
      : system.operationalStatus === 'offline'
        ? 'offline'
        : system.operationalStatus === 'connected' && ageSeconds <= staleAfter
          ? 'connected'
          : 'stale'

  const points = new Map<
    string,
    { measuredAt: string; generationKW?: number; consumptionKW?: number }
  >()
  for (const record of scoped) {
    if (
      record.unit !== 'kW' ||
      record.telemetryStatus === 'demo' ||
      record.quality === 'unverified' ||
      (record.kind !== 'generation' && record.kind !== 'consumption')
    ) {
      continue
    }
    const point = points.get(record.recordedAt) || { measuredAt: record.recordedAt }
    if (record.kind === 'generation') point.generationKW = record.value
    if (record.kind === 'consumption') point.consumptionKW = record.value
    points.set(record.recordedAt, point)
  }

  const today = now.toISOString().slice(0, 10)
  return {
    generatedAt: now.toISOString(),
    systemID: system?.id,
    systemName: system?.name,
    deviceStatus,
    lastSuccessfulUpdate,
    solarPower: measurement(solar, 'kW', system, now),
    consumptionPower: measurement(consumption, 'kW', system, now),
    batteryStateOfCharge: measurement(batterySOC, '%', system, now),
    batteryPower: {
      ...measurement(battery, 'kW', system, now),
      operatingState: !battery
        ? 'unavailable'
        : battery.value === 0
          ? 'idle'
          : battery.kind === 'battery-charge'
            ? 'charging'
            : 'discharging',
    },
    gridPower: {
      ...measurement(grid, 'kW', system, now),
      operatingState: !grid
        ? 'unavailable'
        : grid.value === 0
          ? 'idle'
          : grid.kind === 'grid-import'
            ? 'importing'
            : 'exporting',
    },
    dailyTotals: {
      generationKWh: sumDaily(scoped, 'generation', today),
      consumptionKWh: sumDaily(scoped, 'consumption', today),
      gridImportKWh: sumDaily(scoped, 'grid-import', today),
      gridExportKWh: sumDaily(scoped, 'grid-export', today),
    },
    powerHistory: [...points.values()]
      .sort((left, right) => Date.parse(left.measuredAt) - Date.parse(right.measuredAt))
      .slice(-240),
  }
}
