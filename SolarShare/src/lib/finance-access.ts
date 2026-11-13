import type { Access, Where } from 'payload'

const appUserID = (user: unknown): string | number | undefined => {
  if (
    user &&
    typeof user === 'object' &&
    'collection' in user &&
    user.collection === 'users' &&
    'id' in user &&
    (typeof user.id === 'string' || typeof user.id === 'number')
  ) {
    return user.id
  }
  return undefined
}

export const participantAccess =
  (...fields: string[]): Access =>
  ({ req }): boolean | Where => {
    const id = appUserID(req.user)
    if (!id) return false
    return { or: fields.map((field) => ({ [field]: { equals: id } })) }
  }

export const customerAccess = participantAccess('customer')
export const ownerOrCustomerAccess = participantAccess('solarOwner', 'customer')
export const ownerOnlyAccess = participantAccess('solarOwner')
