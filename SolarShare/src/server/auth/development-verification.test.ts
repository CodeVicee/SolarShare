import { describe, expect, it, vi } from 'vitest'
import {
  DevelopmentVerificationError,
  developmentVerificationAvailable,
  verifyDevelopmentTestAccount,
} from './development-verification'

const secret = 'test-only-secret-that-is-longer-than-32-characters'
const email = 'authorized-test@example.test'
const enabled = {
  NODE_ENV: 'test',
  AUTH_TEST_VERIFICATION_ENABLED: 'true',
  AUTH_TEST_VERIFICATION_EMAILS: email,
  AUTH_TEST_VERIFICATION_SECRET: secret,
}

const payload = (verified = false) => ({
  find: vi.fn().mockResolvedValue({
    docs: [{ _verified: verified, _verificationToken: verified ? null : 'server-only-token' }],
  }),
  verifyEmail: vi.fn().mockResolvedValue(true),
})

describe('development-only account verification', () => {
  it('uses Payload verification for an explicitly authorized test account', async () => {
    const client = payload()
    await expect(
      verifyDevelopmentTestAccount({
        payload: client,
        email,
        providedSecret: secret,
        env: enabled,
      }),
    ).resolves.toEqual({ verified: true, alreadyVerified: false })
    expect(client.verifyEmail).toHaveBeenCalledWith({
      collection: 'users',
      token: 'server-only-token',
    })
  })

  it('cannot be activated in production even when every test variable is present', async () => {
    const env = { ...enabled, NODE_ENV: 'production' }
    expect(developmentVerificationAvailable(env)).toBe(false)
    await expect(
      verifyDevelopmentTestAccount({
        payload: payload(),
        email,
        providedSecret: secret,
        env,
      }),
    ).rejects.toMatchObject<Partial<DevelopmentVerificationError>>({ status: 404 })
  })

  it('rejects missing secrets and accounts outside the server allowlist', async () => {
    await expect(
      verifyDevelopmentTestAccount({
        payload: payload(),
        email,
        providedSecret: '',
        env: enabled,
      }),
    ).rejects.toMatchObject<Partial<DevelopmentVerificationError>>({ status: 401 })
    await expect(
      verifyDevelopmentTestAccount({
        payload: payload(),
        email: 'ordinary-user@example.test',
        providedSecret: secret,
        env: enabled,
      }),
    ).rejects.toMatchObject<Partial<DevelopmentVerificationError>>({ status: 403 })
  })

  it('prefers recovery-specific credentials when configured', async () => {
    const recoverySecret = 'recovery-secret-that-is-longer-than-32-characters'
    const recoveryEmail = 'recovery-account@example.test'
    const client = payload()
    await expect(
      verifyDevelopmentTestAccount({
        payload: client,
        email: recoveryEmail,
        providedSecret: recoverySecret,
        env: {
          ...enabled,
          AUTH_TEST_RECOVERY_EMAILS: recoveryEmail,
          AUTH_TEST_RECOVERY_SECRET: recoverySecret,
        },
      }),
    ).resolves.toEqual({ verified: true, alreadyVerified: false })
  })

  it('prefers the replacement recovery secret over an invalid earlier value', async () => {
    const replacementSecret = 'replacement-secret-that-is-longer-than-32-characters'
    await expect(
      verifyDevelopmentTestAccount({
        payload: payload(),
        email,
        providedSecret: replacementSecret,
        env: {
          ...enabled,
          AUTH_TEST_RECOVERY_SECRET: 'too-short',
          AUTH_TEST_RECOVERY_SECRET_V2: replacementSecret,
        },
      }),
    ).resolves.toEqual({ verified: true, alreadyVerified: false })
  })

  it('prefers the replacement recovery allowlist over an earlier value', async () => {
    await expect(
      verifyDevelopmentTestAccount({
        payload: payload(),
        email,
        providedSecret: secret,
        env: {
          ...enabled,
          AUTH_TEST_RECOVERY_EMAILS: 'incorrect@example.test',
          AUTH_TEST_RECOVERY_EMAILS_V2: email,
        },
      }),
    ).resolves.toEqual({ verified: true, alreadyVerified: false })
  })

  it('does not re-verify an already verified test account', async () => {
    const client = payload(true)
    await expect(
      verifyDevelopmentTestAccount({
        payload: client,
        email,
        providedSecret: secret,
        env: enabled,
      }),
    ).resolves.toEqual({ verified: true, alreadyVerified: true })
    expect(client.verifyEmail).not.toHaveBeenCalled()
  })
})
