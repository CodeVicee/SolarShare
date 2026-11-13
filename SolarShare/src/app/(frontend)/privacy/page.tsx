import Link from 'next/link'

export default function PrivacyPage() {
  return <main className="mx-auto min-h-screen max-w-3xl px-6 py-24"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#1675DD]">SolarShare legal</p><h1 className="mt-4 text-4xl font-bold tracking-[-.04em]">Privacy policy</h1><p className="mt-6 text-sm leading-7 text-slate-600">SolarShare stores account and energy records in isolated, access-controlled collections. Production privacy terms and retention schedules must be reviewed before commercial launch.</p><Link href="/register" className="mt-8 inline-flex text-sm font-bold text-[#1675DD]">Return to registration</Link></main>
}
