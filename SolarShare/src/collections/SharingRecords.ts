import type { CollectionConfig } from 'payload'
import {
  assignOwner,
  assignSharingSender,
  ownOwnerDocument,
  solarOwnerOnly,
  validateOwnedSolarSystem,
} from '@/lib/access'

export const SharingRecords: CollectionConfig = {
  slug: 'sharing-records',
  admin: { hidden: true },
  access: {
    create: solarOwnerOnly,
    read: ownOwnerDocument,
    update: ownOwnerDocument,
    delete: ownOwnerDocument,
  },
  hooks: {
    beforeChange: [
      assignOwner,
      assignSharingSender,
      validateOwnedSolarSystem('sourceSystem'),
    ],
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
    { name: 'direction', type: 'select', required: true, options: ['received', 'distributed'] },
    { name: 'energyKWh', type: 'number', required: true, min: 0 },
    {
      name: 'sender',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      access: { create: () => false, update: () => false },
    },
    { name: 'recipient', type: 'relationship', relationTo: 'users', index: true },
    {
      name: 'sourceSystem',
      type: 'relationship',
      relationTo: 'solar-systems',
      index: true,
    },
    { name: 'counterpartyLabel', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'proposed',
      options: ['proposed', 'approved', 'allocated', 'completed', 'cancelled', 'failed'],
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'coordination',
      options: ['coordination', 'meter-import', 'utility-confirmed'],
    },
    { name: 'allocationReference', type: 'text', index: true },
    { name: 'recordedAt', type: 'date', required: true, index: true },
    { name: 'completedAt', type: 'date', index: true },
  ],
}
