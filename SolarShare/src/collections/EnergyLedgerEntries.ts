import type { CollectionConfig } from 'payload'
import { ownerOrCustomerAccess } from '@/lib/finance-access'

export const EnergyLedgerEntries: CollectionConfig = {
  slug: 'energy-ledger-entries',
  admin: { hidden: true },
  access: { create: () => false, read: ownerOrCustomerAccess, update: () => false, delete: () => false },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'users', index: true },
    { name: 'solarOwner', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'system', type: 'relationship', relationTo: 'solar-systems', required: true, index: true },
    { name: 'wallet', type: 'relationship', relationTo: 'energy-wallets', index: true },
    { name: 'accountType', type: 'select', required: true, index: true, options: ['owner-inventory', 'customer-wallet'] },
    { name: 'direction', type: 'select', required: true, options: ['credit', 'debit'] },
    { name: 'energyKWh', type: 'number', required: true, min: 0.001 },
    { name: 'balanceAfterKWh', type: 'number', required: true, min: 0 },
    { name: 'allocation', type: 'relationship', relationTo: 'energy-allocation-records', index: true },
    { name: 'consumption', type: 'relationship', relationTo: 'consumption-records', index: true },
    { name: 'idempotencyKey', type: 'text', required: true, unique: true, index: true },
    { name: 'recordedAt', type: 'date', required: true, index: true },
  ],
}
