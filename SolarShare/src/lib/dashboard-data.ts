import 'server-only'

import type {
  AppNotification,
  EnergyRecord,
  SharingRecord,
  SolarSystem,
  SystemAlert,
  User,
} from '@/payload-types'
import { getCustomerDashboardData, getOwnedDashboardData } from '@/server/solarshare/repository'
import type { TelemetrySnapshot } from '@/server/telemetry/snapshot'
import type { getCommerceDashboard } from '@/server/commerce/service'
import { hasAppRole } from '@/lib/account-roles'

export type DashboardData = {
  systems: SolarSystem[]
  energy: EnergyRecord[]
  sharing: SharingRecord[]
  notifications: AppNotification[]
  alerts: SystemAlert[]
  telemetry: TelemetrySnapshot
  commerce: Awaited<ReturnType<typeof getCommerceDashboard>>
}

export async function getDashboardData(user: User): Promise<DashboardData> {
  if (hasAppRole(user, 'solar-owner')) return getOwnedDashboardData(user)
  if (hasAppRole(user, 'customer')) return getCustomerDashboardData(user)
  throw new Error('This account does not have a supported application role.')
}
