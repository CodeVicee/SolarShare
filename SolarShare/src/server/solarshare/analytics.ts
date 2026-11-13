import type { EnergyRecord, SharingRecord, SystemAlert } from '@/payload-types'

export type EnergySummary = {
  generationKWh: number
  consumptionKWh: number
  batteryChargeKWh: number
  batteryDischargeKWh: number
  gridImportKWh: number
  gridExportKWh: number
  measuredFrom?: string
  measuredTo?: string
  recordCount: number
}

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

const round = (value: number) => Math.round(value * 1000) / 1000

export function summarizeEnergy(records: EnergyRecord[]): EnergySummary {
  const totals = new Map<EnergyRecord['kind'], number>()
  const included = records.filter(
    (record) => record.unit === 'kWh' && record.quality !== 'unverified',
  )

  for (const record of included) {
    totals.set(record.kind, (totals.get(record.kind) || 0) + record.value)
  }

  const timestamps = included
    .map((record) => Date.parse(record.recordedAt))
    .filter(Number.isFinite)
    .sort((a, b) => a - b)

  return {
    generationKWh: round(totals.get('generation') || 0),
    consumptionKWh: round(totals.get('consumption') || 0),
    batteryChargeKWh: round(totals.get('battery-charge') || 0),
    batteryDischargeKWh: round(totals.get('battery-discharge') || 0),
    gridImportKWh: round(totals.get('grid-import') || 0),
    gridExportKWh: round(totals.get('grid-export') || 0),
    measuredFrom: timestamps.length ? new Date(timestamps[0]).toISOString() : undefined,
    measuredTo: timestamps.length
      ? new Date(timestamps[timestamps.length - 1]).toISOString()
      : undefined,
    recordCount: included.length,
  }
}

const isoWeek = (date: Date) => {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

const periodKey = (timestamp: string, period: AnalyticsPeriod) => {
  const date = new Date(timestamp)
  if (period === 'yearly') return String(date.getUTCFullYear())
  if (period === 'monthly') {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
  }
  if (period === 'weekly') return isoWeek(date)
  return date.toISOString().slice(0, 10)
}

export function aggregateEnergy(records: EnergyRecord[], period: AnalyticsPeriod) {
  const groups = new Map<string, EnergyRecord[]>()
  for (const record of records) {
    if (
      record.unit !== 'kWh' ||
      record.quality === 'unverified' ||
      record.telemetryStatus === 'demo'
    ) {
      continue
    }
    const key = periodKey(record.recordedAt, period)
    groups.set(key, [...(groups.get(key) || []), record])
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([periodStart, periodRecords]) => ({
      period: periodStart,
      ...summarizeEnergy(periodRecords),
    }))
}

export function analyticsDateWindow(period: AnalyticsPeriod, now = new Date()) {
  const from = new Date(now)
  if (period === 'daily') from.setUTCDate(from.getUTCDate() - 30)
  if (period === 'weekly') from.setUTCDate(from.getUTCDate() - 7 * 12)
  if (period === 'monthly') from.setUTCMonth(from.getUTCMonth() - 12)
  if (period === 'yearly') from.setUTCFullYear(from.getUTCFullYear() - 5)
  return { from: from.toISOString(), to: now.toISOString() }
}

export function summarizeSharing(records: SharingRecord[]) {
  const completed = records.filter((record) => record.status === 'completed')
  return {
    completedAllocations: completed.length,
    receivedKWh: round(
      completed
        .filter((record) => record.direction === 'received')
        .reduce((sum, record) => sum + record.energyKWh, 0),
    ),
    distributedKWh: round(
      completed
        .filter((record) => record.direction === 'distributed')
        .reduce((sum, record) => sum + record.energyKWh, 0),
    ),
  }
}

export function summarizeAlerts(alerts: SystemAlert[]) {
  return {
    open: alerts.filter((alert) => alert.status === 'open').length,
    criticalOpen: alerts.filter(
      (alert) => alert.status === 'open' && alert.severity === 'critical',
    ).length,
    acknowledged: alerts.filter((alert) => alert.status === 'acknowledged').length,
  }
}
