import { Forbidden } from 'payload'
import type { CollectionConfig } from 'payload'
import { ownProfile } from '@/lib/access'
import { getPasswordResetURL, getVerificationURL } from '@/lib/auth-email'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    hidden: true,
    useAsTitle: 'email',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 7 * 24 * 60 * 60,
    useSessions: true,
    verify: {
      generateEmailSubject: () => 'Verify your SolarShare account',
      generateEmailHTML: (args) => {
        const token = args?.token || ''
        const user = args?.user
        return `
          <div style="font-family:Arial,sans-serif;color:#071426;line-height:1.6">
            <h1>Welcome to SolarShare</h1>
            <p>Hello ${user?.firstName || 'there'}, verify your email to activate your secure energy workspace.</p>
            <p><a href="${getVerificationURL(token)}" style="background:#ff8a24;color:#071426;padding:12px 18px;text-decoration:none;font-weight:700">Verify email</a></p>
            <p>If you did not create this account, you can ignore this email.</p>
          </div>
        `
      },
    },
    forgotPassword: {
      expiration: 60 * 60 * 1000,
      minRequestInterval: 60 * 1000,
      generateEmailSubject: () => 'Reset your SolarShare password',
      generateEmailHTML: (args) => {
        const token = args?.token || ''
        const user = args?.user
        return `
          <div style="font-family:Arial,sans-serif;color:#071426;line-height:1.6">
            <h1>Reset your password</h1>
            <p>Hello ${user?.firstName || 'there'}, use the secure link below within one hour.</p>
            <p><a href="${getPasswordResetURL(token)}" style="background:#ff8a24;color:#071426;padding:12px 18px;text-decoration:none;font-weight:700">Create new password</a></p>
            <p>If you did not request this, no action is required.</p>
          </div>
        `
      },
    },
  },
  access: {
    create: () => true,
    read: ownProfile,
    update: ownProfile,
    delete: ownProfile,
  },
  hooks: {
    beforeLogin: [
      ({ user }) => {
        if (user.accountStatus && user.accountStatus !== 'active') throw new Forbidden()
      },
    ],
  },
  fields: [
    { name: 'firstName', type: 'text', required: true, minLength: 2, maxLength: 60 },
    { name: 'lastName', type: 'text', required: true, minLength: 2, maxLength: 60 },
    { name: 'phone', type: 'text', required: true, minLength: 7, maxLength: 24 },
    {
      name: 'accountStatus',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: ['active', 'suspended', 'disabled'],
      access: { create: () => false, update: () => false },
    },
    {
      name: 'authProvider',
      type: 'select',
      required: true,
      defaultValue: 'payload-native',
      options: ['payload-native'],
      access: { create: () => false, update: () => false },
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['customer'],
      options: ['solar-owner', 'customer', 'solar-owner-applicant'],
      access: { create: () => false, update: () => false },
    },
    {
      name: 'avatar',
      type: 'relationship',
      relationTo: 'profile-images',
    },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'system',
      options: ['system', 'light', 'dark'],
    },
    {
      name: 'notificationPreferences',
      type: 'group',
      fields: [
        { name: 'emailAlerts', type: 'checkbox', defaultValue: true },
        { name: 'systemAlerts', type: 'checkbox', defaultValue: true },
        { name: 'sharingUpdates', type: 'checkbox', defaultValue: true },
        { name: 'weeklySummary', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'termsAccepted',
      type: 'checkbox',
      required: true,
      validate: (value) => value === true || 'You must accept the terms and privacy policy.',
    },
    {
      name: 'lastVerificationSentAt',
      type: 'date',
      hidden: true,
      access: { create: () => false, update: () => false, read: () => false },
    },
  ],
  versions: false,
}
