import { describe, expect, it, vi } from 'vitest'
import { authenticatePayloadUser } from './login'

describe('Payload login outcomes', () => {
  it('does not authenticate an unverified production account', async () => {
    const error = new Error('Verify your email before logging in.')
    error.name = 'UnverifiedEmail'
    const payload = { login: vi.fn().mockRejectedValue(error) }
    await expect(
      authenticatePayloadUser(payload, 'user@example.test', 'password'),
    ).resolves.toEqual({ status: 'unverified' })
  })

  it('authenticates a verified account only when Payload returns a token and user', async () => {
    const user = { id: 'user-id', collection: 'users', _verified: true }
    const payload = {
      login: vi.fn().mockResolvedValue({ token: 'payload-token', user, exp: 1234 }),
    }
    await expect(
      authenticatePayloadUser(payload, 'user@example.test', 'password'),
    ).resolves.toEqual({
      status: 'authenticated',
      token: 'payload-token',
      user,
      exp: 1234,
    })
  })

  it('keeps invalid credentials generic', async () => {
    const payload = { login: vi.fn().mockRejectedValue(new Error('Invalid credentials')) }
    await expect(
      authenticatePayloadUser(payload, 'user@example.test', 'wrong-password'),
    ).resolves.toEqual({ status: 'invalid' })
  })
})
