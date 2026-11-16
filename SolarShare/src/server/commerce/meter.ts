import 'server-only'

import config from '@payload-config'
import { getPayload } from 'payload'
import type { EnergyWallet, MeterRegistration } from '@/payload-types'
import { planConsumption } from './accounting'
import { calculateConsumption } from './money'
import { withPayloadTransaction } from './transaction'

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
export type MeterReadingInput = {
  meterIdentifier: string
  cumulativeKWh: number
  measuredAt: string
  dedupeKey: string
  source: 'smart-meter' | 'manual-audited'
  quality: 'verified' | 'estimated' | 'unverified'
}

function validateInput(input: MeterReadingInput) {
  if (!input.meterIdentifier.trim() || !input.dedupeKey.trim()) {
    throw new Error('Stable meter and reading identifiers are required.')
  }
  if (!Number.isFinite(input.cumulativeKWh) || input.cumulativeKWh < 0) {
    throw new Error('A nonnegative cumulative meter reading is required.')
  }
  const timestamp = new Date(input.measuredAt)
  if (Number.isNaN(timestamp.getTime()) || timestamp.getTime() > Date.now() + 5 * 60_000) {
    throw new Error('A valid meter timestamp is required.')
  }
  return timestamp.toISOString()
}

/**
 * Server-only ingestion boundary for a pre-provisioned meter. Provider adapters
 * must authenticate requests before calling this function.
 */
export async function ingestMeterReading(input: MeterReadingInput) {
  const measuredAt = validateInput(input)
  const payload = await getPayload({ config })

  const duplicate = await payload.find({
    collection: 'meter-readings',
    where: { dedupeKey: { equals: input.dedupeKey } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (duplicate.docs[0]) return { duplicate: true, reading: duplicate.docs[0] }

  const meters = await payload.find({
    collection: 'meter-registrations',
    where: { meterIdentifier: { equals: input.meterIdentifier } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const meter = meters.docs[0] as MeterRegistration | undefined
  if (!meter || meter.status !== 'active' || meter.source !== input.source) {
    throw new Error('Meter is not active or its source is not authorized.')
  }

  return withPayloadTransaction(payload, null, async (req) => {
    const freshMeter = (await payload.findByID({
      collection: 'meter-registrations',
      id: meter.id,
      depth: 0,
      req,
      overrideAccess: true,
    })) as MeterRegistration
    const common = {
      meter: freshMeter.id,
      customer: id(freshMeter.customer),
      solarOwner: id(freshMeter.solarOwner),
      system: id(freshMeter.system),
      cumulativeKWh: input.cumulativeKWh,
      measuredAt,
      source: input.source,
      quality: input.quality,
      dedupeKey: input.dedupeKey,
    }
    const isOutOfOrder =
      Boolean(freshMeter.lastReadingAt) &&
      new Date(measuredAt).getTime() <= new Date(freshMeter.lastReadingAt!).getTime()
    const hasDecreased =
      freshMeter.lastCumulativeKWh != null &&
      input.cumulativeKWh < freshMeter.lastCumulativeKWh
    if (isOutOfOrder || hasDecreased || input.quality !== 'verified') {
      const reading = await payload.create({
        collection: 'meter-readings',
        data: {
          ...common,
          status: isOutOfOrder || hasDecreased ? 'out-of-order' : 'rejected',
        },
        req,
        overrideAccess: true,
      })
      return { duplicate: false, applied: false, reading }
    }

    const consumptionKWh =
      freshMeter.lastCumulativeKWh == null
        ? 0
        : calculateConsumption(freshMeter.lastCumulativeKWh, input.cumulativeKWh)
    if (consumptionKWh === 0) {
      const reading = await payload.create({
        collection: 'meter-readings',
        data: { ...common, status: 'accepted', consumptionKWh: 0 },
        req,
        overrideAccess: true,
      })
      await payload.update({
        collection: 'meter-registrations',
        id: freshMeter.id,
        data: { lastCumulativeKWh: input.cumulativeKWh, lastReadingAt: measuredAt },
        req,
        overrideAccess: true,
      })
      return { duplicate: false, applied: false, reading }
    }

    const wallets = await payload.find({
      collection: 'energy-wallets',
      where: { relationship: { equals: id(freshMeter.relationship) } },
      limit: 1,
      depth: 0,
      req,
      overrideAccess: true,
    })
    const wallet = wallets.docs[0] as EnergyWallet | undefined
    if (!wallet) throw new Error('Customer wallet is unavailable.')
    const plan = planConsumption(wallet.balanceKWh, wallet.totalConsumedKWh, consumptionKWh)
    const reading = await payload.create({
      collection: 'meter-readings',
      data: {
        ...common,
        status: plan.status === 'applied' ? 'accepted' : 'rejected',
        consumptionKWh,
      },
      req,
      overrideAccess: true,
    })
    const consumption = await payload.create({
      collection: 'consumption-records',
      data: {
        customer: id(freshMeter.customer),
        solarOwner: id(freshMeter.solarOwner),
        system: id(freshMeter.system),
        wallet: wallet.id,
        meter: freshMeter.id,
        reading: reading.id,
        energyKWh: consumptionKWh,
        status: plan.status,
        recordedAt: measuredAt,
      },
      req,
      overrideAccess: true,
    })
    if (plan.status === 'insufficient-credit') {
      return { duplicate: false, applied: false, insufficientCredit: true, reading, consumption }
    }

    const walletUpdate = await payload.update({
      collection: 'energy-wallets',
      where: {
        and: [{ id: { equals: wallet.id } }, { version: { equals: wallet.version } }],
      },
      limit: 1,
      data: {
        balanceKWh: plan.balanceKWh,
        totalConsumedKWh: plan.totalConsumedKWh,
        version: wallet.version + 1,
      },
      req,
      overrideAccess: true,
    })
    if (walletUpdate.docs.length !== 1) {
      throw new Error('Customer wallet changed during meter ingestion. Retry this reading.')
    }
    await payload.update({
      collection: 'meter-registrations',
      id: freshMeter.id,
      data: { lastCumulativeKWh: input.cumulativeKWh, lastReadingAt: measuredAt },
      req,
      overrideAccess: true,
    })
    await payload.create({
      collection: 'energy-ledger-entries',
      data: {
        customer: id(freshMeter.customer),
        solarOwner: id(freshMeter.solarOwner),
        system: id(freshMeter.system),
        wallet: wallet.id,
        accountType: 'customer-wallet',
        direction: 'debit',
        energyKWh: consumptionKWh,
        balanceAfterKWh: plan.balanceKWh,
        consumption: consumption.id,
        idempotencyKey: `consumption:${consumption.id}:customer`,
        recordedAt: measuredAt,
      },
      req,
      overrideAccess: true,
    })
    if (plan.balanceKWh <= wallet.lowBalanceThresholdKWh) {
      await payload.create({
        collection: 'app-notifications',
        data: {
          owner: id(freshMeter.customer),
          type: 'energy',
          title: 'Low energy balance',
          message: `Your verified energy wallet balance is ${plan.balanceKWh} kWh.`,
          severity: 'warning',
        },
        req,
        overrideAccess: true,
      })
    }
    return { duplicate: false, applied: true, reading, consumption }
  })
}
