import 'server-only'

import { randomBytes } from 'node:crypto'
import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import type {
  CustomerRelationship,
  EnergyAllocationRequest,
  EnergyWallet,
  PaymentTransaction,
  SolarSystem,
  User,
} from '@/payload-types'
import { calculateEnergyKWh, roundKWh } from './money'
import { planAllocation } from './accounting'
import { initializePaystackTransaction, verifyPaystackTransaction } from './paystack'
import { withPayloadTransaction } from './transaction'
import { requireAppRole } from '@/lib/account-roles'
import {
  canReviewAllocation,
  resolvePaymentStatus,
  shouldCreateAllocation,
  validatePaystackVerification,
  type LocalPaymentStatus,
} from './payment-reconciliation'

const id = (value: unknown): number => {
  if (typeof value === 'number' && Number.isSafeInteger(value)) {
    return value
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const relatedID = value.id

    if (typeof relatedID === 'number' && Number.isSafeInteger(relatedID)) {
      return relatedID
    }
  }

  throw new Error('A required relationship is unavailable.')
}

const parseDocumentID = (value: string, label: string): number => {
  const parsed = Number(value)

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${label}.`)
  }

  return parsed
}

const reference = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${randomBytes(8).toString('hex')}`.toUpperCase()

const fullName = (user: User) => `${user.firstName} ${user.lastName}`.trim()

async function createNotification(
  payload: Awaited<ReturnType<typeof getPayload>>,
  owner: number,
  title: string,
  message: string,
  req?: Parameters<typeof payload.create>[0]['req'],
  severity: 'info' | 'warning' | 'critical' | 'resolved' = 'info',
) {
  return payload.create({
    collection: 'app-notifications',
    data: {
      owner,
      type: 'energy',
      title,
      message,
      severity,
    },
    depth: 0,
    overrideAccess: true,
    req,
  })
}

export async function ensureOwnerSetup(user: User, system: SolarSystem) {
  requireAppRole(user, 'solar-owner')
  const payload = await getPayload({ config })
  const profiles = await payload.find({
    collection: 'solar-owner-profiles',
    where: { solarOwner: { equals: user.id } },
    limit: 1,
    overrideAccess: true,
  })
  if (!profiles.totalDocs) {
    await payload.create({
      collection: 'solar-owner-profiles',
      data: { solarOwner: user.id, displayName: fullName(user), status: 'active' },
      overrideAccess: true,
    })
  }
  const tariffs = await payload.find({
    collection: 'energy-tariffs',
    where: {
      and: [{ system: { equals: system.id } }, { status: { equals: 'active' } }],
    },
    limit: 1,
    overrideAccess: true,
  })
  if (!tariffs.totalDocs) {
    await payload.create({
      collection: 'energy-tariffs',
      data: {
        solarOwner: user.id,
        system: system.id,
        nairaPerKWh: 100,
        activeFrom: new Date().toISOString(),
        status: 'active',
      },
      overrideAccess: true,
    })
  }
}

export async function lookupRegistrationCode(code: string) {
  const payload = await getPayload({ config })
  const systems = await payload.find({
    collection: 'solar-systems',
    where: { customerRegistrationCode: { equals: code.trim().toUpperCase() } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  if (systems.totalDocs !== 1) throw new Error('Registration code was not found.')
  const system = systems.docs[0]
  const owner = typeof system.owner === 'object' ? system.owner : null
  const tariffs = await payload.find({
    collection: 'energy-tariffs',
    where: {
      and: [{ system: { equals: system.id } }, { status: { equals: 'active' } }],
    },
    limit: 1,
    overrideAccess: true,
  })
  return {
    systemID: system.id,
    systemName: system.name,
    locationLabel: system.locationLabel,
    solarOwnerName: owner ? fullName(owner) : 'SolarShare owner',
    tariffNairaPerKWh: tariffs.docs[0]?.nairaPerKWh || 100,
  }
}

export async function requestCustomerConnection(user: User, code: string) {
  requireAppRole(user, 'customer')
  const payload = await getPayload({ config })
  const systems = await payload.find({
    collection: 'solar-systems',
    where: { customerRegistrationCode: { equals: code.trim().toUpperCase() } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (systems.totalDocs !== 1) throw new Error('Registration code was not found.')
  const system = systems.docs[0]
  const solarOwner = id(system.owner)
  if (solarOwner === user.id) throw new Error('Owners cannot register as their own customer.')
  const relationshipKey = `${system.id}:${user.id}`
  const existing = await payload.find({
    collection: 'customer-relationships',
    where: { relationshipKey: { equals: relationshipKey } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.totalDocs) return existing.docs[0]

  const relationship = await payload.create({
    collection: 'customer-relationships',
    data: {
      solarOwner,
      customer: user.id,
      system: system.id,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      relationshipKey,
    },
    overrideAccess: true,
  })
  const profiles = await payload.find({
    collection: 'customer-profiles',
    where: { customer: { equals: user.id } },
    limit: 1,
    overrideAccess: true,
  })
  if (!profiles.totalDocs) {
    await payload.create({
      collection: 'customer-profiles',
      data: { customer: user.id, displayName: fullName(user), status: 'active' },
      overrideAccess: true,
    })
  }
  await createNotification(
    payload,
    solarOwner,
    'New customer connection request',
    `${fullName(user)} requested to join ${system.name}.`,
  )
  return relationship
}

export async function reviewCustomerConnection(
  owner: User,
  relationshipID: string,
  decision: 'approved' | 'rejected' | 'suspended' | 'disconnected',
  reason?: string,
) {
  requireAppRole(owner, 'solar-owner')
  const payload = await getPayload({ config })
  const relationship = await payload.findByID({
    collection: 'customer-relationships',
    id: relationshipID,
    depth: 0,
    overrideAccess: true,
  })
  if (id(relationship.solarOwner) !== owner.id) throw new Error('Not authorized.')
  const updated = await payload.update({
    collection: 'customer-relationships',
    id: relationship.id,
    data: {
      status: decision,
      reviewedAt: new Date().toISOString(),
      rejectionReason: decision === 'rejected' ? reason?.slice(0, 240) : undefined,
    },
    overrideAccess: true,
  })
  if (decision === 'approved') {
    const wallets = await payload.find({
      collection: 'energy-wallets',
      where: { relationship: { equals: relationship.id } },
      limit: 1,
      overrideAccess: true,
    })
    if (!wallets.totalDocs) {
      await payload.create({
        collection: 'energy-wallets',
        data: {
          customer: id(relationship.customer),
          solarOwner: owner.id,
          relationship: relationship.id,
          system: id(relationship.system),
          balanceKWh: 0,
          totalAllocatedKWh: 0,
          totalConsumedKWh: 0,
          lowBalanceThresholdKWh: 5,
          version: 0,
        },
        overrideAccess: true,
      })
    }
  }
  await createNotification(
    payload,
    id(relationship.customer),
    `Connection request ${decision}`,
    decision === 'approved'
      ? 'Your SolarShare connection request was approved.'
      : `Your connection status is now ${decision}.`,
  )
  return updated
}

export async function setEnergyTariff(owner: User, systemID: string, nairaPerKWh: number) {
    const numericSystemID = parseDocumentID(systemID, 'system ID')
  requireAppRole(owner, 'solar-owner')
  if (!Number.isFinite(nairaPerKWh) || nairaPerKWh < 1) throw new Error('Invalid tariff.')
  const payload = await getPayload({ config })
  const system = await payload.findByID({
    collection: 'solar-systems',
    id: numericSystemID,
    depth: 0,
    user: owner,
    overrideAccess: false,
  })
  if (id(system.owner) !== owner.id) throw new Error('Not authorized.')
  const current = await payload.find({
    collection: 'energy-tariffs',
   where: {
  and: [
    { system: { equals: numericSystemID } },
    { status: { equals: 'active' } },
  ],
},
    limit: 10,
    overrideAccess: true,
  })
  const now = new Date().toISOString()
  for (const tariff of current.docs) {
    await payload.update({
      collection: 'energy-tariffs',
      id: tariff.id,
      data: { status: 'superseded', activeTo: now },
      overrideAccess: true,
    })
  }
  return payload.create({
    collection: 'energy-tariffs',
    data: {
      solarOwner: owner.id,
      system: numericSystemID,
      nairaPerKWh: Math.round(nairaPerKWh * 100) / 100,
      activeFrom: now,
      status: 'active',
    },
    overrideAccess: true,
  })
}

export async function createEnergyPurchasePackage(
  owner: User,
  systemID: string,
  name: string,
  amountNaira: number,
  description?: string,
) {
  requireAppRole(owner, 'solar-owner')
  const numericSystemID = parseDocumentID(systemID, 'system ID')
  const cleanName = name.trim().slice(0, 80)
  const amountKobo = Math.round(amountNaira * 100)
  if (!cleanName) throw new Error('Package name is required.')
  calculateEnergyKWh(amountKobo, 1)
  const payload = await getPayload({ config })
  const system = await payload.findByID({
    collection: 'solar-systems',
    id: numericSystemID,
    depth: 0,
    user: owner,
    overrideAccess: false,
  })
  if (id(system.owner) !== owner.id) throw new Error('Not authorized.')
  return payload.create({
    collection: 'energy-purchase-packages',
    data: {
      solarOwner: owner.id,
      system: system.id,
      name: cleanName,
      description: description?.trim().slice(0, 160),
      amountKobo,
      active: true,
      displayOrder: 0,
    },
    overrideAccess: true,
  })
}

export async function initializeEnergyPurchase(
  customer: User,
  relationshipID: string,
  amountNaira: number,
  packageID?: string,
) {
  requireAppRole(customer, 'customer')
    const numericRelationshipID = parseDocumentID(
    relationshipID,
    'relationship ID',
  )
  if (!Number.isFinite(amountNaira)) throw new Error('Enter a valid amount.')
  const payload = await getPayload({ config })
  const relationship = await payload.findByID({
    collection: 'customer-relationships',
    id: numericRelationshipID,
    depth: 0,
    overrideAccess: true,
  })
  if (id(relationship.customer) !== customer.id || relationship.status !== 'approved') {
    throw new Error('An approved customer connection is required.')
  }
  const tariffs = await payload.find({
    collection: 'energy-tariffs',
    where: {
      and: [{ system: { equals: id(relationship.system) } }, { status: { equals: 'active' } }],
    },
    limit: 1,
    overrideAccess: true,
  })
  const tariff = tariffs.docs[0]
  if (!tariff) throw new Error('No active tariff is configured.')
  let amountKobo = Math.round(amountNaira * 100)
  let purchasePackage: number | undefined
  if (packageID) {
    const selectedPackage = await payload.findByID({
      collection: 'energy-purchase-packages',
      id: parseDocumentID(packageID, 'package ID'),
      depth: 0,
      overrideAccess: true,
    })
    if (
      !selectedPackage.active ||
      id(selectedPackage.system) !== id(relationship.system) ||
      id(selectedPackage.solarOwner) !== id(relationship.solarOwner)
    ) {
      throw new Error('The selected payment package is unavailable.')
    }
    amountKobo = selectedPackage.amountKobo
    purchasePackage = selectedPackage.id
  }
  const energyKWh = calculateEnergyKWh(amountKobo, tariff.nairaPerKWh)
  const paymentReference = reference('SSPAY')
  const payment = await payload.create({
    collection: 'payment-transactions',
    data: {
      customer: customer.id,
      solarOwner: id(relationship.solarOwner),
      relationship: relationship.id,
      system: id(relationship.system),
      purchasePackage,
      provider: 'paystack',
      reference: paymentReference,
      amountKobo,
      currency: 'NGN',
      tariffNairaPerKWh: tariff.nairaPerKWh,
      energyKWh,
      status: 'initiated',
      initiatedAt: new Date().toISOString(),
    },
    overrideAccess: true,
  })
  try {
    const siteURL = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteURL) throw new Error('The payment callback URL is not configured.')
    const callbackURL = `${siteURL.replace(/\/$/, '')}/payment/callback`
    const initialized = await initializePaystackTransaction({
      email: customer.email,
      amountKobo,
      reference: paymentReference,
      callbackURL,
     metadata: {
  solarshareCustomerID: String(customer.id),
  solarshareRelationshipID: String(relationship.id),
  solarshareSystemID: String(id(relationship.system)),
  solarshareTariffNairaPerKWh: tariff.nairaPerKWh,
},
    })
    await payload.update({
      collection: 'payment-transactions',
      id: payment.id,
      data: { status: 'pending', providerReference: initialized.reference },
      overrideAccess: true,
    })
    return {
      authorizationURL: initialized.authorization_url,
      reference: paymentReference,
      amountKobo,
      tariffNairaPerKWh: tariff.nairaPerKWh,
      energyKWh,
    }
  } catch (error) {
    await payload.update({
      collection: 'payment-transactions',
      id: payment.id,
      data: { status: 'failed', failureCode: 'INITIALIZATION_FAILED' },
      overrideAccess: true,
    })
    await createNotification(
      payload,
      customer.id,
      'Payment could not be started',
      `Paystack checkout could not be opened for reference ${paymentReference}. No payment was confirmed and no energy was allocated.`,
      undefined,
      'warning',
    )
    throw error
  }
}

export async function verifyAndRecordPayment(referenceValue: string) {
  const cleanReference = referenceValue.trim()
  if (!cleanReference || cleanReference.length > 120) throw new Error('Invalid payment reference.')
  const payload = await getPayload({ config })
  const payments = await payload.find({
    collection: 'payment-transactions',
    where: { reference: { equals: cleanReference } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const payment = payments.docs[0]
  if (!payment) throw new Error('Payment reference was not found.')
  const customer = await payload.findByID({
    collection: 'users',
    id: id(payment.customer),
    depth: 0,
    overrideAccess: true,
  })
  const verification = await verifyPaystackTransaction(cleanReference)
  let providerStatus: LocalPaymentStatus
  try {
    providerStatus = validatePaystackVerification(
      {
        reference: payment.reference,
        amountKobo: payment.amountKobo,
        currency: 'NGN',
        customerID: String(id(payment.customer)),
        customerEmail: customer.email,
        relationshipID: String(id(payment.relationship)),
        systemID: String(id(payment.system)),
        tariffNairaPerKWh: payment.tariffNairaPerKWh,
      },
      verification,
    )
  } catch (error) {
    if (payment.status !== 'successful') {
      const mismatchChanged =
        payment.status !== 'failed' || payment.failureCode !== 'VERIFICATION_MISMATCH'
      await payload.update({
        collection: 'payment-transactions',
        id: payment.id,
        data: {
          status: 'failed',
          providerStatus: verification.status,
          providerMessage: verification.gateway_response || undefined,
          lastVerifiedAt: new Date().toISOString(),
          failureCode: 'VERIFICATION_MISMATCH',
        },
        overrideAccess: true,
      })
      if (mismatchChanged) {
        await createNotification(
          payload,
          id(payment.customer),
          'Payment verification failed',
          `Payment reference ${payment.reference} could not be verified. No energy was allocated.`,
          undefined,
          'critical',
        )
      }
    }
    throw error
  }

  const now = new Date().toISOString()
  const resolvedStatus = resolvePaymentStatus(payment.status, providerStatus)
  if (resolvedStatus !== 'successful') {
    const previousStatus = payment.status
    const updated = await payload.update({
      collection: 'payment-transactions',
      id: payment.id,
      data: {
        status: resolvedStatus,
        providerReference: verification.reference,
        providerStatus: verification.status,
        providerMessage: verification.gateway_response || undefined,
        providerChannel: verification.channel || undefined,
        providerPaidAt: verification.paid_at || undefined,
        lastVerifiedAt: now,
        reversedAt: resolvedStatus === 'reversed' ? now : undefined,
        failureCode: resolvedStatus === 'failed' ? 'PROVIDER_FAILED' : undefined,
      },
      depth: 0,
      overrideAccess: true,
    })
    if (previousStatus !== resolvedStatus) {
      const statusTitle =
        resolvedStatus === 'reversed'
          ? 'Payment reversed'
          : resolvedStatus === 'abandoned'
            ? 'Payment abandoned'
            : resolvedStatus === 'failed'
              ? 'Payment failed'
              : 'Payment pending'
      await createNotification(
        payload,
        id(payment.customer),
        statusTitle,
        resolvedStatus === 'pending'
          ? `Paystack is still processing reference ${payment.reference}. No energy will be allocated until verification succeeds.`
          : `Reference ${payment.reference} is ${resolvedStatus}. No new energy was credited from this status.`,
        undefined,
        resolvedStatus === 'pending' ? 'info' : 'warning',
      )
      if (resolvedStatus === 'reversed') {
        await createNotification(
          payload,
          id(payment.solarOwner),
          'Customer payment reversed',
          `Payment ${payment.reference} was reported reversed by Paystack. Review any approved allocation before further action.`,
          undefined,
          'critical',
        )
      }
    }
    return updated
  }

  if (payment.status === 'reversed' || payment.status === 'refunded') {
    return payment
  }

  const result = await withPayloadTransaction(payload, null, async (req) => {
    const fresh = await payload.findByID({
      collection: 'payment-transactions',
      id: payment.id,
      depth: 0,
      req,
      overrideAccess: true,
    })
    const verifiedAt = new Date().toISOString()
    const updated = await payload.update({
      collection: 'payment-transactions',
      id: fresh.id,
      data: {
        status: 'successful',
        verifiedAt: fresh.verifiedAt || verifiedAt,
        paidAt: fresh.paidAt || verification.paid_at || verifiedAt,
        providerReference: verification.reference,
        providerStatus: verification.status,
        providerMessage: verification.gateway_response || undefined,
        providerChannel: verification.channel || undefined,
        providerPaidAt: verification.paid_at || undefined,
        lastVerifiedAt: verifiedAt,
        failureCode: undefined,
      },
      depth: 0,
      req,
      overrideAccess: true,
    })
    const existing = await payload.find({
      collection: 'energy-allocation-requests',
      where: { payment: { equals: fresh.id } },
      limit: 1,
      req,
      overrideAccess: true,
    })
    if (shouldCreateAllocation('successful', existing.totalDocs > 0)) {
      await payload.create({
        collection: 'energy-allocation-requests',
        data: {
          payment: fresh.id,
          customer: id(fresh.customer),
          solarOwner: id(fresh.solarOwner),
          relationship: id(fresh.relationship),
          system: id(fresh.system),
          requestedKWh: fresh.energyKWh,
          status: 'pending',
          requestedAt: verifiedAt,
        },
        req,
        overrideAccess: true,
      })
      await createNotification(
        payload,
        id(fresh.customer),
        'Payment confirmed',
        `Your ₦${(fresh.amountKobo / 100).toLocaleString('en-NG')} payment was verified. ${fresh.energyKWh} kWh is awaiting Solar Owner allocation approval.`,
        req,
        'resolved',
      )
      await createNotification(
        payload,
        id(fresh.solarOwner),
        'Payment awaiting allocation',
        `A verified ₦${(fresh.amountKobo / 100).toLocaleString('en-NG')} payment for ${fresh.energyKWh} kWh is awaiting allocation approval. Reference: ${fresh.reference}.`,
        req,
      )
    }
    return updated
  })

  try {
    const owner = await payload.findByID({
      collection: 'users',
      id: id(result.solarOwner),
      overrideAccess: true,
    })
    await payload.sendEmail({
      to: owner.email,
      subject: 'New SolarShare customer payment',
      html: `<p>A verified customer payment is awaiting allocation approval.</p><p>Customer: ${fullName(customer)}</p><p>Amount: ₦${(result.amountKobo / 100).toLocaleString('en-NG')}</p><p>Energy equivalent: ${result.energyKWh} kWh</p><p>Reference: ${result.reference}</p>`,
    })
  } catch {
    // Payment remains verified even when a secondary notification provider is unavailable.
  }
  return result
}

export async function reviewAllocation(
  owner: User,
  requestID: string,
  decision: 'approve' | 'reject',
  reason?: string,
) {
  requireAppRole(owner, 'solar-owner')
  const payload = await getPayload({ config })
  const allocationRequest = await payload.findByID({
    collection: 'energy-allocation-requests',
    id: requestID,
    depth: 0,
    overrideAccess: true,
  })
  if (!canReviewAllocation(owner.id, id(allocationRequest.solarOwner), allocationRequest.status)) {
    if (id(allocationRequest.solarOwner) !== owner.id) throw new Error('Not authorized.')
    throw new Error('Allocation was already reviewed.')
  }

  if (decision === 'reject') {
    const rejectionReason = reason?.trim().slice(0, 240)
    if (!rejectionReason) throw new Error('A rejection reason is required.')
    return withPayloadTransaction(payload, owner, async (req) => {
      const fresh = await payload.findByID({
        collection: 'energy-allocation-requests',
        id: requestID,
        depth: 0,
        req,
        overrideAccess: true,
      })
      if (!canReviewAllocation(owner.id, id(fresh.solarOwner), fresh.status)) {
        throw new Error('Allocation was already reviewed.')
      }
      const updated = await payload.update({
        collection: 'energy-allocation-requests',
        id: requestID,
        data: {
          status: 'rejected',
          reviewedAt: new Date().toISOString(),
          rejectionReason,
        },
        req,
        overrideAccess: true,
      })
      await createNotification(
        payload,
        id(fresh.customer),
        'Energy allocation rejected',
        `Your verified payment remains successful, but its energy allocation was rejected: ${rejectionReason} Contact the Solar Owner for resolution or refund review.`,
        req,
        'warning',
      )
      return updated
    })
  }

  return withPayloadTransaction(payload, owner, async (req) => {
    const freshRequest = (await payload.findByID({
      collection: 'energy-allocation-requests',
      id: requestID,
      depth: 0,
      req,
      overrideAccess: true,
    })) as EnergyAllocationRequest
    if (freshRequest.status !== 'pending') throw new Error('Allocation was already reviewed.')
    const system = await payload.findByID({
      collection: 'solar-systems',
      id: id(freshRequest.system),
      depth: 0,
      req,
      overrideAccess: true,
    })
    if (id(system.owner) !== owner.id) throw new Error('Not authorized for this installation.')
    const relationship = await payload.findByID({
      collection: 'customer-relationships',
      id: id(freshRequest.relationship),
      depth: 0,
      req,
      overrideAccess: true,
    })
    if (
      relationship.status !== 'approved' ||
      id(relationship.solarOwner) !== owner.id ||
      id(relationship.customer) !== id(freshRequest.customer) ||
      id(relationship.system) !== system.id
    ) {
      throw new Error('The customer relationship is no longer eligible for allocation.')
    }
    const payment = await payload.findByID({
      collection: 'payment-transactions',
      id: id(freshRequest.payment),
      depth: 0,
      req,
      overrideAccess: true,
    })
    if (
      payment.status !== 'successful' ||
      id(payment.customer) !== id(freshRequest.customer) ||
      id(payment.system) !== system.id ||
      payment.energyKWh !== freshRequest.requestedKWh
    ) {
      throw new Error('The verified payment does not match this allocation.')
    }
    const wallets = await payload.find({
      collection: 'energy-wallets',
      where: { relationship: { equals: id(freshRequest.relationship) } },
      limit: 1,
      depth: 0,
      req,
      overrideAccess: true,
    })
    const wallet = wallets.docs[0] as EnergyWallet | undefined
    if (!wallet) throw new Error('Customer wallet is unavailable.')
    const approvedAt = new Date().toISOString()
    const allocation = await payload.create({
      collection: 'energy-allocation-records',
      data: {
        request: freshRequest.id,
        payment: id(freshRequest.payment),
        customer: id(freshRequest.customer),
        solarOwner: owner.id,
        system: system.id,
        energyKWh: freshRequest.requestedKWh,
        reference: reference('SSALLOC'),
        approvedAt,
      },
      depth: 0,
      req,
      overrideAccess: true,
    })
    const { ownerBalanceKWh: ownerBalance, customerBalanceKWh: customerBalance } = planAllocation(
      system.allocatableEnergyKWh || 0,
      wallet.balanceKWh,
      freshRequest.requestedKWh,
    )
    const inventoryUpdate = await payload.update({
      collection: 'solar-systems',
      where: {
        and: [
          { id: { equals: system.id } },
          { inventoryVersion: { equals: system.inventoryVersion } },
        ],
      },
      limit: 1,
      data: {
        allocatableEnergyKWh: ownerBalance,
        inventoryVersion: system.inventoryVersion + 1,
      },
      req,
      overrideAccess: true,
    })
    if (inventoryUpdate.docs.length !== 1) {
      throw new Error('Energy inventory changed during approval. Please retry.')
    }
    const walletUpdate = await payload.update({
      collection: 'energy-wallets',
      where: {
        and: [{ id: { equals: wallet.id } }, { version: { equals: wallet.version } }],
      },
      limit: 1,
      data: {
        balanceKWh: customerBalance,
        totalAllocatedKWh: roundKWh(wallet.totalAllocatedKWh + freshRequest.requestedKWh),
        version: wallet.version + 1,
      },
      req,
      overrideAccess: true,
    })
    if (walletUpdate.docs.length !== 1) {
      throw new Error('Customer wallet changed during approval. Please retry.')
    }
    await payload.create({
      collection: 'energy-ledger-entries',
      data: {
        solarOwner: owner.id,
        system: system.id,
        accountType: 'owner-inventory',
        direction: 'debit',
        energyKWh: freshRequest.requestedKWh,
        balanceAfterKWh: ownerBalance,
        allocation: allocation.id,
        idempotencyKey: `allocation:${allocation.id}:owner`,
        recordedAt: approvedAt,
      },
      req,
      overrideAccess: true,
    })
    await payload.create({
      collection: 'energy-ledger-entries',
      data: {
        customer: id(freshRequest.customer),
        solarOwner: owner.id,
        system: system.id,
        wallet: wallet.id,
        accountType: 'customer-wallet',
        direction: 'credit',
        energyKWh: freshRequest.requestedKWh,
        balanceAfterKWh: customerBalance,
        allocation: allocation.id,
        idempotencyKey: `allocation:${allocation.id}:customer`,
        recordedAt: approvedAt,
      },
      req,
      overrideAccess: true,
    })
    await payload.update({
      collection: 'energy-allocation-requests',
      id: freshRequest.id,
      data: { status: 'approved', reviewedAt: approvedAt },
      req,
      overrideAccess: true,
    })
    await createNotification(
      payload,
      id(freshRequest.customer),
      'Energy allocation approved',
      `${freshRequest.requestedKWh} kWh was credited to your SolarShare energy wallet. This is an accounting allocation and not proof of physical delivery.`,
      req,
    )
    return allocation
  })
}

export async function getPaymentReceipt(user: User, paymentID: string) {
  const payload = await getPayload({ config })
  const payment = await payload.findByID({
    collection: 'payment-transactions',
    id: paymentID,
    depth: 1,
    overrideAccess: true,
  })
  if (id(payment.customer) !== user.id && id(payment.solarOwner) !== user.id) {
    throw new Error('Not authorized.')
  }
  if (!payment.paidAt || (payment.status !== 'successful' && payment.status !== 'reversed')) {
    throw new Error('A receipt is available only after payment confirmation.')
  }
  return payment
}

export async function getCommerceDashboard(user: User) {
  const payload = await getPayload({ config })
  const participant: Where = {
    or: [{ solarOwner: { equals: user.id } }, { customer: { equals: user.id } }],
  }
  const [relationships, payments, allocations, wallets, ledger, meters, consumption, systems] =
    await Promise.all([
      payload.find({
        collection: 'customer-relationships',
        where: participant,
        limit: 100,
        depth: 1,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'payment-transactions',
        where: participant,
        limit: 100,
        sort: '-initiatedAt',
        depth: 1,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'energy-allocation-requests',
        where: participant,
        limit: 100,
        sort: '-requestedAt',
        depth: 1,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'energy-wallets',
        where: participant,
        limit: 100,
        depth: 1,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'energy-ledger-entries',
        where: participant,
        limit: 100,
        sort: '-recordedAt',
        depth: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'meter-registrations',
        where: participant,
        limit: 100,
        depth: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'consumption-records',
        where: participant,
        limit: 100,
        sort: '-recordedAt',
        depth: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'solar-systems',
        where: { owner: { equals: user.id } },
        limit: 25,
        depth: 0,
        overrideAccess: true,
      }),
    ])
  const systemIDs = [
    ...new Set([
      ...systems.docs.map((system) => system.id),
      ...relationships.docs.map((relationship) => id(relationship.system)),
    ]),
  ]
  const [tariffs, packages] = systemIDs.length
    ? await Promise.all([
        payload.find({
          collection: 'energy-tariffs',
          where: {
            and: [{ system: { in: systemIDs } }, { status: { equals: 'active' } }],
          },
          limit: 100,
          depth: 0,
          overrideAccess: true,
        }),
        payload.find({
          collection: 'energy-purchase-packages',
          where: { system: { in: systemIDs } },
          limit: 100,
          sort: 'displayOrder',
          depth: 0,
          overrideAccess: true,
        }),
      ])
    : [{ docs: [] }, { docs: [] }]

  return {
    relationships: relationships.docs,
    payments: payments.docs,
    allocations: allocations.docs,
    wallets: wallets.docs,
    ledger: ledger.docs,
    meters: meters.docs,
    consumption: consumption.docs,
    systems: systems.docs,
    tariffs: tariffs.docs,
    packages: packages.docs,
  }
}
