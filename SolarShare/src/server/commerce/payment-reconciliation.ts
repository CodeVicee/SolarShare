export type LocalPaymentStatus =
  | 'initiated'
  | 'pending'
  | 'successful'
  | 'failed'
  | 'abandoned'
  | 'reversed'
  | 'refunded'

export type PaystackVerification = {
  status: string
  reference: string
  amount: number
  currency: string
  paid_at?: string | null
  channel?: string | null
  gateway_response?: string | null
  customer?: { email?: string | null } | null
  metadata?: Record<string, unknown> | null
}

export type PaymentVerificationSnapshot = {
  reference: string
  amountKobo: number
  currency: 'NGN'
  customerID: string
  customerEmail: string
  relationshipID: string
  systemID: string
  tariffNairaPerKWh: number
}

const metadataText = (metadata: Record<string, unknown> | null | undefined, key: string) => {
  const value = metadata?.[key]
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

export function mapPaystackStatus(status: string): LocalPaymentStatus {
  switch (status.toLowerCase()) {
    case 'success':
      return 'successful'
    case 'abandoned':
      return 'abandoned'
    case 'reversed':
    case 'refunded':
      return 'reversed'
    case 'failed':
      return 'failed'
    default:
      return 'pending'
  }
}

export function resolvePaymentStatus(
  current: LocalPaymentStatus,
  provider: LocalPaymentStatus,
): LocalPaymentStatus {
  if (current === 'reversed' || current === 'refunded') return 'reversed'
  if (current === 'successful' && provider !== 'reversed') return 'successful'
  return provider
}

export function validatePaystackVerification(
  payment: PaymentVerificationSnapshot,
  verification: PaystackVerification,
) {
  if (verification.reference !== payment.reference) throw new Error('Payment reference mismatch.')
  if (verification.amount !== payment.amountKobo) throw new Error('Payment amount mismatch.')
  if (verification.currency !== payment.currency) throw new Error('Payment currency mismatch.')
  if (
    verification.customer?.email &&
    verification.customer.email.toLowerCase() !== payment.customerEmail.toLowerCase()
  ) {
    throw new Error('Payment customer mismatch.')
  }

  const metadata = verification.metadata
  const expectedMetadata: Array<[string, string]> = [
    ['solarshareCustomerID', payment.customerID],
    ['solarshareRelationshipID', payment.relationshipID],
    ['solarshareSystemID', payment.systemID],
    ['solarshareTariffNairaPerKWh', String(payment.tariffNairaPerKWh)],
  ]
  for (const [key, expected] of expectedMetadata) {
    if (metadataText(metadata, key) !== expected) {
      throw new Error('Payment initiation metadata mismatch.')
    }
  }

  return mapPaystackStatus(verification.status)
}

export function shouldCreateAllocation(status: LocalPaymentStatus, allocationExists: boolean) {
  return status === 'successful' && !allocationExists
}

export function canReviewAllocation(ownerID: string, requestOwnerID: string, status: string) {
  return ownerID === requestOwnerID && status === 'pending'
}

export function paymentNotificationAudience(
  status: LocalPaymentStatus,
  allocationCreated: boolean,
  statusChanged: boolean,
) {
  if (status === 'successful' && allocationCreated) {
    return ['customer', 'solarOwner'] as const
  }
  if (status === 'reversed' && statusChanged) {
    return ['customer', 'solarOwner'] as const
  }
  if (statusChanged) return ['customer'] as const
  return [] as const
}
