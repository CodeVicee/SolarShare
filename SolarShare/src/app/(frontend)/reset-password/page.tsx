import AuthScreen from '@/components/AuthScreen'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token = '' } = await searchParams
  return <AuthScreen mode="reset" token={token} />
}
