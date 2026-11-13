'use client'

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-[#071426] text-white">
        <main className="grid min-h-screen place-items-center px-6 py-16">
          <section className="w-full max-w-xl border border-white/15 bg-[#0c2038] p-8 shadow-2xl md:p-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF9F52]">
              SolarShare
            </p>
            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
              We could not load this view.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Your account data remains protected. Try loading the page again,
              or return to the home page if the issue continues.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => unstable_retry()}
                className="min-h-11 bg-[#FF8A24] px-5 text-xs font-bold text-[#071426]"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex min-h-11 items-center border border-white/25 px-5 text-xs font-bold"
              >
                Return home
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  )
}
