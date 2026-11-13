import type { CollectionConfig } from 'payload'
import { customerAccess } from '@/lib/finance-access'

export const CustomerProfiles: CollectionConfig = {
  slug: 'customer-profiles',
  admin: { hidden: true },
  access: { create: () => false, read: customerAccess, update: () => false, delete: () => false },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, unique: true, index: true },
    { name: 'displayName', type: 'text', required: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'active', options: ['active', 'suspended'] },
  ],
}
