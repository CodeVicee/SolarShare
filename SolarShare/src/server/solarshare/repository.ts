
import 'server-only'

import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import type { User } from '@/payload-types'
import {
  aggregateEnergy,
  analyticsDateWindow,
  summarizeAlerts,
  summarizeEnergy,
  summarizeSharing,
  type AnalyticsPeriod,
} from './analytics'
import {
  parseSharingInput,
  parseSolarIntegrationInput,
  parseSolarSystemInput,
} from './validation'
import { buildTelemetrySnapshot } from '@/server/telemetry/snapshot'
import {
  getCommerceDashboard,
  ensureOwnerSetup,
} from '@/server/commerce/service'
import { requireAppRole } from '@/lib/account-roles'

const ownerWhere = (user: User): Where => ({
  owner: { equals: user.id },
})

export async function getOwnedDashboardData(user: User) {
  requireAppRole(user, 'solar-owner')

  const payload = await getPayload({ config })
  const owner = ownerWhere(user)

  const [
    systems,
    energy,
    sharing,
    notifications,
    alerts,
    esp32Readings,
  ] = await Promise.all([
    payload.find({
      collection: 'solar-systems',
      where: owner,
      limit: 25,
      sort: '-updatedAt',
      depth: 0,
      user,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'energy-records',
      where: owner,
      limit: 500,
      sort: '-recordedAt',
      depth: 0,
      user,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'sharing-records',
      where: owner,
      limit: 100,
      sort: '-recordedAt',
      depth: 0,
      user,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'app-notifications',
      where: owner,
      limit: 50,
      sort: '-createdAt',
      depth: 0,
      user,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'system-alerts',
      where: owner,
      limit: 100,
      sort: '-detectedAt',
      depth: 0,
      user,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'esp32-monitor-readings',
      where: owner,
      limit: 50,
      sort: '-measuredAt',
      depth: 0,
      user,
      overrideAccess: false,
    }),
  ])

  const result = {
    systems: systems.docs,
    energy: energy.docs,
    sharing: sharing.docs,
    notifications: notifications.docs,
    alerts: alerts.docs,
    esp32Readings: esp32Readings.docs,
  }

  return {
    ...result,
    telemetry: buildTelemetrySnapshot(result.systems, result.energy),
    commerce: await getCommerceDashboard(user),
  }
}

export async function getCustomerDashboardData(user: User) {
  requireAppRole(user, 'customer')

  const payload = await getPayload({ config })

  const notifications = await payload.find({
    collection: 'app-notifications',
    where: ownerWhere(user),
    limit: 50,
    sort: '-createdAt',
    depth: 0,
    user,
    overrideAccess: false,
  })

  const result = {
    systems: [],
    energy: [],
    sharing: [],
    notifications: notifications.docs,
    alerts: [],
    esp32Readings: [],
  }

  return {
    ...result,
    telemetry: buildTelemetrySnapshot([], []),
    commerce: await getCommerceDashboard(user),
  }
}

export async function getOwnedResource(
  user: User,
  resource: string,
  options: {
    limit: number
    page: number
    from?: string
    to?: string
    kind?: string
  },
) {
  requireAppRole(user, 'solar-owner')

  const payload = await getPayload({ config })
  const owner = ownerWhere(user)

  const common = {
    depth: 0 as const,
    limit: options.limit,
    page: options.page,
    user,
    overrideAccess: false as const,
  }

  switch (resource) {
    case 'solar-systems':
      return payload.find({
        ...common,
        collection: 'solar-systems',
        where: owner,
        sort: '-updatedAt',
      })

    case 'energy-readings': {
      const conditions: Where[] = [owner]

      if (options.from) {
        conditions.push({
          recordedAt: { greater_than_equal: options.from },
        })
      }

      if (options.to) {
        conditions.push({
          recordedAt: { less_than_equal: options.to },
        })
      }

      if (options.kind) {
        conditions.push({
          kind: { equals: options.kind },
        })
      }

      return payload.find({
        ...common,
        collection: 'energy-records',
        where: { and: conditions },
        sort: '-recordedAt',
      })
    }

    case 'sharing':
      return payload.find({
        ...common,
        collection: 'sharing-records',
        where: owner,
        sort: '-recordedAt',
      })

    case 'notifications':
      return payload.find({
        ...common,
        collection: 'app-notifications',
        where: owner,
        sort: '-createdAt',
      })

    case 'system-alerts':
      return payload.find({
        ...common,
        collection: 'system-alerts',
        where: owner,
        sort: '-detectedAt',
      })

    default:
      return null
  }
}

export async function getOwnedAnalytics(
  user: User,
  options: {
    period: AnalyticsPeriod
    from?: string
    to?: string
  },
) {
  requireAppRole(user, 'solar-owner')

  const payload = await getPayload({ config })
  const window = analyticsDateWindow(options.period)
  const from = options.from || window.from
  const to = options.to || window.to

  const [energy, sharing, alerts] = await Promise.all([
    payload.find({
      collection: 'energy-records',
      where: {
        and: [
          ownerWhere(user),
          { recordedAt: { greater_than_equal: from } },
          { recordedAt: { less_than_equal: to } },
        ],
      },
      limit: 5000,
      pagination: false,
      sort: 'recordedAt',
      depth: 0,
      user,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'sharing-records',
      where: ownerWhere(user),
      limit: 1000,
      pagination: false,
      depth: 0,
      user,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'system-alerts',
      where: ownerWhere(user),
      limit: 1000,
      pagination: false,
      depth: 0,
      user,
      overrideAccess: false,
    }),
  ])

  return {
    period: options.period,
    from,
    to,
    energy: summarizeEnergy(energy.docs),
    series: aggregateEnergy(energy.docs, options.period),
    sharing: summarizeSharing(sharing.docs),
    alerts: summarizeAlerts(alerts.docs),
  }
}

export async function createOwnedSolarSystem(
  user: User,
  input: unknown,
) {
  requireAppRole(user, 'solar-owner')

  const payload = await getPayload({ config })

  const system = await payload.create({
    collection: 'solar-systems',
    data: {
      ...parseSolarSystemInput(input),
      owner: user.id,
      allocatableEnergyKWh: 0,
      inventoryVersion: 0,
    },
    depth: 0,
    user,
    overrideAccess: false,
  })

  await ensureOwnerSetup(user, system)

  return system
}

export async function createOwnedSharingAllocation(
  user: User,
  input: unknown,
) {
  requireAppRole(user, 'solar-owner')

  const payload = await getPayload({ config })

  return payload.create({
    collection: 'sharing-records',
    data: {
      ...parseSharingInput(input),
      owner: user.id,
      sender: user.id,
    },
    depth: 0,
    user,
    overrideAccess: false,
  })
}

export async function updateOwnedSolarIntegration(
  user: User,
  id: string,
  input: unknown,
) {
  requireAppRole(user, 'solar-owner')

  const payload = await getPayload({ config })

  return payload.update({
    collection: 'solar-systems',
    id,
    data: parseSolarIntegrationInput(input),
    depth: 0,
    user,
    overrideAccess: false,
  })
}
