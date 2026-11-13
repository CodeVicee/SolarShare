import Link from 'next/link'
import { ArrowRight, Sun, UserRound } from 'lucide-react'
import logo from '@/assets/solarshare-logo-512.png'

const choices = [
  {
    href: '/register/owner',
    label: 'Register as a Solar Owner',
    description: 'Apply for verified owner access, submit installation details and complete system setup after administrator approval.',
    icon: Sun,
    accent: 'border-orange-300/30 bg-orange-300/10 text-orange-200',
  },
  {
    href: '/register/customer',
    label: 'Register as a Customer',
    description: 'Create a customer account and connect to a Solar Owner now or after email verification.',
    icon: UserRound,
    accent: 'border-blue-300/30 bg-blue-300/10 text-blue-200',
  },
]

export default function RegistrationChoice() {
  return (
    <main className="min-h-screen bg-[#071426] px-5 py-12 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="flex w-fit items-center gap-3">
          <img src={logo.src} alt="SolarShare solar emblem" className="h-12 w-12 object-contain" />
          <span>
            <span className="block text-lg font-extrabold tracking-[-.04em]">SOLAR<span className="text-[#FF8A24]">SHARE</span></span>
            <span className="block text-[9px] uppercase tracking-[.19em] text-slate-400">Power shared smarter.</span>
          </span>
        </Link>
        <div className="mt-20 max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#43B5FF]">Choose your account journey</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">How will you use SolarShare?</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">Account roles are assigned on the server. Solar Owner access requires administrator approval; Customer access is available after email verification.</p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {choices.map(({ href, label, description, icon: Icon, accent }) => (
            <Link key={href} href={href} className="group border border-white/10 bg-white/[.04] p-7 transition hover:border-white/20 hover:bg-white/[.07] sm:p-9">
              <span className={`grid h-12 w-12 place-items-center border ${accent}`}><Icon className="h-5 w-5" /></span>
              <h2 className="mt-8 text-2xl font-bold tracking-[-.03em]">{label}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">{description}</p>
              <span className="mt-8 flex items-center gap-2 text-xs font-bold text-white">Continue <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-bold text-blue-300">Log in</Link></p>
      </div>
    </main>
  )
}
