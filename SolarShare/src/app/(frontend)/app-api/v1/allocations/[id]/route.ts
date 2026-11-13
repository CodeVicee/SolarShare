import type { NextRequest } from 'next/server'
import { getCurrentAppUser } from '@/lib/app-auth'
import { reviewAllocation } from '@/server/commerce/service'
import { hasAppRole } from '@/lib/account-roles'

export async function PATCH(
  request: NextRequest,
  context: RouteContext<'/app-api/v1/allocations/[id]'>,
) {
  const user = await getCurrentAppUser()
  if (!user) return Response.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  if (!hasAppRole(user, 'solar-owner')) {
    return Response.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }
  try {
    const { id } = await context.params
    const input = (await request.json()) as { decision?: string; reason?: string }
    if (input.decision !== 'approve' && input.decision !== 'reject') {
      throw new Error('Choose approve or reject.')
    }
    return Response.json({
      data: await reviewAllocation(user, id, input.decision, input.reason),
    })
  } catch (error) {
    return Response.json(
      { error: { code: 'ALLOCATION_UPDATE_FAILED', message: error instanceof Error ? error.message : 'Update failed.' } },
      { status: 400 },
    )
  }
}
