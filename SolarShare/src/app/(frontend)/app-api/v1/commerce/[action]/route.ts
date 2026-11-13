import type { NextRequest } from 'next/server'
import { getCurrentAppUser } from '@/lib/app-auth'
import {
  createEnergyPurchasePackage,
  initializeEnergyPurchase,
  lookupRegistrationCode,
  requestCustomerConnection,
  setEnergyTariff,
} from '@/server/commerce/service'
import { hasAppRole } from '@/lib/account-roles'

const failed = (error: unknown, status = 400) =>
  Response.json(
    {
      error: {
        code: 'COMMERCE_REQUEST_FAILED',
        message: error instanceof Error ? error.message : 'The request could not be completed.',
      },
    },
    { status },
  )

export async function GET(
  request: NextRequest,
  context: RouteContext<'/app-api/v1/commerce/[action]'>,
) {
  const user = await getCurrentAppUser()
  if (!user) return failed(new Error('Authentication is required.'), 401)
  const { action } = await context.params
  if (action !== 'lookup-provider') return failed(new Error('Resource not found.'), 404)
  if (!hasAppRole(user, 'customer')) {
    return failed(new Error('Customer access is required.'), 403)
  }
  try {
    return Response.json({
      data: await lookupRegistrationCode(request.nextUrl.searchParams.get('code') || ''),
    })
  } catch (error) {
    return failed(error, 404)
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext<'/app-api/v1/commerce/[action]'>,
) {
  const user = await getCurrentAppUser()
  if (!user) return failed(new Error('Authentication is required.'), 401)
  const { action } = await context.params
  const requiredRole =
    action === 'set-tariff' || action === 'create-payment-package' ? 'solar-owner' : 'customer'
  if (!hasAppRole(user, requiredRole)) {
    return failed(
      new Error(
        requiredRole === 'solar-owner'
          ? 'Solar Owner access is required.'
          : 'Customer access is required.',
      ),
      403,
    )
  }
  try {
    const input = (await request.json()) as Record<string, unknown>
    if (action === 'request-connection') {
      return Response.json({
        data: await requestCustomerConnection(user, String(input.code || '')),
      })
    }
    if (action === 'initialize-payment') {
      return Response.json({
        data: await initializeEnergyPurchase(
          user,
          String(input.relationshipID || ''),
          Number(input.amountNaira),
          input.packageID ? String(input.packageID) : undefined,
        ),
      })
    }
    if (action === 'set-tariff') {
      return Response.json({
        data: await setEnergyTariff(user, String(input.systemID || ''), Number(input.nairaPerKWh)),
      })
    }
    if (action === 'create-payment-package') {
      return Response.json({
        data: await createEnergyPurchasePackage(
          user,
          String(input.systemID || ''),
          String(input.name || ''),
          Number(input.amountNaira),
          input.description ? String(input.description) : undefined,
        ),
      })
    }
    return failed(new Error('Resource not found.'), 404)
  } catch (error) {
    return failed(error)
  }
}
