import { describe, expect, it } from 'vitest'
import {
  canReviewAllocation,
  mapPaystackStatus,
  paymentNotificationAudience,
  resolvePaymentStatus,
  shouldCreateAllocation,
  validatePaystackVerification,
  type PaystackVerification,
  type PaymentVerificationSnapshot,
} from './payment-reconciliation'

const payment: PaymentVerificationSnapshot = {
  reference: 'SSPAY-VALID',
  amountKobo: 500_000,
  currency: 'NGN',
  customerID: 'customer-1',
  customerEmail: 'customer@example.com',
  relationshipID: 'relationship-1',
  systemID: 'system-1',
  tariffNairaPerKWh: 100,
}

const verification = (overrides: Partial<PaystackVerification> = {}): PaystackVerification => ({
  status: 'success',
  reference: payment.reference,
  amount: payment.amountKobo,
  currency: 'NGN',
  paid_at: '2026-04-03T10:00:00.000Z',
  customer: { email: payment.customerEmail },
  metadata: {
    solarshareCustomerID: payment.customerID,
    solarshareRelationshipID: payment.relationshipID,
    solarshareSystemID: payment.systemID,
    solarshareTariffNairaPerKWh: payment.tariffNairaPerKWh,
  },
  ...overrides,
})

describe('Paystack payment reconciliation', () => {
  it('accepts a successful verification only when all initiation facts match', () => {
    expect(validatePaystackVerification(payment, verification())).toBe('successful')
  })

  it('rejects invalid references, incorrect amounts, currencies, customers and tariffs', () => {
    expect(() =>
      validatePaystackVerification(payment, verification({ reference: 'UNKNOWN' })),
    ).toThrow('reference mismatch')
    expect(() => validatePaystackVerification(payment, verification({ amount: 499_999 }))).toThrow(
      'amount mismatch',
    )
    expect(() => validatePaystackVerification(payment, verification({ currency: 'USD' }))).toThrow(
      'currency mismatch',
    )
    expect(() =>
      validatePaystackVerification(
        payment,
        verification({ customer: { email: 'other@example.com' } }),
      ),
    ).toThrow('customer mismatch')
    expect(() =>
      validatePaystackVerification(
        payment,
        verification({
          metadata: {
            ...verification().metadata,
            solarshareTariffNairaPerKWh: 99,
          },
        }),
      ),
    ).toThrow('metadata mismatch')
  })

  it('preserves pending, failed, abandoned and reversed provider states', () => {
    expect(mapPaystackStatus('ongoing')).toBe('pending')
    expect(mapPaystackStatus('pending')).toBe('pending')
    expect(mapPaystackStatus('failed')).toBe('failed')
    expect(mapPaystackStatus('abandoned')).toBe('abandoned')
    expect(mapPaystackStatus('reversed')).toBe('reversed')
    expect(mapPaystackStatus('refunded')).toBe('reversed')
    expect(resolvePaymentStatus('successful', 'pending')).toBe('successful')
    expect(resolvePaymentStatus('successful', 'failed')).toBe('successful')
    expect(resolvePaymentStatus('successful', 'reversed')).toBe('reversed')
    expect(resolvePaymentStatus('reversed', 'successful')).toBe('reversed')
  })

  it('creates one pending allocation across duplicate webhooks and repeated callbacks', () => {
    expect(shouldCreateAllocation('successful', false)).toBe(true)
    expect(shouldCreateAllocation('successful', true)).toBe(false)
    expect(shouldCreateAllocation('pending', false)).toBe(false)
    expect(shouldCreateAllocation('failed', false)).toBe(false)
  })

  it('limits allocation review to the owning Solar Owner and pending requests', () => {
    expect(canReviewAllocation('owner-1', 'owner-1', 'pending')).toBe(true)
    expect(canReviewAllocation('owner-2', 'owner-1', 'pending')).toBe(false)
    expect(canReviewAllocation('owner-1', 'owner-1', 'approved')).toBe(false)
    expect(canReviewAllocation('owner-1', 'owner-1', 'rejected')).toBe(false)
  })

  it('plans owner notification for confirmation and reversal without duplicate alerts', () => {
    expect(paymentNotificationAudience('successful', true, true)).toEqual([
      'customer',
      'solarOwner',
    ])
    expect(paymentNotificationAudience('reversed', false, true)).toEqual(['customer', 'solarOwner'])
    expect(paymentNotificationAudience('successful', false, false)).toEqual([])
  })
})
