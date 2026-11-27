
import type { CollectionConfig } from 'payload'
import {
  assignOwner,
  ownDocument,
  validateOwnedSolarSystem,
} from '@/lib/access'

export const ESP32MonitorReadings: CollectionConfig = {
  slug: 'esp32-monitor-readings',

  admin: {
    hidden: true,
    defaultColumns: ['system', 'measuredAt', 'mode', 'receivedAt'],
  },

  access: {
    create: () => false,
    read: ownDocument,
    update: () => false,
    delete: () => false,
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
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: 'system',
      type: 'relationship',
      relationTo: 'solar-systems',
      required: true,
      index: true,
    },
    {
      name: 'deviceReference',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'eventId',
      type: 'text',
      required: true,
    },
    {
      name: 'dedupeKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: 'measuredAt',
      type: 'date',
      required: true,
      index: true,
    },

    // Load 1 measurements
    {
      name: 'voltage1',
      type: 'number',
      min: 0,
    },
    {
      name: 'current1',
      type: 'number',
      min: 0,
    },
    {
      name: 'power1VA',
      type: 'number',
      min: 0,
    },
    {
      name: 'relay1',
      type: 'checkbox',
    },

    // Load 2 measurements
    {
      name: 'voltage2',
      type: 'number',
      min: 0,
    },
    {
      name: 'current2',
      type: 'number',
      min: 0,
    },
    {
      name: 'power2VA',
      type: 'number',
      min: 0,
    },
    {
      name: 'relay2',
      type: 'checkbox',
    },

    {
      name: 'mode',
      type: 'select',
      required: true,
      defaultValue: 'demo',
      options: ['demo', 'live'],
      index: true,
    },
    {
      name: 'quality',
      type: 'select',
      required: true,
      defaultValue: 'unverified',
      options: ['unverified', 'estimated'],
    },
    {
      name: 'receivedAt',
      type: 'date',
      required: true,
      index: true,
    },
  ],
}
