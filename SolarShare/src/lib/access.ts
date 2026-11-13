import { ValidationError } from 'payload'
import type { Access, CollectionBeforeChangeHook, Where } from 'payload'
import { randomBytes } from 'node:crypto'
import { hasAppRole } from './account-roles'

const isAppUser = (
  user: unknown,
): user is {
  collection: 'users'
  id: string | number
  roles?: Array<'solar-owner' | 'customer' | 'solar-owner-applicant'> | null
} =>
  Boolean(
    user &&
      typeof user === 'object' &&
      'collection' in user &&
      user.collection === 'users' &&
      'id' in user,
  )

export const appUserOnly: Access = ({ req }) => isAppUser(req.user)

export const solarOwnerOnly: Access = ({ req }) =>
  isAppUser(req.user) && hasAppRole(req.user, 'solar-owner')

export const ownOwnerDocument: Access = ({ req }): boolean | Where => {
  if (!isAppUser(req.user) || !hasAppRole(req.user, 'solar-owner')) return false
  return { owner: { equals: req.user.id } }
}

export const ownDocument: Access = ({ req }): boolean | Where => {
  if (!isAppUser(req.user)) return false
  return { owner: { equals: req.user.id } }
}

export const ownProfile: Access = ({ req }): boolean | Where => {
  if (!isAppUser(req.user)) return false
  return { id: { equals: req.user.id } }
}

export const assignOwner: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation !== 'create' || !isAppUser(req.user)) return data
  return { ...data, owner: req.user.id }
}

const relationshipID = (value: unknown): number | string | undefined => {
  if (typeof value === 'string' || typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = value.id
    if (typeof id === 'string' || typeof id === 'number') return id
  }
  return undefined
}

export const validateOwnedSolarSystem =
  (field = 'system'): CollectionBeforeChangeHook =>
  async ({ data, req }) => {
    const id = relationshipID(data[field])
    if (!id || !isAppUser(req.user)) return data

    try {
      await req.payload.findByID({
        collection: 'solar-systems',
        id,
        depth: 0,
        overrideAccess: false,
        user: req.user,
      })
    } catch {
      throw new ValidationError({
        errors: [
          {
            message: 'Select a solar system owned by your account.',
            path: field,
          },
        ],
        req,
      })
    }

    return data
  }

export const assignSharingSender: CollectionBeforeChangeHook = ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || !isAppUser(req.user)) return data
  return { ...data, sender: req.user.id }
}

export const assignSolarRegistrationCode: CollectionBeforeChangeHook = ({
  data,
  operation,
}) => {
  if (operation !== 'create' || data.customerRegistrationCode) return data
  return {
    ...data,
    customerRegistrationCode: `SS-${randomBytes(5).toString('hex').toUpperCase()}`,
  }
}
