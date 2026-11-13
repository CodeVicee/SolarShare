import { redirect } from 'next/navigation'
import AuthScreen from '@/components/AuthScreen'
import { dashboardHomeFor } from '@/lib/account-roles'
import { getCurrentAppUser } from '@/lib/app-auth'

export default async function CustomerRegistrationPage() {
  const user = await getCurrentAppUser()
  if (user) redirect(dashboardHomeFor(user))
  return <AuthScreen mode="register" registrationType="customer" />
}
