import type { CollectionConfig } from 'payload'
import { ownDocument } from '@/lib/access'

export const TelemetryIngestionEvents: CollectionConfig = {
  slug: 'telemetry-ingestion-events',
  admin: { hidden: true },
  access: {
    create: () => false,
    read: ownDocument,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      access: { create: () => false, update: () => false },
    },
    {
      name: 'system',
      type: 'relationship',
      relationTo: 'solar-systems',
      index: true,
      access: { create: () => false, update: () => false },
    },
    { name: 'adapter', type: 'text', required: true, index: true },
    { name: 'eventReferenceHash', type: 'text', index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      options: ['accepted', 'partial', 'duplicate', 'rejected'],
    },
    { name: 'acceptedCount', type: 'number', required: true, min: 0 },
    { name: 'duplicateCount', type: 'number', required: true, min: 0 },
    { name: 'rejectedCount', type: 'number', required: true, min: 0 },
    { name: 'errorCode', type: 'text', index: true },
    { name: 'errorMessage', type: 'text' },
    { name: 'receivedAt', type: 'date', required: true, index: true },
    { name: 'measurementTimestamp', type: 'date', index: true },
  ],
}
