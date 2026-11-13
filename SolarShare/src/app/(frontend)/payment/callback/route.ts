import type { NextRequest } from 'next/server'
import { verifyAndRecordPayment } from '@/server/commerce/service'

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference')
  if (!reference) {
    return new Response(null, {
      status: 302,
      headers: { location: '/app/payments?payment=missing' },
    })
  }
  try {
    const payment = await verifyAndRecordPayment(reference)
    const status = payment.status === 'successful' ? 'verified' : payment.status
    return new Response(null, {
      status: 302,
      headers: { location: `/app/payments?payment=${encodeURIComponent(status)}` },
    })
  } catch {
    return new Response(null, {
      status: 302,
      headers: { location: '/app/payments?payment=failed' },
    })
  }
}
