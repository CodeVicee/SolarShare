import Link from 'next/link'
import { Check, X } from 'lucide-react'

export default function VerificationResult({ ok, message }: { ok: boolean; message?: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#071426] px-6 text-white">
      <section className="w-full max-w-lg border border-white/10 bg-[#0B1D35] p-8">
        <span className={`grid h-12 w-12 place-items-center ${ok ? 'bg-emerald-400/10 text-emerald-300' : 'bg-red-400/10 text-red-300'}`}>
          {ok ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
        </span>
        <p className="mt-7 font-mono text-[10px] uppercase tracking-[.2em] text-blue-300">Email verification</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-.04em]">{ok ? 'Account verified.' : 'Verification unavailable.'}</h1>
        <p className="mt-4 text-sm leading-6 text-slate-400">{message}</p>
        <Link href="/login" className="mt-7 inline-flex bg-[#FF8A24] px-5 py-3 text-sm font-bold text-[#071426]">Continue to login</Link>
      </section>
    </main>
  )
}
