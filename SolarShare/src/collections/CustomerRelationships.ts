import type { CollectionConfig } from 'payload'
import { ownerOrCustomerAccess } from '@/lib/finance-access'

export const CustomerRelationships: CollectionConfig = {
  slug: 'customer-relationships',
  admin: { hidden: true },
  access: { create: () => false, read: ownerOrCustomerAccess, update: () => false, delete: () => false },
  fields: [
    { name: 'solarOwner', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'system', type: 'relationship', relationTo: 'solar-systems', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: ['pending', 'approved', 'rejected', 'suspended', 'disconnected'],
    },
    { name: 'requestedAt', type: 'date', required: true, index: true },
    { name: 'reviewedAt', type: 'date' },
    { name: 'rejectionReason', type: 'text' },
    { name: 'relationshipKey', type: 'text', required: true, unique: true, index: true },
  ],
}
