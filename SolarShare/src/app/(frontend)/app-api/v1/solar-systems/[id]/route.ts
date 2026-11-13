import type { NextRequest } from 'next/server'
import { getCurrentAppUser } from '@/lib/app-auth'
import { updateOwnedSolarIntegration } from '@/server/solarshare/repository'
import { InputError } from '@/server/solarshare/validation'
import { hasAppRole } from '@/lib/account-roles'

export async function PATCH(
  request: NextRequest,
  context: RouteContext<'/app-api/v1/solar-systems/[id]'>,
) {
  const user = await getCurrentAppUser()
  if (!user) {
    return Response.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } },
      { status: 401 },
    )
  }
  if (!hasAppRole(user, 'solar-owner')) {
    return Response.json(
      { error: { code: 'FORBIDDEN', message: 'Solar Owner access is required.' } },
      { status: 403 },
    )
  }
  try {
    const { id } = await context.params
    const data = await updateOwnedSolarIntegration(user, id, await request.json())
    return Response.json({ data })
  } catch (error) {
    if (error instanceof InputError) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: error.message, fields: error.fields } },
        { status: 400 },
      )
    }
    return Response.json(
      { error: { code: 'UPDATE_FAILED', message: 'The integration could not be updated.' } },
      { status: 400 },
    )
  }
}
