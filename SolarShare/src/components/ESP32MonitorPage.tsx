import type { DashboardData } from '@/lib/dashboard-data'

type Reading = DashboardData['esp32Readings'][number]

function formatValue(value: number | null | undefined, decimals = 2) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(decimals)
    : '—'
}

function LoadCard({
  title,
  voltage,
  current,
  power,
  relay,
}: {
  title: string
  voltage?: number | null
  current?: number | null
  power?: number | null
  relay?: boolean | null
}) {
  const metrics = [
    ['Voltage', formatValue(voltage), 'V'],
    ['Current', formatValue(current), 'A'],
    ['Apparent power', formatValue(power, 1), 'VA'],
  ]

  return (
    <div className="border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#071426]">{title}</h3>
        <span className={`text-[9px] font-bold uppercase tracking-wider ${
          typeof relay === 'boolean'
            ? relay ? 'text-emerald-600' : 'text-slate-500'
            : 'text-amber-600'
        }`}>
          {typeof relay === 'boolean' ? relay ? 'Relay ON' : 'Relay OFF' : 'Relay unknown'}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {metrics.map(([label, value, unit]) => (
          <div key={label}>
            <p className="text-[9px] uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-2 font-mono text-lg text-[#071426]">
              {value}<span className="ml-1 text-[10px] text-slate-400">{unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReadingCard({ reading }: { reading: Reading }) {
  return (
    <article className="border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <p className="text-sm font-semibold text-[#071426]">{reading.deviceReference}</p>
          <p className="mt-1 text-[10px] text-slate-500">
            Measured {new Date(reading.measuredAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="border border-slate-200 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">
            {reading.mode}
          </span>
          <span className="border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-700">
            {reading.quality}
          </span>
        </div>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2">
        <LoadCard
          title="Load 1"
          voltage={reading.voltage1}
          current={reading.current1}
          power={reading.power1VA}
          relay={reading.relay1}
        />
        <LoadCard
          title="Load 2"
          voltage={reading.voltage2}
          current={reading.current2}
          power={reading.power2VA}
          relay={reading.relay2}
        />
      </div>
      <div className="border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400">
        Event: {reading.eventId}
      </div>
    </article>
  )
}

export default function ESP32MonitorPage({
  readings,
}: {
  readings: DashboardData['esp32Readings']
}) {
  return (
    <main className="mx-auto max-w-[1600px] p-4 md:p-8 xl:p-10">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#1675DD]">
          Device telemetry
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#071426]">
          ESP32 Monitor
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Monitor the latest readings received from your configured ESP32 gateway.
          These measurements are unverified and are not included in verified energy totals.
        </p>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#071426]">Received readings</h2>
          <span className="font-mono text-[10px] text-slate-400">
            {readings.length} stored
          </span>
        </div>

        {readings.length ? (
          <div className="grid gap-5">
            {readings.map((reading) => (
              <ReadingCard key={reading.id} reading={reading} />
            ))}
          </div>
        ) : (
          <div className="border border-slate-200 bg-white p-8">
            <p className="text-sm font-semibold text-[#071426]">
              No ESP32 readings received yet
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              Your monitor will display device measurements here after the configured
              gateway sends its first accepted telemetry event.
            </p>
          </div>
        )}
      </section>

      <p className="mt-5 text-[10px] leading-5 text-slate-400">
        Apparent power is displayed in VA. Readings are currently informational and
        should not be treated as verified active power or billing measurements.
      </p>
    </main>
  )
}
