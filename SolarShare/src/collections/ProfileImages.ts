import type { CollectionConfig } from 'payload'
import { appUserOnly, assignOwner, ownDocument } from '@/lib/access'

export const ProfileImages: CollectionConfig = {
  slug: 'profile-images',
  admin: { hidden: true },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  access: {
    create: appUserOnly,
    read: ownDocument,
    update: ownDocument,
    delete: ownDocument,
  },
  hooks: { beforeChange: [assignOwner] },
  fields: [
    { name: 'alt', type: 'text', required: true },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: { create: () => false, update: () => false },
    },
  ],
}
