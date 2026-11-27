'use client'

import React, { useEffect, useState } from 'react'
import type { SolarSystem } from '@/payload-types'

type Props = {
  systems: SolarSystem[]
}

type Adapter =
  | 'not-configured'
  | 'generic-signed-webhook'
  | 'esp32-monitor'

type ApiResponse = {
  data?: SolarSystem
  error?: {
    message?: string
    fields?: Record<string, string>
  }
}

export default function DeviceIntegrationSettings({ systems }: Props) {
  const [systemId, setSystemId] = useState(
    systems.length ? String(systems[0].id) : '',
  )
  const [adapter, setAdapter] = useState<Adapter>('not-configured')
  const [gatewayReference, setGatewayReference] = useState('')
  const [staleAfter, setStaleAfter] = useState('900')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const selectedSystem = systems.find(
    (system) => String(system.id) === systemId,
  )

  useEffect(() => {
    if (!selectedSystem) return

    setAdapter(
      selectedSystem.integrationAdapter === 'esp32-monitor' ||
        selectedSystem.integrationAdapter === 'generic-signed-webhook'
        ? selectedSystem.integrationAdapter
        : 'not-configured',
    )
    setGatewayReference(selectedSystem.gatewayReference || '')
    setStaleAfter(
      String(selectedSystem.telemetryStaleAfterSeconds ?? 900),
    )
    setMessage('')
    setError('')
    setFieldErrors({})
  }, [selectedSystem])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    setFieldErrors({})

    if (!selectedSystem) {
      setError('Select a solar system before saving.')
      return
    }

    const freshness = Number(staleAfter)

    if (!Number.isInteger(freshness) || freshness < 60 || freshness > 86400) {
      setFieldErrors({
        telemetryStaleAfterSeconds:
          'Enter a whole number between 60 and 86400 seconds.',
      })
      return
    }

    if (adapter !== 'not-configured' && !gatewayReference.trim()) {
      setFieldErrors({
        gatewayReference: 'A gateway reference is required.',
      })
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        `/app-api/v1/solar-systems/${selectedSystem.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            integrationAdapter: adapter,
            gatewayReference: gatewayReference.trim(),
            telemetryStaleAfterSeconds: freshness,
          }),
        },
      )

      const result = (await response.json()) as ApiResponse

      if (!response.ok) {
        setFieldErrors(result.error?.fields || {})
        throw new Error(
          result.error?.message || 'The integration settings could not be saved.',
        )
      }

      if (result.data) {
        setAdapter(
          result.data.integrationAdapter === 'esp32-monitor' ||
            result.data.integrationAdapter === 'generic-signed-webhook'
            ? result.data.integrationAdapter
            : 'not-configured',
        )
        setGatewayReference(result.data.gatewayReference || '')
        setStaleAfter(
          String(result.data.telemetryStaleAfterSeconds ?? freshness),
        )
      }

      setMessage('Integration settings saved successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while saving.',
      )
    } finally {
      setSaving(false)
    }
  }

  const fieldClass =
    'mt-2 w-full border border-slate-200 bg-white p-3 text-sm text-[#071426] outline-none focus:border-[#2589FF]'

  return (
    <main className="mx-auto max-w-[1200px] p-4 md:p-8 xl:p-10">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#1675DD]">
          Hardware & connectivity
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#071426]">
          Device Integration
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Configure the monitoring connection for your solar systems.
          Saving these settings does not mean a device is connected.
        </p>
      </div>

      {systems.length === 0 ? (
        <section className="mt-8 border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-lg font-semibold text-[#071426]">
            No solar systems found
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Create a solar system before configuring a monitoring device.
          </p>
        </section>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <form
            onSubmit={handleSubmit}
            className="border border-slate-200 bg-white p-6 md:p-8"
          >
            <h2 className="text-xl font-semibold text-[#071426]">
              Connection settings
            </h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Choose the solar system and monitoring adapter to configure.
            </p>

            <label className="mt-6 block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Solar system
              </span>
              <select
                value={systemId}
                onChange={(event) => setSystemId(event.target.value)}
                className={fieldClass}
              >
                {systems.map((system) => (
                  <option key={system.id} value={String(system.id)}>
                    {system.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Monitoring adapter
              </span>
              <select
                value={adapter}
                onChange={(event) => setAdapter(event.target.value as Adapter)}
                className={fieldClass}
              >
                <option value="not-configured">Not configured</option>
                <option value="esp32-monitor">ESP32 Monitor</option>
                <option value="generic-signed-webhook">
                  Generic Signed Webhook
                </option>
              </select>
            </label>

            <label className="mt-5 block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Gateway system reference
              </span>
              <input
                value={gatewayReference}
                onChange={(event) => setGatewayReference(event.target.value)}
                maxLength={128}
                placeholder="Enter the configured system reference"
                className={fieldClass}
                disabled={adapter === 'not-configured'}
              />
              {fieldErrors.gatewayReference && (
                <span className="mt-1 block text-xs text-red-600">
                  {fieldErrors.gatewayReference}
                </span>
              )}
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                This reference must match the system reference sent by the
                monitoring device.
              </span>
            </label>

            <label className="mt-5 block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Telemetry freshness threshold (seconds)
              </span>
              <input
                type="number"
                min={60}
                max={86400}
                step={1}
                value={staleAfter}
                onChange={(event) => setStaleAfter(event.target.value)}
                className={fieldClass}
              />
              {fieldErrors.telemetryStaleAfterSeconds && (
                <span className="mt-1 block text-xs text-red-600">
                  {fieldErrors.telemetryStaleAfterSeconds}
                </span>
              )}
              <span className="mt-2 block text-xs leading-5 text-slate-400">
                Allowed range: 60 seconds to 24 hours. Default: 900 seconds.
              </span>
            </label>

            {message && (
              <p className="mt-5 border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                {message}
              </p>
            )}

            {error && (
              <p className="mt-5 border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || !selectedSystem}
              className="mt-7 inline-flex min-h-11 items-center bg-[#071426] px-6 text-xs font-bold text-white transition hover:bg-[#142D49] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving settings...' : 'Save integration settings'}
            </button>
          </form>

          <aside className="space-y-6">
            <section className="border border-slate-200 bg-white p-6 md:p-8">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#1675DD]">
                Selected system
              </p>
              <h2 className="mt-3 text-xl font-semibold text-[#071426]">
                {selectedSystem?.name}
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                System ID: {selectedSystem?.id}
              </p>
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Configuration
                </p>
                <p className="mt-2 text-sm font-medium text-[#071426]">
                  {adapter === 'esp32-monitor'
                    ? 'ESP32 Monitor'
                    : adapter === 'generic-signed-webhook'
                      ? 'Generic Signed Webhook'
                      : 'Not configured'}
                </p>
              </div>
            </section>

            <section className="border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-sm font-semibold text-amber-900">
                Monitoring data is not billing data
              </h2>
              <p className="mt-3 text-xs leading-6 text-amber-800">
                ESP32 readings are currently classified as unverified
                monitoring data. Demo readings are for testing only.
                They must not change customer energy balances, allocations
                or payments.
              </p>
            </section>

            <section className="border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-[#071426]">
                Before live monitoring
              </h2>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                <li>• Configure the device with the matching system reference.</li>
                <li>• Set up secure device authentication.</li>
                <li>• Configure a trusted network connection.</li>
                <li>• Test actual device communication before treating readings as live.</li>
              </ul>
            </section>
          </aside>
        </div>
      )}
    </main>
  )
}
