import { getCurrentAppUser } from '@/lib/app-auth'
import { getPaymentReceipt } from '@/server/commerce/service'

const escapeHTML = (value: unknown) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const relationshipName = (value: unknown) => {
  if (!value || typeof value !== 'object') return 'SolarShare member'
  const firstName = 'firstName' in value ? String(value.firstName || '') : ''
  const lastName = 'lastName' in value ? String(value.lastName || '') : ''
  return `${firstName} ${lastName}`.trim() || 'SolarShare member'
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAppUser()
  if (!user) return Response.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  try {
    const { id } = await context.params
    const payment = await getPaymentReceipt(user, id)
    const reference = escapeHTML(payment.reference)
    const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>SolarShare receipt ${reference}</title></head>
  <body>
    <main>
      <h1>SolarShare payment receipt</h1>
      <p>Reference: <strong>${reference}</strong></p>
      <p>Status: <strong>${escapeHTML(payment.status)}</strong></p>
      <p>Customer: ${escapeHTML(relationshipName(payment.customer))}</p>
      <p>Solar Owner: ${escapeHTML(relationshipName(payment.solarOwner))}</p>
      <p>Amount: NGN ${(payment.amountKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
      <p>Tariff captured at initiation: NGN ${payment.tariffNairaPerKWh}/kWh</p>
      <p>Energy equivalent: ${payment.energyKWh} kWh</p>
      <p>Paid at: ${escapeHTML(payment.paidAt)}</p>
      <p>Provider reference: ${escapeHTML(payment.providerReference)}</p>
      <hr>
      <p>This receipt confirms payment only. Energy credit is recorded separately after Solar Owner allocation approval.</p>
    </main>
  </body>
</html>`
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="solarshare-${payment.reference}.html"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    return Response.json(
      {
        error: {
          code: 'RECEIPT_UNAVAILABLE',
          message: error instanceof Error ? error.message : 'Receipt unavailable.',
        },
      },
      { status: 404 },
    )
  }
}
