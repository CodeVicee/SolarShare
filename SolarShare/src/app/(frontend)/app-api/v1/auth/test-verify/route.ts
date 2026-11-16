import config from '@payload-config'
import { getPayload } from 'payload'
import {
  DevelopmentVerificationError,
  developmentVerificationAvailable,
  verifyDevelopmentTestAccount,
} from '@/server/auth/development-verification'
import type { DevelopmentVerificationPayload } from '@/server/auth/development-verification'
export async function POST(request: Request) {
  if (!developmentVerificationAvailable(process.env)) {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: 'Not found.' } },
      { status: 404 },
    )
  }
  try {
    const input = (await request.json()) as { email?: unknown }
    const payload = await getPayload({ config })
    const result = await verifyDevelopmentTestAccount({
          payload: payload as unknown as DevelopmentVerificationPayload,
      email: typeof input.email === 'string' ? input.email : '',
      providedSecret: request.headers.get('x-solarshare-test-verification') || '',
    })
    return Response.json({ data: result })
  } catch (error) {
    if (error instanceof DevelopmentVerificationError) {
      return Response.json(
        { error: { code: 'TEST_VERIFICATION_DENIED', message: error.message } },
        { status: error.status },
      )
    }
    return Response.json(
      { error: { code: 'TEST_VERIFICATION_FAILED', message: 'Verification failed.' } },
      { status: 400 },
    )
  }
}
