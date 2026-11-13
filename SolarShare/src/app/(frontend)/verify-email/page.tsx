import VerificationResult from '@/components/VerificationResult'
import { verifyEmailToken } from '@/app/(frontend)/auth-actions'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token = '' } = await searchParams
  const result = await verifyEmailToken(token)
  return <VerificationResult ok={result.ok} message={result.message} />
}
