import type { CollectionConfig } from 'payload'
import {
  appUserOnly,
  assignOwner,
  ownDocument,
  validateOwnedSolarSystem,
} from '@/lib/access'

export const SystemAlerts: CollectionConfig = {
  slug: 'system-alerts',
  admin: { hidden: true },
  access: {
    create: appUserOnly,
    read: ownDocument,
    update: ownDocument,
    delete: ownDocument,
  },
  hooks: {
    beforeChange: [assignOwner, validateOwnedSolarSystem()],
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: { create: () => false, update: () => false },
    },
    {
      name: 'system',
      type: 'relationship',
      relationTo: 'solar-systems',
      required: true,
      index: true,
    },
    {
      name: 'severity',
      type: 'select',
      required: true,
      index: true,
      options: ['info', 'warning', 'critical'],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      index: true,
      options: ['connection', 'inverter', 'battery', 'metering', 'generation', 'safety', 'other'],
    },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'open',
      options: ['open', 'acknowledged', 'resolved', 'dismissed'],
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'system',
      options: ['system', 'gateway', 'utility', 'manual'],
    },
    { name: 'sourceReference', type: 'text', index: true },
    { name: 'detectedAt', type: 'date', required: true, index: true },
    { name: 'acknowledgedAt', type: 'date' },
    { name: 'resolvedAt', type: 'date' },
  ],
}
