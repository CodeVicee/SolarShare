import type { CollectionConfig } from 'payload'
import { appUserOnly, assignOwner, ownDocument } from '@/lib/access'

export const AppNotifications: CollectionConfig = {
  slug: 'app-notifications',
  admin: { hidden: true },
  access: { create: appUserOnly, read: ownDocument, update: ownDocument, delete: ownDocument },
  hooks: { beforeChange: [assignOwner] },
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
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'system',
      index: true,
      options: ['system', 'energy', 'sharing', 'security', 'account'],
    },
    { name: 'title', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    { name: 'severity', type: 'select', required: true, options: ['info', 'warning', 'critical', 'resolved'] },
    { name: 'readAt', type: 'date' },
  ],
}
