import type { NextRequest } from 'next/server'
import { getCurrentAppUser } from '@/lib/app-auth'
import { reviewCustomerConnection } from '@/server/commerce/service'
import { hasAppRole } from '@/lib/account-roles'

export async function PATCH(
  request: NextRequest,
  context: RouteContext<'/app-api/v1/connections/[id]'>,
) {
  const user = await getCurrentAppUser()
  if (!user) return Response.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  if (!hasAppRole(user, 'solar-owner')) {
    return Response.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  try {
    const { id } = await context.params
    const input = (await request.json()) as { decision?: string; reason?: string }
    if (!['approved', 'rejected', 'suspended', 'disconnected'].includes(input.decision || '')) {
      throw new Error('Choose a valid connection decision.')
    }
    return Response.json({
      data: await reviewCustomerConnection(
        user,
        id,
        input.decision as 'approved' | 'rejected' | 'suspended' | 'disconnected',
        input.reason,
      ),
    })
  } catch (error) {
    return Response.json(
      { error: { code: 'CONNECTION_UPDATE_FAILED', message: error instanceof Error ? error.message : 'Update failed.' } },
      { status: 400 },
    )
  }
}
