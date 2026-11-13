import { describe, expect, it } from 'vitest'
import { customerAccess, ownerOnlyAccess, ownerOrCustomerAccess } from './finance-access'

const args = (id: string, collection = 'users') =>
  ({
    req: { user: { id, collection } },
  }) as Parameters<typeof ownerOrCustomerAccess>[0]

describe('payment and allocation participant access', () => {
  it('scopes customers to their own records', () => {
    expect(customerAccess(args('customer-1'))).toEqual({
      or: [{ customer: { equals: 'customer-1' } }],
    })
  })

  it('scopes Solar Owners to their own revenue and allocation records', () => {
    expect(ownerOnlyAccess(args('owner-1'))).toEqual({
      or: [{ solarOwner: { equals: 'owner-1' } }],
    })
    expect(ownerOrCustomerAccess(args('owner-1'))).toEqual({
      or: [{ solarOwner: { equals: 'owner-1' } }, { customer: { equals: 'owner-1' } }],
    })
  })

  it('does not grant app payment data to CMS identities or signed-out requests', () => {
    expect(ownerOrCustomerAccess(args('admin-1', 'admins'))).toBe(false)
    expect(
      ownerOrCustomerAccess({ req: { user: null } } as Parameters<typeof ownerOrCustomerAccess>[0]),
    ).toBe(false)
  })
})
