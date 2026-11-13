import { redirect } from 'next/navigation'
import SolarShareApp from '@/components/SolarShareApp'
import { canAccessDashboardSection, dashboardHomeFor, primaryAppRole } from '@/lib/account-roles'
import { getCurrentAppUser, toPublicUser } from '@/lib/app-auth'
import { getDashboardData } from '@/lib/dashboard-data'

const allowedSections = new Set([
  'overview',
  'solar',
  'battery',
  'consumption',
  'sharing',
  'analytics',
  'alerts',
  'energy',
  'payments',
  'settings',
])

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  const user = await getCurrentAppUser()
  if (!user) redirect('/login?reason=session-expired')
  if (!primaryAppRole(user)) redirect('/unauthorized')
  if (!allowedSections.has(section) || !canAccessDashboardSection(user, section)) {
    redirect(dashboardHomeFor(user))
  }
  const dashboardData = await getDashboardData(user)
  return <SolarShareApp currentUser={toPublicUser(user)} dashboardData={dashboardData} />
}
