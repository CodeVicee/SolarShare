import type { CollectionConfig } from 'payload'
import { ownerOrCustomerAccess } from '@/lib/finance-access'

export const MeterRegistrations: CollectionConfig = {
  slug: 'meter-registrations',
  admin: { hidden: true },
  access: { create: () => false, read: ownerOrCustomerAccess, update: () => false, delete: () => false },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'solarOwner', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'relationship', type: 'relationship', relationTo: 'customer-relationships', required: true, unique: true, index: true },
    { name: 'system', type: 'relationship', relationTo: 'solar-systems', required: true, index: true },
    { name: 'meterIdentifier', type: 'text', required: true, unique: true, index: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'pending', index: true, options: ['pending', 'active', 'suspended', 'disconnected'] },
    { name: 'source', type: 'select', required: true, defaultValue: 'not-configured', options: ['not-configured', 'smart-meter', 'manual-audited'] },
    { name: 'lastCumulativeKWh', type: 'number', min: 0 },
    { name: 'lastReadingAt', type: 'date', index: true },
  ],
}
