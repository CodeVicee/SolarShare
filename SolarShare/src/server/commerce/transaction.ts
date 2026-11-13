import {
  commitTransaction,
  createPayloadRequest,
  initTransaction,
  killTransaction,
  type Payload,
} from 'payload'
import type { User } from '@/payload-types'

export async function withPayloadTransaction<T>(
  payload: Payload,
  user: User | null,
  operation: (req: Awaited<ReturnType<typeof createPayloadRequest>>) => Promise<T>,
) {
  const req = await createPayloadRequest({ payload, user })
  await initTransaction(req)
  try {
    const result = await operation(req)
    await commitTransaction(req)
    return result
  } catch (error) {
    await killTransaction(req)
    throw error
  }
}
