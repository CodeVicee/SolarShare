import { redirect } from 'next/navigation'
import { dashboardHomeFor } from '@/lib/account-roles'
import { getCurrentAppUser } from '@/lib/app-auth'

export default async function AppIndexPage() {
  const user = await getCurrentAppUser()
  if (!user) redirect('/login?reason=session-expired')
  redirect(dashboardHomeFor(user))
}
