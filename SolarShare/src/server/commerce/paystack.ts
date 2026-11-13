import { createHmac, timingSafeEqual } from 'node:crypto'
import type { PaystackVerification } from './payment-reconciliation'

const baseURL = 'https://api.paystack.co'

const secretKey = () => {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('Paystack is not configured.')
  if (key.startsWith('sk_live_') && process.env.PAYSTACK_ALLOW_LIVE !== 'true') {
    throw new Error('Live Paystack charges are disabled.')
  }
  return key
}

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseURL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  const body = (await response.json()) as {
    status: boolean
    message: string
    data: T
  }
  if (!response.ok || !body.status) throw new Error(body.message || 'Paystack request failed.')
  return body.data
}

export function initializePaystackTransaction(input: {
  email: string
  amountKobo: number
  reference: string
  callbackURL: string
  metadata: Record<string, string | number>
}) {
  return paystackFetch<{ authorization_url: string; access_code: string; reference: string }>(
    '/transaction/initialize',
    {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        currency: 'NGN',
        reference: input.reference,
        callback_url: input.callbackURL,
        metadata: input.metadata,
      }),
    },
  )
}

export function verifyPaystackTransaction(reference: string) {
  return paystackFetch<PaystackVerification>(`/transaction/verify/${encodeURIComponent(reference)}`)
}

export function verifyPaystackWebhook(rawBody: string, signature: string | null) {
  const expected = createHmac('sha512', secretKey()).update(rawBody).digest('hex')
  if (!signature) return false
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  )
}
