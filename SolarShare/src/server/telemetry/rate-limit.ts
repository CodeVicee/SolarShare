import { TelemetryError } from './types'

const windows = new Map<string, { count: number; resetAt: number }>()

export function enforceTelemetryRateLimit(key: string, now = Date.now()) {
  const window = windows.get(key)
  if (!window || now >= window.resetAt) {
    windows.set(key, { count: 1, resetAt: now + 60_000 })
    return
  }
  if (window.count >= 120) {
    throw new TelemetryError('RATE_LIMITED', 'Telemetry rate limit exceeded.', 429)
  }
  window.count += 1
}
