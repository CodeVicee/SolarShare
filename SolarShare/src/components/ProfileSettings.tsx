'use client'

import React, { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Check, LockKeyhole, Mail, Save, User } from 'lucide-react'
import { changePasswordAction, updateEmailAction, updateProfileAction, type ActionState } from '@/app/(frontend)/auth-actions'
import type { PublicAppUser } from '@/lib/app-auth'

const initial: ActionState = { ok: false }

export default function ProfileSettings({ user }: { user: PublicAppUser }) {
  const router = useRouter()
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, initial)
  const [passwordState, passwordAction, passwordPending] = useActionState(changePasswordAction, initial)
  const [emailState, emailAction, emailPending] = useActionState(updateEmailAction, initial)

  useEffect(() => {
    if (profileState.ok) router.refresh()
    if (passwordState.ok) {
      const timer = window.setTimeout(() => router.push('/login'), 1200)
      return () => window.clearTimeout(timer)
    }
    if (emailState.ok) {
      const timer = window.setTimeout(() => router.push('/login'), 1200)
      return () => window.clearTimeout(timer)
    }
  }, [emailState.ok, passwordState.ok, profileState.ok, router])

  return (
    <main className="mx-auto max-w-[1200px] p-4 md:p-8 xl:p-10">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#1675DD]">Account management</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#071426]">Profile & preferences</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your private account information, security and notification preferences.</p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <form action={profileAction} className="border border-slate-200 bg-white p-6 md:p-8">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-[#1675DD]"><User className="h-6 w-6" /></span>
            <div><p className="font-semibold">{user.firstName} {user.lastName}</p><p className="mt-1 text-xs text-slate-500">{user.email}</p></div>
            <span className="ml-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-emerald-700"><Check className="h-3.5 w-3.5" /> Verified</span>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <ProfileField label="First name" error={profileState.fieldErrors?.firstName}><input name="firstName" defaultValue={user.firstName} required /></ProfileField>
            <ProfileField label="Last name" error={profileState.fieldErrors?.lastName}><input name="lastName" defaultValue={user.lastName} required /></ProfileField>
            <ProfileField label="Email address"><input value={user.email} disabled /></ProfileField>
            <ProfileField label="Phone number" error={profileState.fieldErrors?.phone}><input name="phone" defaultValue={user.phone} required /></ProfileField>
          </div>
          <label className="mt-5 block"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Profile picture</span><span className="mt-2 flex items-center gap-3 border border-slate-200 p-3"><Camera className="h-4 w-4 text-slate-400" /><input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" className="text-xs" /></span>{profileState.fieldErrors?.avatar && <span className="mt-1 text-[10px] text-red-600">{profileState.fieldErrors.avatar}</span>}</label>
          <label className="mt-5 block"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Preferred theme</span><select name="theme" defaultValue={user.theme} className="mt-2 w-full border border-slate-200 bg-white p-3 text-sm"><option value="system">System preference</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
          <fieldset className="mt-6 border-t border-slate-100 pt-6"><legend className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Notifications</legend><div className="mt-4 grid gap-3 sm:grid-cols-2">{[['emailAlerts','Email alerts',user.notificationPreferences.emailAlerts],['systemAlerts','System alerts',user.notificationPreferences.systemAlerts],['sharingUpdates','Sharing updates',user.notificationPreferences.sharingUpdates],['weeklySummary','Weekly summary',user.notificationPreferences.weeklySummary]].map(([name,label,checked]) => <label key={String(name)} className="flex items-center gap-3 text-xs"><input name={String(name)} type="checkbox" defaultChecked={Boolean(checked)} className="accent-[#2589FF]" />{String(label)}</label>)}</div></fieldset>
          {profileState.message && <p className={`mt-5 border p-3 text-xs ${profileState.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>{profileState.message}</p>}
          <button disabled={profilePending} className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[#071426] px-5 text-xs font-bold text-white"><Save className="h-4 w-4" />{profilePending ? 'Saving…' : 'Save profile'}</button>
        </form>

        <div className="space-y-6">
        <form action={emailAction} className="h-fit border border-slate-200 bg-white p-6 md:p-8">
          <Mail className="h-5 w-5 text-[#1675DD]" />
          <h2 className="mt-5 text-xl font-semibold">Update email</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">The new address must be verified before you can sign in again.</p>
          <div className="mt-6 space-y-4">
            <ProfileField label="New email address" error={emailState.fieldErrors?.email}><input name="email" type="email" required /></ProfileField>
            <ProfileField label="Current password" error={emailState.fieldErrors?.currentPassword}><input name="currentPassword" type="password" required /></ProfileField>
          </div>
          {emailState.message && <p className={`mt-5 border p-3 text-xs ${emailState.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>{emailState.message}</p>}
          <button disabled={emailPending} className="mt-6 min-h-11 bg-[#071426] px-5 text-xs font-bold text-white">{emailPending ? 'Updating…' : 'Update email'}</button>
        </form>
        <form action={passwordAction} className="h-fit border border-slate-200 bg-white p-6 md:p-8">
          <LockKeyhole className="h-5 w-5 text-[#1675DD]" />
          <h2 className="mt-5 text-xl font-semibold">Change password</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">Changing your password signs out the current app session.</p>
          <div className="mt-6 space-y-4">
            <ProfileField label="Current password" error={passwordState.fieldErrors?.currentPassword}><input name="currentPassword" type="password" required /></ProfileField>
            <ProfileField label="New password" error={passwordState.fieldErrors?.password}><input name="password" type="password" required /></ProfileField>
            <ProfileField label="Confirm new password" error={passwordState.fieldErrors?.confirmPassword}><input name="confirmPassword" type="password" required /></ProfileField>
          </div>
          {passwordState.message && <p className={`mt-5 border p-3 text-xs ${passwordState.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>{passwordState.message}</p>}
          <button disabled={passwordPending} className="mt-6 min-h-11 bg-[#071426] px-5 text-xs font-bold text-white">{passwordPending ? 'Updating…' : 'Update password'}</button>
        </form>
        </div>
      </div>
    </main>
  )
}

function ProfileField({ label, error, children }: { label: string; error?: string; children: React.ReactElement<{ className?: string }> }) {
  return <label className="block"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>{React.cloneElement(children, { className: `mt-2 w-full border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#2589FF] ${children.props.className || ''}` })}{error && <span className="mt-1 block text-[10px] text-red-600">{error}</span>}</label>
}
