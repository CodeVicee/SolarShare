import type { CollectionConfig, CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload'

const isPayloadAdmin = (user: unknown) =>
  Boolean(user && typeof user === 'object' && 'collection' in user && user.collection === 'admins')

const protectWorkflowFields: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create') {
    return {
      ...data,
      status: 'pending',
      reviewedAt: undefined,
      reviewedBy: undefined,
    }
  }

  if (data.status !== undefined && data.status !== originalDoc?.status) {
    if (!isPayloadAdmin(req.user)) throw new Error('Only administrators can review owner applications.')
    if (originalDoc?.status !== 'pending') {
      throw new Error('A reviewed owner application cannot be reviewed again.')
    }
    return {
      ...data,
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user?.id,
    }
  }
  return data
}

export const grantApprovedOwnerAccess: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== 'update' || doc.status !== 'approved' || previousDoc?.status === 'approved') {
    return doc
  }
  if (!isPayloadAdmin(req.user)) throw new Error('Only administrators can approve owner applications.')

  const userID = typeof doc.user === 'object' ? doc.user.id : doc.user
  const user = await req.payload.findByID({
    collection: 'users',
    id: userID,
    depth: 0,
    overrideAccess: true,
    req,
  })
  await req.payload.update({
    collection: 'users',
    id: user.id,
    data: { roles: ['solar-owner'] },
    depth: 0,
    overrideAccess: true,
    req,
  })

  const existingProfiles = await req.payload.find({
    collection: 'solar-owner-profiles',
    where: { solarOwner: { equals: user.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  if (!existingProfiles.totalDocs) {
    await req.payload.create({
      collection: 'solar-owner-profiles',
      data: {
        solarOwner: user.id,
        displayName: `${user.firstName} ${user.lastName}`.trim(),
        status: 'active',
      },
      depth: 0,
      overrideAccess: true,
      req,
    })
  }
  return doc
}

export const SolarOwnerApplications: CollectionConfig = {
  slug: 'solar-owner-applications',
  admin: {
    group: 'Onboarding',
    useAsTitle: 'applicantName',
    defaultColumns: ['applicantName', 'applicantEmail', 'city', 'installationCapacityKW', 'status'],
    description: 'Review public Solar Owner applications. Approval grants the owner role through trusted server hooks.',
  },
  access: {
    create: ({ req }) => isPayloadAdmin(req.user),
    read: ({ req }) => isPayloadAdmin(req.user),
    update: ({ req }) => isPayloadAdmin(req.user),
    delete: ({ req }) => isPayloadAdmin(req.user),
  },
  hooks: {
    beforeChange: [protectWorkflowFields],
    afterChange: [grantApprovedOwnerAccess],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    { name: 'applicantName', type: 'text', required: true },
    { name: 'applicantEmail', type: 'email', required: true, index: true },
    { name: 'applicantPhone', type: 'text', required: true },
    { name: 'businessName', type: 'text' },
    { name: 'installationAddress', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        { name: 'state', type: 'text', required: true },
        { name: 'city', type: 'text', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'installationCapacityKW', type: 'number', required: true, min: 0.1 },
        { name: 'batteryCapacityKWh', type: 'number', min: 0 },
      ],
    },
    { name: 'installationDetails', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: ['pending', 'approved', 'rejected'],
      admin: { position: 'sidebar' },
      access: {
        create: () => false,
        update: ({ req }) => isPayloadAdmin(req.user),
      },
    },
    {
      name: 'reviewNotes',
      type: 'textarea',
      access: {
        create: () => false,
        update: ({ req }) => isPayloadAdmin(req.user),
      },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
      access: { create: () => false, update: () => false },
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'admins',
      admin: { position: 'sidebar', readOnly: true },
      access: { create: () => false, update: () => false },
    },
  ],
  versions: false,
}
