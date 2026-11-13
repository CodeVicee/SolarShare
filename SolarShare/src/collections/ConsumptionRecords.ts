import type { CollectionConfig } from 'payload'
import { ownerOrCustomerAccess } from '@/lib/finance-access'

export const ConsumptionRecords: CollectionConfig = {
  slug: 'consumption-records',
  admin: { hidden: true },
  access: { create: () => false, read: ownerOrCustomerAccess, update: () => false, delete: () => false },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'solarOwner', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'system', type: 'relationship', relationTo: 'solar-systems', required: true, index: true },
    { name: 'wallet', type: 'relationship', relationTo: 'energy-wallets', required: true, index: true },
    { name: 'meter', type: 'relationship', relationTo: 'meter-registrations', required: true, index: true },
    { name: 'reading', type: 'relationship', relationTo: 'meter-readings', required: true, unique: true, index: true },
    { name: 'energyKWh', type: 'number', required: true, min: 0.001 },
    { name: 'status', type: 'select', required: true, index: true, options: ['applied', 'insufficient-credit', 'rejected'] },
    { name: 'recordedAt', type: 'date', required: true, index: true },
  ],
}
