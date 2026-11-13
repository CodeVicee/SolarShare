import type { NextRequest } from 'next/server'
import { verifyPaystackWebhook } from '@/server/commerce/paystack'
import { verifyAndRecordPayment } from '@/server/commerce/service'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  if (!verifyPaystackWebhook(rawBody, request.headers.get('x-paystack-signature'))) {
    return Response.json({ error: { code: 'INVALID_SIGNATURE' } }, { status: 401 })
  }
  try {
    const event = JSON.parse(rawBody) as {
      event?: string
      data?: { reference?: string; transaction_reference?: string }
    }
    const reference = event.data?.reference || event.data?.transaction_reference
    const paymentEvents = new Set([
      'charge.success',
      'charge.failed',
      'refund.processed',
      'refund.failed',
      'charge.dispute.create',
    ])
    if (event.event && paymentEvents.has(event.event) && reference) {
      await verifyAndRecordPayment(reference)
    }
    return Response.json({ received: true })
  } catch {
    return Response.json({ error: { code: 'WEBHOOK_PROCESSING_FAILED' } }, { status: 400 })
  }
}
