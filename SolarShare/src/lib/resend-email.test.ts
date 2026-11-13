import { afterEach, describe, expect, it, vi } from 'vitest'
import { resendEmailAdapter, TransactionalEmailError } from './resend-email'

const previousKey = process.env.RESEND_API_KEY
const previousFrom = process.env.EMAIL_FROM_ADDRESS

afterEach(() => {
  vi.unstubAllGlobals()
  if (previousKey === undefined) delete process.env.RESEND_API_KEY
  else process.env.RESEND_API_KEY = previousKey
  if (previousFrom === undefined) delete process.env.EMAIL_FROM_ADDRESS
  else process.env.EMAIL_FROM_ADDRESS = previousFrom
})

const adapter = () => (resendEmailAdapter as any)({})
const message = {
  to: 'recipient@example.test',
  subject: 'Test',
  html: '<p>Test</p>',
}

describe('Resend email adapter', () => {
  it('reports missing configuration without attempting delivery', async () => {
    delete process.env.RESEND_API_KEY
    delete process.env.EMAIL_FROM_ADDRESS
    await expect(adapter().sendEmail(message)).rejects.toMatchObject({
      reason: 'not-configured',
    })
  })

  it('accepts a successful response even when metadata is not JSON', async () => {
    process.env.RESEND_API_KEY = 'test-only-key'
    process.env.EMAIL_FROM_ADDRESS = 'sender@example.test'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 202 })))
    await expect(adapter().sendEmail(message)).resolves.toEqual({ status: 202 })
  })

  it('returns a sanitized provider rejection', async () => {
    process.env.RESEND_API_KEY = 'test-only-key'
    process.env.EMAIL_FROM_ADDRESS = 'sender@example.test'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('sensitive provider detail', { status: 403 })),
    )
    await expect(adapter().sendEmail(message)).rejects.toEqual(
      expect.objectContaining<Partial<TransactionalEmailError>>({
        reason: 'provider-rejected',
        message: 'The transactional email provider rejected the message (403).',
      }),
    )
  })

  it('identifies the Figma preview outbound-network rejection', async () => {
    process.env.RESEND_API_KEY = 'test-only-key'
    process.env.EMAIL_FROM_ADDRESS = 'sender@example.test'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('Origin is disallowed', { status: 520 })),
    )
    await expect(adapter().sendEmail(message)).rejects.toEqual(
      expect.objectContaining<Partial<TransactionalEmailError>>({
        reason: 'runtime-blocked',
        message:
          'Outbound email is unavailable in the Figma preview runtime. Use the published application to request this email.',
      }),
    )
  })
})
