import type { CollectionConfig } from 'payload'
import { ownerOrCustomerAccess } from '@/lib/finance-access'

export const EnergyTariffs: CollectionConfig = {
  slug: 'energy-tariffs',
  admin: { hidden: true },
  access: { create: () => false, read: ownerOrCustomerAccess, update: () => false, delete: () => false },
  fields: [
    { name: 'solarOwner', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'system', type: 'relationship', relationTo: 'solar-systems', required: true, index: true },
    { name: 'nairaPerKWh', type: 'number', required: true, min: 1, defaultValue: 100 },
    { name: 'activeFrom', type: 'date', required: true, index: true },
    { name: 'activeTo', type: 'date', index: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'active', index: true, options: ['active', 'superseded'] },
  ],
}
