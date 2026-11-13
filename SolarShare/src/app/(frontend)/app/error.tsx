'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#F4F6F8] px-6 py-16 text-[#071426]">
      <section className="w-full max-w-xl border border-slate-200 bg-white p-8 shadow-xl md:p-12">
        <span className="grid h-12 w-12 place-items-center border border-orange-200 bg-orange-50 text-[#D76712]">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="mt-7 font-mono text-[9px] uppercase tracking-[.2em] text-[#1675DD]">
          SolarShare telemetry
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">
          Energy data is temporarily unavailable.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          Your historical records remain protected. Retry the secure data request, or return later
          if the equipment provider is unavailable.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-8 inline-flex min-h-11 items-center gap-2 bg-[#071426] px-5 text-xs font-bold text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Retry telemetry
        </button>
      </section>
    </main>
  )
}
