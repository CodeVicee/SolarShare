import type { CollectionConfig } from 'payload'
import { assignOwner, ownDocument, validateOwnedSolarSystem } from '@/lib/access'

export const EnergyRecords: CollectionConfig = {
  slug: 'energy-records',
  admin: { hidden: true },
  access: { create: () => false, read: ownDocument, update: () => false, delete: () => false },
  hooks: { beforeChange: [assignOwner, validateOwnedSolarSystem()] },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: { create: () => false, update: () => false },
    },
    { name: 'system', type: 'relationship', relationTo: 'solar-systems', required: true, index: true },
    {
      name: 'kind',
      type: 'select',
      required: true,
      index: true,
      options: [
        'generation',
        'consumption',
        'battery-state-of-charge',
        'battery-charge',
        'battery-discharge',
        'grid-import',
        'grid-export',
      ],
    },
    { name: 'value', type: 'number', required: true, min: 0 },
    { name: 'unit', type: 'select', required: true, options: ['kW', 'kWh', '%'] },
    { name: 'recordedAt', type: 'date', required: true, index: true },
    {
      name: 'source',
      type: 'select',
      index: true,
      defaultValue: 'manual',
      options: ['manual', 'gateway', 'utility', 'import'],
    },
    { name: 'sourceReference', type: 'text', index: true },
    {
      name: 'dedupeKey',
      type: 'text',
      unique: true,
      index: true,
      access: { create: () => false, update: () => false },
    },
    {
      name: 'quality',
      type: 'select',
      defaultValue: 'unverified',
      options: ['verified', 'estimated', 'unverified'],
    },
    {
      name: 'telemetryStatus',
      type: 'select',
      defaultValue: 'historical',
      index: true,
      options: ['live', 'historical', 'demo'],
      access: { create: () => false, update: () => false },
    },
    {
      name: 'receivedAt',
      type: 'date',
      index: true,
      access: { create: () => false, update: () => false },
    },
  ],
}
