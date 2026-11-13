import type { CollectionConfig } from 'payload'
import { ownerOrCustomerAccess } from '@/lib/finance-access'

export const EnergyWallets: CollectionConfig = {
  slug: 'energy-wallets',
  admin: { hidden: true },
  access: { create: () => false, read: ownerOrCustomerAccess, update: () => false, delete: () => false },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'solarOwner', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'relationship', type: 'relationship', relationTo: 'customer-relationships', required: true, unique: true, index: true },
    { name: 'system', type: 'relationship', relationTo: 'solar-systems', required: true, index: true },
    { name: 'balanceKWh', type: 'number', required: true, defaultValue: 0, min: 0 },
    { name: 'totalAllocatedKWh', type: 'number', required: true, defaultValue: 0, min: 0 },
    { name: 'totalConsumedKWh', type: 'number', required: true, defaultValue: 0, min: 0 },
    { name: 'lowBalanceThresholdKWh', type: 'number', required: true, defaultValue: 5, min: 0 },
    { name: 'version', type: 'number', required: true, defaultValue: 0, min: 0 },
  ],
}
