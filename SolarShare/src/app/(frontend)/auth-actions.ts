'use server'

import crypto from 'node:crypto'
import config from '@payload-config'
import { getPayload } from 'payload'
import {
  clearAppSession,
  getCurrentAppUser,
  setAppSession,
  toPublicUser,
  type PublicAppUser,
} from '@/lib/app-auth'
import { getVerificationURL } from '@/lib/auth-email'
import { TransactionalEmailError } from '@/lib/resend-email'
import { authenticatePayloadUser } from '@/server/auth/login'
import { lookupRegistrationCode, requestCustomerConnection } from '@/server/commerce/service'
import type { User } from '@/payload-types'
const emailVerificationEnabled =
  process.env.EMAIL_VERIFICATION_ENABLED !== 'false'

export type ActionState = {
  ok: boolean
  message?: string
  fieldErrors?: Record<string, string>
  user?: PublicAppUser
  requiresVerification?: boolean
  applicationPending?: boolean
  connectionRequested?: boolean
}

const clean = (value: FormDataEntryValue | null) => String(value || '').trim()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[+()\-\s\d]{7,24}$/
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$/

const emailFailureReason = (error: unknown) => {
  let current: unknown = error
  for (let depth = 0; depth < 4 && current; depth += 1) {
    if (current instanceof TransactionalEmailError) return current.reason
    const message =
      typeof current === 'string'
        ? current
        : typeof current === 'object' && 'message' in current
          ? String(current.message)
          : ''
    if (/not configured/i.test(message)) return 'not-configured'
    if (/provider rejected/i.test(message)) return 'provider-rejected'
    if (/provider is unavailable/i.test(message)) return 'provider-unavailable'
    if (/origin is disallowed|preview runtime/i.test(message)) return 'runtime-blocked'
    if (/application url/i.test(message)) return 'application-url'
    current = typeof current === 'object' && 'cause' in current ? current.cause : null
  }
  return 'unknown-email-failure'
}

const emailFailureMessage = (error: unknown) =>
  error instanceof TransactionalEmailError
    ? error.message
    : 'The verification email could not be delivered.'

const fullNameParts = (value: string) => {
  const parts = value.split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  }
}

const registrationIdentity = (formData: FormData) => {
  const fullName = clean(formData.get('fullName'))
  const { firstName, lastName } = fullNameParts(fullName)
  const email = clean(formData.get('email')).toLowerCase()
  const phone = clean(formData.get('phone'))
  const password = clean(formData.get('password'))
  const confirmPassword = clean(formData.get('confirmPassword'))
  const termsAccepted = formData.get('termsAccepted') === 'on'
  const fieldErrors: Record<string, string> = {}

  if (firstName.length < 2 || lastName.length < 2) {
    fieldErrors.fullName = 'Enter your first and last name.'
  }
  if (!emailPattern.test(email)) fieldErrors.email = 'Enter a valid email address.'
  if (!phonePattern.test(phone)) fieldErrors.phone = 'Enter a valid phone number.'
  if (!strongPassword.test(password)) {
    fieldErrors.password = 'Use 10+ characters with upper, lower, number and symbol.'
  }
  if (password !== confirmPassword) fieldErrors.confirmPassword = 'Passwords do not match.'
  if (!termsAccepted) fieldErrors.termsAccepted = 'Accept the terms and privacy policy.'
  return {
    firstName,
    lastName,
    fullName,
    email,
    phone,
    password,
    termsAccepted,
    fieldErrors,
  }
}

async function createRegistrationUser(
  payload: Awaited<ReturnType<typeof getPayload>>,
  input: ReturnType<typeof registrationIdentity>,
  role: 'customer' | 'solar-owner' | 'solar-owner-applicant',
) {
  try {
    const user = await payload.create({
      collection: 'users',
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        password: input.password,
        termsAccepted: input.termsAccepted,
        accountStatus: 'active',
        authProvider: 'payload-native',
        roles: [role],
      },
      overrideAccess: true,
    })
    return { user, deliveryFailure: null as string | null }
  } catch (error) {
    const persisted = await payload.find({
      collection: 'users',
      where: { email: { equals: input.email } },
      limit: 1,
      overrideAccess: true,
    })
    if (!persisted.docs[0]) throw error
    return { user: persisted.docs[0], deliveryFailure: emailFailureReason(error) }
  }
}

const verificationMessage = (deliveryFailure: string | null, suffix = '') => {
  const base =
    deliveryFailure === 'runtime-blocked'
      ? 'Your account was created, but the Figma preview cannot send email. Use the published application to resend verification.'
      : deliveryFailure
        ? 'Your account was created, but the verification email could not be delivered. Use the resend form.'
        : 'Account created. Check your email to verify your SolarShare account.'
  return suffix ? `${base} ${suffix}` : base
}

async function ensureEmailAvailable(
  payloadClient: Awaited<ReturnType<typeof getPayload>>,
  email: string,
) {
  const existing = await payloadClient.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  return existing.totalDocs === 0
}

export async function registerCustomerAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const input = registrationIdentity(formData)
  const connectionCode = clean(formData.get('connectionCode')).toUpperCase()
  if (Object.keys(input.fieldErrors).length) return { ok: false, fieldErrors: input.fieldErrors }

  const payload = await getPayload({ config })
  if (!(await ensureEmailAvailable(payload, input.email))) {
    return { ok: false, fieldErrors: { email: 'An account already exists for this email.' } }
  }
  if (connectionCode) {
    try {
      await lookupRegistrationCode(connectionCode)
    } catch {
      return {
        ok: false,
        fieldErrors: { connectionCode: 'Enter a valid Solar Owner connection code.' },
      }
    }
  }
  try {
    const { user, deliveryFailure } = await createRegistrationUser(payload, input, 'customer')
    if (connectionCode) await requestCustomerConnection(user as User, connectionCode)
    return {
  ok: true,
  requiresVerification: emailVerificationEnabled,
  connectionRequested: Boolean(connectionCode),
  message: emailVerificationEnabled
    ? verificationMessage(
        deliveryFailure,
        connectionCode
          ? 'Your connection request is pending Solar Owner approval.'
          : 'You can connect to a Solar Owner after verification.',
      )
    : connectionCode
      ? 'Your account has been created. Your connection request is pending Solar Owner approval.'
      : 'Your account has been created. You can now sign in.',
}
  } catch (error) {
    console.error('[auth] registration failed before persistence', {
      reason: emailFailureReason(error),
    })
    return {
      ok: false,
      message:
        error instanceof TransactionalEmailError
          ? `${emailFailureMessage(error)} Your account was not created. Please try again.`
          : 'We could not create your account. Please try again.',
    }
  }
}

export async function registerSolarOwnerAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const input = registrationIdentity(formData)
  const businessName = clean(formData.get('businessName')).slice(0, 120)
  const installationAddress = clean(formData.get('installationAddress')).slice(0, 240)
  const state = clean(formData.get('state')).slice(0, 80)
  const city = clean(formData.get('city')).slice(0, 80)
  const installationCapacityKW = Number(clean(formData.get('installationCapacityKW')))
  const batteryRaw = clean(formData.get('batteryCapacityKWh'))
  const batteryCapacityKWh = batteryRaw ? Number(batteryRaw) : undefined
  const installationDetails = clean(formData.get('installationDetails')).slice(0, 2000)

  if (installationAddress.length < 8)
    input.fieldErrors.installationAddress = 'Enter the installation address.'
  if (state.length < 2) input.fieldErrors.state = 'Enter the state.'
  if (city.length < 2) input.fieldErrors.city = 'Enter the city.'
  if (!Number.isFinite(installationCapacityKW) || installationCapacityKW <= 0) {
    input.fieldErrors.installationCapacityKW = 'Enter a capacity greater than zero.'
  }
  if (
    batteryCapacityKWh !== undefined &&
    (!Number.isFinite(batteryCapacityKWh) || batteryCapacityKWh < 0)
  ) {
    input.fieldErrors.batteryCapacityKWh = 'Battery capacity cannot be negative.'
  }
  if (installationDetails.length < 10) {
    input.fieldErrors.installationDetails = 'Describe the existing solar installation.'
  }
  if (Object.keys(input.fieldErrors).length) return { ok: false, fieldErrors: input.fieldErrors }

  const payload = await getPayload({ config })
  if (!(await ensureEmailAvailable(payload, input.email))) {
    return { ok: false, fieldErrors: { email: 'An account already exists for this email.' } }
  }

  try {
    const { user, deliveryFailure } = await createRegistrationUser(
      payload,
      input,
      'solar-owner',
    )
       await payload.create({
      collection: 'solar-owner-applications',
      data: {
        user: user.id,
        applicantName: input.fullName,
        applicantEmail: input.email,
        applicantPhone: input.phone,
        businessName: businessName || undefined,
        installationAddress,
        state,
        city,
        installationCapacityKW,
        batteryCapacityKWh,
        installationDetails,
        status: 'approved',
      },
      draft: false,
      overrideAccess: true,
      context: {
        solarOwnerRegistration: true,
      },
    })

    await payload.create({
      collection: 'solar-owner-profiles',
      data: {
        solarOwner: user.id,
        displayName: input.fullName,
        status: 'active',
      },
      overrideAccess: true,
    })

    return {
      ok: true,
      requiresVerification: emailVerificationEnabled,
      message: emailVerificationEnabled
        ? verificationMessage(
            deliveryFailure,
            'Your Solar Owner account has been approved. Verify your email to sign in.',
          )
        : 'Your Solar Owner account has been created and approved. You can now sign in.',
    }
  } catch (error) {
    console.error('[auth] owner application failed', { reason: emailFailureReason(error) })
    return {
      ok: false,
      message: 'We could not submit your Solar Owner application. Please try again.',
    }
  }
}

export async function registerAction(state: ActionState, formData: FormData) {
  return registerCustomerAction(state, formData)
}

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = clean(formData.get('email')).toLowerCase()
  const password = clean(formData.get('password'))
  const remember = formData.get('remember') === 'on'
  const fieldErrors: Record<string, string> = {}
  if (!emailPattern.test(email)) fieldErrors.email = 'Enter a valid email address.'
  if (!password) fieldErrors.password = 'Enter your password.'
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors }

  try {
    const payload = await getPayload({ config })
    const result = await authenticatePayloadUser(payload, email, password)
    if (result.status === 'authenticated') {
      const publicUser = toPublicUser(result.user)
      if (publicUser.roles.includes('solar-owner-applicant')) {
        const applications = await payload.find({
          collection: 'solar-owner-applications',
          where: { user: { equals: publicUser.id } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        const status = applications.docs[0]?.status
        return {
          ok: false,
          applicationPending: true,
          message:
            status === 'rejected'
              ? 'Your Solar Owner application was not approved. Contact SolarShare support before reapplying.'
              : 'Your Solar Owner application is still awaiting administrator approval.',
        }
      }
      await setAppSession(result.token, remember, result.exp)
      return { ok: true, user: publicUser, message: 'Secure login successful.' }
    }
    if (result.status === 'unverified') {
      return {
        ok: false,
        requiresVerification: true,
        message: 'Verify your email before signing in.',
      }
    }
    if (result.status === 'locked') {
      return { ok: false, message: 'Too many failed attempts. Try again in 15 minutes.' }
    }
    if (result.status === 'unavailable') {
      return { ok: false, message: 'Unable to start a secure session.' }
    }
    return { ok: false, message: 'Email or password is incorrect.' }
  } catch {
    return { ok: false, message: 'Unable to start a secure session.' }
  }
}

export async function logoutAction(): Promise<ActionState> {
  await clearAppSession()
  return { ok: true, message: 'You have been signed out securely.' }
}

export async function forgotPasswordAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = clean(formData.get('email')).toLowerCase()
  if (!emailPattern.test(email))
    return { ok: false, fieldErrors: { email: 'Enter a valid email address.' } }
  try {
    const payload = await getPayload({ config })
    await payload.forgotPassword({ collection: 'users', data: { email }, overrideAccess: true })
  } catch {
    // Keep the response indistinguishable so account existence is not disclosed.
  }
  return {
    ok: true,
    message: 'If an account exists, a secure password reset link has been sent.',
  }
}

export async function resetPasswordAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = clean(formData.get('token'))
  const password = clean(formData.get('password'))
  const confirmPassword = clean(formData.get('confirmPassword'))
  const fieldErrors: Record<string, string> = {}
  if (!token) return { ok: false, message: 'This reset link is missing or invalid.' }
  if (!strongPassword.test(password)) {
    fieldErrors.password = 'Use 10+ characters with upper, lower, number and symbol.'
  }
  if (password !== confirmPassword) fieldErrors.confirmPassword = 'Passwords do not match.'
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors }

  try {
    const payload = await getPayload({ config })
    await payload.resetPassword({
      collection: 'users',
      data: { token, password },
      overrideAccess: true,
    })
    return { ok: true, message: 'Your password has been reset. You can now sign in.' }
  } catch {
    return { ok: false, message: 'This reset link is invalid or has expired.' }
  }
}

export async function verifyEmailToken(token: string): Promise<ActionState> {
  if (!token) return { ok: false, message: 'This verification link is missing or invalid.' }
  try {
    const payload = await getPayload({ config })
    const verified = await payload.verifyEmail({ collection: 'users', token })
    return verified
      ? { ok: true, message: 'Your email is verified. You can now sign in.' }
      : { ok: false, message: 'This verification link is invalid or has expired.' }
  } catch {
    return { ok: false, message: 'This verification link is invalid or has expired.' }
  }
}

export async function resendVerificationAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = clean(formData.get('email')).toLowerCase()
  if (!emailPattern.test(email))
    return { ok: false, fieldErrors: { email: 'Enter a valid email address.' } }
  let stage = 'lookup'
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
      showHiddenFields: true,
    })
    const user = result.docs[0] as any
    if (user && user._verified !== true) {
      const last = user.lastVerificationSentAt ? new Date(user.lastVerificationSentAt).getTime() : 0
      if (Date.now() - last >= 60_000) {
        const token = crypto.randomBytes(20).toString('hex')
        stage = 'token-update'
        await payload.update({
          collection: 'users',
          id: user.id,
          data: { _verificationToken: token } as any,
          overrideAccess: true,
        })
        stage = 'email-url'
        const verificationURL = getVerificationURL(token)
        stage = 'email-send'
        await payload.sendEmail({
          to: email,
          subject: 'Verify your SolarShare account',
          html: `<p>Hello ${user.firstName || 'there'},</p><p><a href="${verificationURL}">Verify your SolarShare email</a></p>`,
        })
        stage = 'cooldown-update'
        await payload.update({
          collection: 'users',
          id: user.id,
          data: { lastVerificationSentAt: new Date().toISOString() },
          overrideAccess: true,
        })
      }
    }
    return { ok: true, message: 'If verification is pending, a new email has been sent.' }
  } catch (error) {
    console.error('[auth] verification resend failed', {
      reason: emailFailureReason(error),
      stage,
    })
    return {
      ok: false,
      message: `${emailFailureMessage(error)} Please try again or contact support.`,
    }
  }
}

export async function updateProfileAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentAppUser()
  if (!user || user.collection !== 'users')
    return { ok: false, message: 'Your session expired. Sign in again.' }
  const firstName = clean(formData.get('firstName'))
  const lastName = clean(formData.get('lastName'))
  const phone = clean(formData.get('phone'))
  const theme = clean(formData.get('theme'))
  const fieldErrors: Record<string, string> = {}
  if (firstName.length < 2) fieldErrors.firstName = 'Enter your first name.'
  if (lastName.length < 2) fieldErrors.lastName = 'Enter your last name.'
  if (!phonePattern.test(phone)) fieldErrors.phone = 'Enter a valid phone number.'
  if (!['system', 'light', 'dark'].includes(theme)) fieldErrors.theme = 'Select a valid theme.'
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors }

  const payload = await getPayload({ config })
  const avatar = formData.get('avatar')
 let avatarID: number | undefined
  if (avatar instanceof File && avatar.size > 0) {
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(avatar.type) ||
      avatar.size > 5_000_000
    ) {
      return { ok: false, fieldErrors: { avatar: 'Use a JPG, PNG or WebP image under 5 MB.' } }
    }
    const uploaded = await payload.create({
      collection: 'profile-images',
      data: { alt: `${firstName} ${lastName} profile picture`, owner: user.id },
      file: {
        data: Buffer.from(await avatar.arrayBuffer()),
        mimetype: avatar.type,
        name: avatar.name,
        size: avatar.size,
      },
      user,
      overrideAccess: false,
    })
    avatarID = uploaded.id
  }
  const updated = await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      firstName,
      lastName,
      phone,
      theme: theme as 'system' | 'light' | 'dark',
      ...(avatarID !== undefined ? { avatar: avatarID } : {}),
      notificationPreferences: {
        emailAlerts: formData.get('emailAlerts') === 'on',
        systemAlerts: formData.get('systemAlerts') === 'on',
        sharingUpdates: formData.get('sharingUpdates') === 'on',
        weeklySummary: formData.get('weeklySummary') === 'on',
      },
    },
    user,
    overrideAccess: false,
  })
  return { ok: true, user: toPublicUser(updated), message: 'Profile preferences saved.' }
}

export async function changePasswordAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentAppUser()
  if (!user || user.collection !== 'users')
    return { ok: false, message: 'Your session expired. Sign in again.' }
  const currentPassword = clean(formData.get('currentPassword'))
  const password = clean(formData.get('password'))
  const confirmPassword = clean(formData.get('confirmPassword'))
  if (!strongPassword.test(password)) {
    return {
      ok: false,
      fieldErrors: { password: 'Use 10+ characters with upper, lower, number and symbol.' },
    }
  }
  if (password !== confirmPassword) {
    return { ok: false, fieldErrors: { confirmPassword: 'Passwords do not match.' } }
  }
  const payload = await getPayload({ config })
  try {
    await payload.login({
      collection: 'users',
      data: { email: user.email, password: currentPassword },
      overrideAccess: true,
    })
  } catch {
    return { ok: false, fieldErrors: { currentPassword: 'Current password is incorrect.' } }
  }
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { password },
    user,
    overrideAccess: false,
  })
  await clearAppSession()
  return { ok: true, message: 'Password changed. Sign in again with your new password.' }
}

export async function updateEmailAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentAppUser()
  if (!user || user.collection !== 'users')
    return { ok: false, message: 'Your session expired. Sign in again.' }
  const email = clean(formData.get('email')).toLowerCase()
  const currentPassword = clean(formData.get('currentPassword'))
  if (!emailPattern.test(email))
    return { ok: false, fieldErrors: { email: 'Enter a valid email address.' } }
  if (email === user.email)
    return { ok: false, fieldErrors: { email: 'Enter a different email address.' } }
  const payload = await getPayload({ config })
  try {
    await payload.login({
      collection: 'users',
      data: { email: user.email, password: currentPassword },
      overrideAccess: true,
    })
  } catch {
    return { ok: false, fieldErrors: { currentPassword: 'Current password is incorrect.' } }
  }
  const duplicate = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  if (duplicate.totalDocs)
    return { ok: false, fieldErrors: { email: 'That email is already in use.' } }
  const token = crypto.randomBytes(20).toString('hex')
  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      email,
      _verified: false,
      _verificationToken: token,
      lastVerificationSentAt: new Date().toISOString(),
    } as any,
    overrideAccess: true,
  })
  await payload.sendEmail({
    to: email,
    subject: 'Verify your new SolarShare email',
    html: `<p>Hello ${user.firstName},</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${encodeURIComponent(token)}">Verify your new email address</a></p>`,
  })
  await clearAppSession()
  return { ok: true, message: 'Email updated. Verify the new address, then sign in again.' }
}
