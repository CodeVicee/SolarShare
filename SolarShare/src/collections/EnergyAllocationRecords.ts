import type { CollectionConfig } from 'payload'
import { ownerOrCustomerAccess } from '@/lib/finance-access'

export const EnergyAllocationRecords: CollectionConfig = {
  slug: 'energy-allocation-records',
  admin: { hidden: true },
  access: { create: () => false, read: ownerOrCustomerAccess, update: () => false, delete: () => false },
  fields: [
    { name: 'request', type: 'relationship', relationTo: 'energy-allocation-requests', required: true, unique: true, index: true },
    { name: 'payment', type: 'relationship', relationTo: 'payment-transactions', required: true, unique: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'solarOwner', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'system', type: 'relationship', relationTo: 'solar-systems', required: true, index: true },
    { name: 'energyKWh', type: 'number', required: true, min: 0.001 },
    { name: 'reference', type: 'text', required: true, unique: true, index: true },
    { name: 'approvedAt', type: 'date', required: true, index: true },
  ],
}
