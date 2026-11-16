import { describe, expect, it } from 'vitest'
import { ownOwnerDocument, solarOwnerOnly } from './access'

const accessArgs = (roles: Array<'solar-owner' | 'customer'>) =>
  ({
    slug: 'users',
    req: {
      user: {
        id: 'app-user-id',
        collection: 'users',
        roles,
      },
    },
 }) as unknown as Parameters<typeof solarOwnerOnly>[0]

describe('solar owner collection access', () => {
  it('allows verified owner identities to create owner records', () => {
    expect(solarOwnerOnly(accessArgs(['solar-owner']))).toBe(true)
  })

  it('does not grant owner privileges to customers', () => {
    expect(solarOwnerOnly(accessArgs(['customer']))).toBe(false)
    expect(ownOwnerDocument(accessArgs(['customer']))).toBe(false)
  })

  it('keeps owner document access scoped to the authenticated owner id', () => {
    expect(ownOwnerDocument(accessArgs(['solar-owner']))).toEqual({
      owner: { equals: 'app-user-id' },
    })
  })
})
