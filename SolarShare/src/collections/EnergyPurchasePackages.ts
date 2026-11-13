import type { CollectionConfig } from 'payload'
import { ownerOrCustomerAccess } from '@/lib/finance-access'

export const EnergyPurchasePackages: CollectionConfig = {
  slug: 'energy-purchase-packages',
  admin: { hidden: true },
  access: {
    create: () => false,
    read: ownerOrCustomerAccess,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'solarOwner', type: 'relationship', relationTo: 'users', required: true, index: true },
    {
      name: 'system',
      type: 'relationship',
      relationTo: 'solar-systems',
      required: true,
      index: true,
    },
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'text' },
    { name: 'amountKobo', type: 'number', required: true, min: 10_000 },
    { name: 'active', type: 'checkbox', required: true, defaultValue: true, index: true },
    { name: 'displayOrder', type: 'number', required: true, defaultValue: 0, min: 0 },
  ],
}
