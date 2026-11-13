import { genericSignedWebhookAdapter } from './generic-signed-webhook'
import type { TelemetryAdapter } from './types'
import { TelemetryError } from './types'

const adapters = new Map<string, TelemetryAdapter>([
  [genericSignedWebhookAdapter.id, genericSignedWebhookAdapter],
])

export function getTelemetryAdapter(id: string | null) {
  if (!id) {
    throw new TelemetryError('ADAPTER_REQUIRED', 'A telemetry adapter header is required.')
  }
  const adapter = adapters.get(id)
  if (!adapter) {
    throw new TelemetryError('ADAPTER_NOT_SUPPORTED', 'The telemetry adapter is not supported.')
  }
  return adapter
}

export const supportedTelemetryAdapters = [...adapters.keys()]
