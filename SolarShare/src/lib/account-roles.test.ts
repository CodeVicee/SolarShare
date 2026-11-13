import { describe, expect, it } from 'vitest'
import {
  canAccessDashboardSection,
  dashboardHomeFor,
  hasAppRole,
  primaryAppRole,
} from './account-roles'

describe('app account roles', () => {
  const owner = { roles: ['solar-owner'] as Array<'solar-owner'> }
  const customer = { roles: ['customer'] as Array<'customer'> }
  const applicant = { roles: ['solar-owner-applicant'] as Array<'solar-owner-applicant'> }

  it('routes owners and customers to separate workspaces', () => {
    expect(dashboardHomeFor(owner)).toBe('/app/overview')
    expect(dashboardHomeFor(customer)).toBe('/app/payments')
  })

  it('does not grant owner sections to customers', () => {
    expect(canAccessDashboardSection(owner, 'solar')).toBe(true)
    expect(canAccessDashboardSection(customer, 'solar')).toBe(false)
    expect(canAccessDashboardSection(customer, 'energy')).toBe(true)
    expect(canAccessDashboardSection(customer, 'payments')).toBe(true)
    expect(canAccessDashboardSection(customer, 'settings')).toBe(true)
  })

  it('does not infer owner access from authentication alone', () => {
    expect(primaryAppRole(owner)).toBe('solar-owner')
    expect(primaryAppRole(customer)).toBe('customer')
    expect(hasAppRole(customer, 'solar-owner')).toBe(false)
    expect(primaryAppRole(applicant)).toBeNull()
    expect(canAccessDashboardSection(applicant, 'overview')).toBe(false)
  })
})
