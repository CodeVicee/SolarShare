import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#071426] px-6 text-white">
      <section className="max-w-lg border border-white/10 bg-[#0B1D35] p-8">
        <ShieldAlert className="h-7 w-7 text-orange-300" />
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[.2em] text-blue-300">Protected workspace</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-.04em]">Access unavailable.</h1>
        <p className="mt-4 text-sm leading-6 text-slate-400">Your account does not have permission to view this resource, or your secure session has expired.</p>
        <Link href="/login" className="mt-7 inline-flex bg-[#FF8A24] px-5 py-3 text-sm font-bold text-[#071426]">Return to login</Link>
      </section>
    </main>
  )
}
