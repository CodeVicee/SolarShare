import 'server-only'

import config from '@payload-config'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'

export const APP_SESSION_COOKIE = 'app-session'

export type PublicAppUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  theme: 'system' | 'light' | 'dark'
  verified: boolean
  roles: Array<'solar-owner' | 'customer' | 'solar-owner-applicant'>
  avatarURL?: string
  notificationPreferences: {
    emailAlerts: boolean
    systemAlerts: boolean
    sharingUpdates: boolean
    weeklySummary: boolean
  }
}

export async function getCurrentAppUser() {
  const token = (await cookies()).get(APP_SESSION_COOKIE)?.value
  if (!token) return null

  const payload = await getPayload({ config })
  const authHeaders = new Headers({ Authorization: `JWT ${token}` })
  const { user } = await payload.auth({ headers: authHeaders })
  if (!user || user.collection !== 'users') return null
  return user
}

export function toPublicUser(user: any): PublicAppUser {
  const avatar = user.avatar && typeof user.avatar === 'object' ? user.avatar : null
  return {
    id: String(user.id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    theme: user.theme || 'system',
    verified: user._verified === true,
    roles: Array.isArray(user.roles) ? user.roles : ['customer'],
    avatarURL: avatar?.url || undefined,
    notificationPreferences: {
      emailAlerts: user.notificationPreferences?.emailAlerts !== false,
      systemAlerts: user.notificationPreferences?.systemAlerts !== false,
      sharingUpdates: user.notificationPreferences?.sharingUpdates !== false,
      weeklySummary: user.notificationPreferences?.weeklySummary === true,
    },
  }
}

export async function setAppSession(token: string, remember: boolean, exp?: number) {
  const store = await cookies()
  const maxAge = exp ? Math.max(60, exp - Math.floor(Date.now() / 1000)) : remember ? 604800 : undefined
  store.set(APP_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
    priority: 'high',
  })
}

export async function clearAppSession() {
  const store = await cookies()
  store.set(APP_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}
