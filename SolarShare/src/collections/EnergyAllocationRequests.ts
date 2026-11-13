import type { CollectionConfig } from 'payload'
import { ownerOrCustomerAccess } from '@/lib/finance-access'

export const EnergyAllocationRequests: CollectionConfig = {
  slug: 'energy-allocation-requests',
  admin: { hidden: true },
  access: { create: () => false, read: ownerOrCustomerAccess, update: () => false, delete: () => false },
  fields: [
    { name: 'payment', type: 'relationship', relationTo: 'payment-transactions', required: true, unique: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'solarOwner', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'relationship', type: 'relationship', relationTo: 'customer-relationships', required: true, index: true },
    { name: 'system', type: 'relationship', relationTo: 'solar-systems', required: true, index: true },
    { name: 'requestedKWh', type: 'number', required: true, min: 0.001 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: ['pending', 'approved', 'rejected', 'refund-required', 'refunded'],
    },
    { name: 'requestedAt', type: 'date', required: true, index: true },
    { name: 'reviewedAt', type: 'date' },
    { name: 'rejectionReason', type: 'text' },
  ],
}
