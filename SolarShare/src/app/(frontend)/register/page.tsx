import { redirect } from 'next/navigation'
import RegistrationChoice from '@/components/RegistrationChoice'
import { dashboardHomeFor } from '@/lib/account-roles'
import { getCurrentAppUser } from '@/lib/app-auth'

export default async function RegisterPage() {
  const user = await getCurrentAppUser()
  if (user) redirect(dashboardHomeFor(user))
  return <RegistrationChoice />
}
