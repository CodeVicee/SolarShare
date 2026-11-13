'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BatteryCharging,
  Building2,
  Check,
  Eye,
  EyeOff,
  Link2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react'
import logo from '@/assets/solarshare-logo-512.png'
import { dashboardHomeFor } from '@/lib/account-roles'
import {
  forgotPasswordAction,
  loginAction,
  registerCustomerAction,
  registerSolarOwnerAction,
  resendVerificationAction,
  resetPasswordAction,
  type ActionState,
} from '@/app/(frontend)/auth-actions'

const initialState: ActionState = { ok: false }

export default function AuthScreen({
  mode,
  token = '',
  registrationType = 'customer',
}: {
  mode: 'login' | 'register' | 'forgot' | 'reset'
  token?: string
  registrationType?: 'customer' | 'solar-owner'
}) {
  const router = useRouter()
  const action =
    mode === 'login'
      ? loginAction
      : mode === 'register'
        ? registrationType === 'solar-owner'
          ? registerSolarOwnerAction
          : registerCustomerAction
        : mode === 'forgot'
          ? forgotPasswordAction
          : resetPasswordAction
  const [state, formAction, pending] = useActionState(action, initialState)
  const [resendState, resendAction, resendPending] = useActionState(resendVerificationAction, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    if (mode === 'login' && state.ok) {
      router.push(dashboardHomeFor(state.user))
      router.refresh()
    }
  }, [mode, router, state.ok])

  const title =
    mode === 'login'
      ? 'Welcome back.'
      : mode === 'register'
        ? registrationType === 'solar-owner'
          ? 'Apply as a Solar Owner.'
          : 'Register as a Customer.'
        : mode === 'forgot'
          ? 'Recover your account.'
          : 'Create a new password.'

  const description =
    mode === 'login'
      ? 'Securely access your private SolarShare energy workspace.'
      : mode === 'register'
        ? registrationType === 'solar-owner'
          ? 'Submit your installation for administrator review. Owner access is granted only after approval.'
          : 'Create a verified customer account and optionally request a Solar Owner connection.'
        : mode === 'forgot'
          ? 'We will send a secure, time-limited reset link if the account exists.'
          : 'Choose a strong password you have not used before.'

  const completed = state.ok && mode !== 'login'

  return (
    <main className="auth-shell relative grid min-h-screen bg-[#071426] text-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="auth-visual relative hidden overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,137,255,.18),transparent_38%),radial-gradient(circle_at_70%_80%,rgba(255,138,36,.13),transparent_35%)]" />
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <img src={logo.src} alt="SolarShare solar emblem" className="h-12 w-12 object-contain" />
          <span>
            <span className="block text-lg font-extrabold tracking-[-.04em]">SOLAR<span className="text-[#FF8A24]">SHARE</span></span>
            <span className="block text-[9px] uppercase tracking-[.19em] text-slate-400">Power shared smarter.</span>
          </span>
        </Link>
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex border border-orange-400/25 bg-orange-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-orange-300">Protected energy intelligence</span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.03] tracking-[-.05em]">Your energy data.<br />Private by design.</h1>
          <p className="mt-5 max-w-lg leading-7 text-slate-400">Payload-native password security, verified email access and isolated account records in one calm experience.</p>
        </div>
        <p className="relative z-10 text-[9px] uppercase tracking-[.16em] text-slate-600">Secure app authentication · Separate from CMS administration</p>
      </section>

      <section className="flex items-center justify-center px-5 py-16 sm:px-10">
        <div className="w-full max-w-lg">
          <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden">
            <img src={logo.src} alt="SolarShare solar emblem" className="h-11 w-11 object-contain" />
            <span className="font-extrabold">SOLAR<span className="text-[#FF8A24]">SHARE</span></span>
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#43B5FF]">Secure account access</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-[-.04em]">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>

          {completed ? (
            <div className="mt-8 border border-emerald-400/20 bg-emerald-400/10 p-6">
              <Check className="h-6 w-6 text-emerald-300" />
              <h3 className="mt-4 font-bold">{mode === 'reset' ? 'Password reset complete' : mode === 'forgot' ? 'Check your email' : state.applicationPending ? 'Application submitted' : 'Registration successful'}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{state.message}</p>
              <Link href="/login" className="mt-6 inline-flex text-sm font-bold text-blue-300">Continue to secure login</Link>
            </div>
          ) : (
            <form action={formAction} className="mt-8 space-y-5">
              {mode === 'reset' && <input type="hidden" name="token" value={token} />}
              {mode === 'register' && (
                <AuthField label="Full name" error={state.fieldErrors?.fullName} icon={User}>
                  <input name="fullName" autoComplete="name" required className="w-full bg-transparent outline-none" />
                </AuthField>
              )}
              {mode !== 'reset' && (
                <AuthField label="Email address" error={state.fieldErrors?.email} icon={Mail}>
                  <input name="email" type="email" autoComplete="email" required className="w-full bg-transparent outline-none" />
                </AuthField>
              )}
              {mode === 'register' && (
                <AuthField label="Phone number" error={state.fieldErrors?.phone} icon={Phone}>
                  <input name="phone" type="tel" autoComplete="tel" required className="w-full bg-transparent outline-none" />
                </AuthField>
              )}
              {mode === 'register' && registrationType === 'customer' && (
                <AuthField label="Solar Owner connection code (optional)" error={state.fieldErrors?.connectionCode} icon={Link2}>
                  <input name="connectionCode" autoComplete="off" placeholder="SS-XXXXXXXXXX" className="w-full bg-transparent uppercase outline-none" />
                </AuthField>
              )}
              {mode === 'register' && registrationType === 'solar-owner' && (
                <>
                  <AuthField label="Business or organisation name (optional)" error={state.fieldErrors?.businessName} icon={Building2}>
                    <input name="businessName" autoComplete="organization" className="w-full bg-transparent outline-none" />
                  </AuthField>
                  <AuthField label="Installation address" error={state.fieldErrors?.installationAddress} icon={MapPin}>
                    <input name="installationAddress" autoComplete="street-address" required className="w-full bg-transparent outline-none" />
                  </AuthField>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <AuthField label="State" error={state.fieldErrors?.state} icon={MapPin}>
                      <input name="state" autoComplete="address-level1" required className="w-full bg-transparent outline-none" />
                    </AuthField>
                    <AuthField label="City" error={state.fieldErrors?.city} icon={MapPin}>
                      <input name="city" autoComplete="address-level2" required className="w-full bg-transparent outline-none" />
                    </AuthField>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <AuthField label="Solar capacity (kW)" error={state.fieldErrors?.installationCapacityKW} icon={Sun}>
                      <input name="installationCapacityKW" type="number" min=".1" step=".1" required className="w-full bg-transparent outline-none" />
                    </AuthField>
                    <AuthField label="Battery capacity (kWh, optional)" error={state.fieldErrors?.batteryCapacityKWh} icon={BatteryCharging}>
                      <input name="batteryCapacityKWh" type="number" min="0" step=".1" className="w-full bg-transparent outline-none" />
                    </AuthField>
                  </div>
                  <AuthField label="Existing solar installation details" error={state.fieldErrors?.installationDetails} icon={Sun}>
                    <textarea name="installationDetails" rows={4} required className="w-full resize-y bg-transparent py-3 outline-none" />
                  </AuthField>
                </>
              )}
              {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                <AuthField label={mode === 'reset' ? 'New password' : 'Password'} error={state.fieldErrors?.password} icon={LockKeyhole}>
                  <input name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required className="w-full bg-transparent outline-none" />
                  <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                  </button>
                </AuthField>
              )}
              {(mode === 'register' || mode === 'reset') && (
                <>
                  <AuthField label="Confirm password" error={state.fieldErrors?.confirmPassword} icon={ShieldCheck}>
                    <input name="confirmPassword" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" required className="w-full bg-transparent outline-none" />
                    <button type="button" onClick={() => setShowConfirmation(value => !value)} aria-label={showConfirmation ? 'Hide password confirmation' : 'Show password confirmation'}>
                      {showConfirmation ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                    </button>
                  </AuthField>
                  <p className="text-[10px] leading-5 text-slate-500">Minimum 10 characters with uppercase, lowercase, number and symbol.</p>
                </>
              )}
              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-400"><input name="remember" type="checkbox" className="accent-[#2589FF]" /> Remember me</label>
                  <Link href="/forgot-password" className="font-bold text-blue-300">Forgot password?</Link>
                </div>
              )}
              {mode === 'register' && (
                <label className="flex items-start gap-3 text-xs leading-5 text-slate-400">
                  <input name="termsAccepted" type="checkbox" required className="mt-1 accent-[#2589FF]" />
                  <span>I accept the <Link href="/terms" className="text-blue-300">terms</Link> and <Link href="/privacy" className="text-blue-300">privacy policy</Link>.</span>
                </label>
              )}
              {state.fieldErrors?.termsAccepted && <p className="text-xs text-red-300">{state.fieldErrors.termsAccepted}</p>}
              {state.message && <p role="alert" className={`border p-3 text-xs ${state.requiresVerification ? 'border-orange-400/20 bg-orange-400/10 text-orange-200' : 'border-red-400/20 bg-red-400/10 text-red-200'}`}>{state.message}</p>}
              <button disabled={pending || (mode === 'reset' && !token)} className="flex min-h-12 w-full items-center justify-center gap-2 bg-[#FF8A24] font-extrabold text-[#071426] transition hover:bg-[#FFB14A] disabled:opacity-60">
                {pending ? 'Working securely…' : mode === 'login' ? 'Log In' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Reset Password'}
              </button>
            </form>
          )}

          {state.requiresVerification && (mode === 'login' || mode === 'register') && (
            <form action={resendAction} className="mt-4 flex gap-2">
              <input name="email" type="email" placeholder="Email address" required className="min-h-11 flex-1 border border-white/10 bg-[#0B1D35] px-3 text-sm outline-none" />
              <button disabled={resendPending} className="border border-blue-400/30 px-4 text-xs font-bold text-blue-300">{resendPending ? 'Sending…' : 'Resend'}</button>
            </form>
          )}
          {resendState.message && <p className="mt-3 text-xs text-slate-400">{resendState.message}</p>}
          {mode === 'login' && <p className="mt-6 text-center text-sm text-slate-500">New to SolarShare? <Link href="/register" className="font-bold text-blue-300">Create account</Link></p>}
          {mode === 'register' && (
            <div className="mt-6 space-y-3 text-center text-sm text-slate-500">
              <p>Already have an account? <Link href="/login" className="font-bold text-blue-300">Log in</Link></p>
              <p>
                {registrationType === 'solar-owner' ? 'Need customer access?' : 'Own a solar installation?'}{' '}
                <Link href={registrationType === 'solar-owner' ? '/register/customer' : '/register/owner'} className="font-bold text-blue-300">
                  {registrationType === 'solar-owner' ? 'Register as a Customer' : 'Apply as a Solar Owner'}
                </Link>
              </p>
            </div>
          )}
          {(mode === 'forgot' || mode === 'reset') && <Link href="/login" className="mt-6 flex justify-center text-sm font-bold text-blue-300">Back to login</Link>}
        </div>
      </section>
    </main>
  )
}

function AuthField({
  label,
  error,
  icon: Icon,
  children,
}: {
  label: string
  error?: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-300">{label}</span>
      <span className={`flex min-h-12 items-center gap-3 border bg-[#0B1D35] px-4 text-sm text-white focus-within:ring-2 ${error ? 'border-red-400/50 focus-within:ring-red-400/10' : 'border-white/10 focus-within:border-blue-400/60 focus-within:ring-blue-400/10'}`}>
        <Icon className="h-4 w-4 shrink-0 text-slate-500" />
        {children}
      </span>
      {error && <span className="mt-1.5 block text-[10px] text-red-300">{error}</span>}
    </label>
  )
}
