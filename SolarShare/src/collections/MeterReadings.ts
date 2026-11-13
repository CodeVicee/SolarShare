import type { CollectionConfig } from 'payload'
import { ownerOrCustomerAccess } from '@/lib/finance-access'

export const MeterReadings: CollectionConfig = {
  slug: 'meter-readings',
  admin: { hidden: true },
  access: { create: () => false, read: ownerOrCustomerAccess, update: () => false, delete: () => false },
  fields: [
    { name: 'meter', type: 'relationship', relationTo: 'meter-registrations', required: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'solarOwner', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'system', type: 'relationship', relationTo: 'solar-systems', required: true, index: true },
    { name: 'cumulativeKWh', type: 'number', required: true, min: 0 },
    { name: 'measuredAt', type: 'date', required: true, index: true },
    { name: 'source', type: 'select', required: true, options: ['smart-meter', 'manual-audited'] },
    { name: 'quality', type: 'select', required: true, options: ['verified', 'estimated', 'unverified'] },
    { name: 'dedupeKey', type: 'text', required: true, unique: true, index: true },
    { name: 'status', type: 'select', required: true, index: true, options: ['accepted', 'duplicate', 'out-of-order', 'rejected'] },
    { name: 'consumptionKWh', type: 'number', min: 0 },
  ],
}
