export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#071426] text-white">
      <div className="text-center">
        <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#FF8A24]" />
        <p className="mt-5 font-mono text-[9px] uppercase tracking-[.2em] text-slate-500">Securing your SolarShare workspace</p>
      </div>
    </main>
  )
}
