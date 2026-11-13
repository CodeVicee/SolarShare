import type { NextRequest } from 'next/server'
import { getCurrentAppUser, toPublicUser } from '@/lib/app-auth'
import {
  createOwnedSharingAllocation,
  createOwnedSolarSystem,
  getOwnedAnalytics,
  getOwnedResource,
} from '@/server/solarshare/repository'
import type { AnalyticsPeriod } from '@/server/solarshare/analytics'
import { InputError, paginationFromURL } from '@/server/solarshare/validation'
import { hasAppRole } from '@/lib/account-roles'

const supportedResources = new Set([
  'solar-systems',
  'energy-readings',
  'sharing',
  'analytics',
  'notifications',
  'system-alerts',
])

const errorResponse = (error: unknown) => {
  if (error instanceof InputError) {
    return Response.json(
      { error: { code: 'VALIDATION_ERROR', message: error.message, fields: error.fields } },
      { status: error.status },
    )
  }
  return Response.json(
    { error: { code: 'REQUEST_FAILED', message: 'The request could not be completed.' } },
    { status: 500 },
  )
}

export async function GET(
  request: NextRequest,
  context: RouteContext<'/app-api/v1/[resource]'>,
) {
  const user = await getCurrentAppUser()
  if (!user) {
    return Response.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } },
      { status: 401 },
    )
  }

  const { resource } = await context.params
  if (resource === 'profile') return Response.json({ data: toPublicUser(user) })
  if (!hasAppRole(user, 'solar-owner')) {
    return Response.json(
      { error: { code: 'FORBIDDEN', message: 'Solar Owner access is required.' } },
      { status: 403 },
    )
  }
  if (!supportedResources.has(resource)) {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: 'API resource not found.' } },
      { status: 404 },
    )
  }

  try {
    if (resource === 'analytics') {
      const requestedPeriod = request.nextUrl.searchParams.get('period')
      const period: AnalyticsPeriod =
        requestedPeriod === 'weekly' ||
        requestedPeriod === 'monthly' ||
        requestedPeriod === 'yearly'
          ? requestedPeriod
          : 'daily'
      return Response.json({
        data: await getOwnedAnalytics(user, {
          period,
          from: request.nextUrl.searchParams.get('from') || undefined,
          to: request.nextUrl.searchParams.get('to') || undefined,
        }),
      })
    }
    const url = request.nextUrl
    const result = await getOwnedResource(user, resource, {
      ...paginationFromURL(url),
      from: url.searchParams.get('from') || undefined,
      to: url.searchParams.get('to') || undefined,
      kind: url.searchParams.get('kind') || undefined,
    })
    if (!result) {
      return Response.json(
        { error: { code: 'NOT_FOUND', message: 'API resource not found.' } },
        { status: 404 },
      )
    }
    return Response.json({
      data: result.docs,
      pagination: {
        page: result.page,
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
        limit: result.limit,
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext<'/app-api/v1/[resource]'>,
) {
  const user = await getCurrentAppUser()
  if (!user) {
    return Response.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } },
      { status: 401 },
    )
  }

  const { resource } = await context.params
  if (!hasAppRole(user, 'solar-owner')) {
    return Response.json(
      { error: { code: 'FORBIDDEN', message: 'Solar Owner access is required.' } },
      { status: 403 },
    )
  }
  try {
    const input = await request.json()
    if (resource === 'solar-systems') {
      return Response.json({ data: await createOwnedSolarSystem(user, input) }, { status: 201 })
    }
    if (resource === 'sharing') {
      return Response.json(
        { data: await createOwnedSharingAllocation(user, input) },
        { status: 201 },
      )
    }
    return Response.json(
      { error: { code: 'METHOD_NOT_ALLOWED', message: 'Creation is not supported here.' } },
      { status: 405 },
    )
  } catch (error) {
    return errorResponse(error)
  }
}
