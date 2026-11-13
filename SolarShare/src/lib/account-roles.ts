export type AppRole = 'solar-owner' | 'customer' | 'solar-owner-applicant'

type RoleBearingUser = {
  roles?: AppRole[] | null
}

export const hasAppRole = (user: RoleBearingUser | null | undefined, role: AppRole) =>
  user?.roles?.includes(role) === true

export const primaryAppRole = (user: RoleBearingUser | null | undefined): AppRole | null => {
  if (hasAppRole(user, 'solar-owner')) return 'solar-owner'
  if (hasAppRole(user, 'customer')) return 'customer'
  return null
}

export const dashboardHomeFor = (user: RoleBearingUser | null | undefined) =>
  primaryAppRole(user) === 'solar-owner' ? '/app/overview' : '/app/payments'

export const canAccessDashboardSection = (
  user: RoleBearingUser | null | undefined,
  section: string,
) => {
  const role = primaryAppRole(user)
  if (role === 'solar-owner') return true
  return (
    role === 'customer' &&
    (section === 'energy' || section === 'payments' || section === 'settings')
  )
}

export function requireAppRole(user: RoleBearingUser | null | undefined, role: AppRole) {
  if (!hasAppRole(user, role)) {
    throw new Error('This account does not have permission for that action.')
  }
}
