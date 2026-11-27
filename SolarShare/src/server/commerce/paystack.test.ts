import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
  verifyPaystackWebhook,
} from './paystack'

const TEST_SECRET = 'sk_test_solarshare_unit_test'

function mockResponse(data: unknown, status = 200) {
  return new Response(
    JSON.stringify({
      status: status >= 200 && status < 300,
      message: status >= 400 ? 'Paystack test error' : 'Success',
      data,
    }),
    { status, headers: { 'Content-Type': 'application/json' } },
  )
}

describe('Paystack adapter', () => {
  beforeEach(() => {
    vi.stubEnv('PAYSTACK_SECRET_KEY', TEST_SECRET)
    vi.stubEnv('PAYSTACK_ALLOW_LIVE', 'false')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('initializes an NGN checkout with the supplied amount, reference and metadata', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({
        authorization_url: 'https://checkout.example/test',
        access_code: 'test-access-code',
        reference: 'SSPAY-TEST-001',
      }),
    )

    const result = await initializePaystackTransaction({
      email: 'customer@example.com',
      amountKobo: 500_000,
      reference: 'SSPAY-TEST-001',
      callbackURL: 'https://solarshare.example/payment/callback',
      metadata: { solarshareCustomerID: 'customer-1' },
    })

    expect(result.reference).toBe('SSPAY-TEST-001')
    expect(result.authorization_url).toContain('checkout.example')

    const [url, options] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('https://api.paystack.co/transaction/initialize')
    expect(options?.method).toBe('POST')
    expect(new Headers(options?.headers).get('Authorization')).toBe(`Bearer ${TEST_SECRET}`)

    const body = JSON.parse(String(options?.body))
    expect(body).toMatchObject({
      email: 'customer@example.com',
      amount: 500_000,
      currency: 'NGN',
      reference: 'SSPAY-TEST-001',
      callback_url: 'https://solarshare.example/payment/callback',
      metadata: { solarshareCustomerID: 'customer-1' },
    })
  })

  it('verifies a transaction using an encoded reference', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({
        status: 'success',
        reference: 'SS/REF 1',
        amount: 500_000,
        currency: 'NGN',
      }),
    )

    const result = await verifyPaystackTransaction('SS/REF 1')

    expect(result.reference).toBe('SS/REF 1')
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe(
      'https://api.paystack.co/transaction/verify/SS%2FREF%201',
    )
  })

  it('accepts a valid SHA-512 webhook signature', () => {
    const rawBody = '{"event":"charge.success","data":{"reference":"SSPAY-TEST-001"}}'
    const signature = createHmac('sha512', TEST_SECRET).update(rawBody).digest('hex')

    expect(verifyPaystackWebhook(rawBody, signature)).toBe(true)
  })

  it('rejects missing and incorrect webhook signatures', () => {
    const rawBody = '{"event":"charge.success"}'

    expect(verifyPaystackWebhook(rawBody, null)).toBe(false)
    expect(verifyPaystackWebhook(rawBody, 'incorrect-signature')).toBe(false)
  })

  it('rejects requests when the Paystack secret is missing', async () => {
    vi.stubEnv('PAYSTACK_SECRET_KEY', '')

    await expect(
      verifyPaystackTransaction('SSPAY-TEST-001'),
    ).rejects.toThrow('Paystack is not configured.')

    expect(fetch).not.toHaveBeenCalled()
  })

  it('blocks live Paystack keys unless live payments are explicitly enabled', async () => {
    vi.stubEnv('PAYSTACK_SECRET_KEY', 'sk_live_test_only')
    vi.stubEnv('PAYSTACK_ALLOW_LIVE', 'false')

    await expect(
      verifyPaystackTransaction('SSPAY-TEST-001'),
    ).rejects.toThrow('Live Paystack charges are disabled.')

    expect(fetch).not.toHaveBeenCalled()
  })

  it('handles Paystack provider errors', async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({}, 400))

    await expect(
      verifyPaystackTransaction('SSPAY-TEST-001'),
    ).rejects.toThrow('Paystack test error')
  })
})
