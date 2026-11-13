import type { CollectionConfig } from 'payload'
import { ownerOnlyAccess } from '@/lib/finance-access'

export const SolarOwnerProfiles: CollectionConfig = {
  slug: 'solar-owner-profiles',
  admin: { hidden: true },
  access: { create: () => false, read: ownerOnlyAccess, update: () => false, delete: () => false },
  fields: [
    { name: 'solarOwner', type: 'relationship', relationTo: 'users', required: true, unique: true, index: true },
    { name: 'displayName', type: 'text', required: true },
    { name: 'publicDescription', type: 'textarea' },
    { name: 'status', type: 'select', required: true, defaultValue: 'active', options: ['active', 'suspended'] },
  ],
}
