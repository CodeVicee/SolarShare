const text = (value: unknown, max = 160) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const finiteNumber = (value: unknown) => {
  const positiveDocumentID = (value: unknown): number | undefined => {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined
}
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}
const positiveDocumentID = (value: unknown): number | undefined => {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined
}

export class InputError extends Error {
  status = 400
  fields: Record<string, string>

  constructor(fields: Record<string, string>) {
    super('The request contains invalid fields.')
    this.fields = fields
  }
}

export function parseSolarSystemInput(input: unknown) {
  const source = input && typeof input === 'object' ? input : {}
  const record = source as Record<string, unknown>
  const name = text(record.name, 100)
  const locationLabel = text(record.locationLabel, 160)
  const capacityKW = finiteNumber(record.capacityKW)
  const batteryCapacityKWh = finiteNumber(record.batteryCapacityKWh)
  const errors: Record<string, string> = {}

  if (name.length < 2) errors.name = 'Enter an installation name.'
  if (locationLabel.length < 5) errors.locationLabel = 'Enter the installation address.'
  if (capacityKW === undefined || capacityKW <= 0) {
    errors.capacityKW = 'Capacity must be greater than zero.'
  }
  if (batteryCapacityKWh !== undefined && batteryCapacityKWh < 0) {
    errors.batteryCapacityKWh = 'Battery capacity cannot be negative.'
  }
  if (Object.keys(errors).length) throw new InputError(errors)

  return {
    name,
    siteReference: text(record.siteReference, 100) || undefined,
    locationLabel,
    capacityKW,
    inverterModel: text(record.inverterModel, 120) || undefined,
    panelModel: text(record.panelModel, 120) || undefined,
    battery:
      batteryCapacityKWh === undefined
        ? undefined
        : {
            capacityKWh: batteryCapacityKWh,
          },
    gatewayReference: text(record.gatewayReference, 128) || undefined,
    integrationAdapter:
      record.integrationAdapter === 'generic-signed-webhook'
        ? ('generic-signed-webhook' as const)
        : ('not-configured' as const),
    telemetryStaleAfterSeconds:
      finiteNumber(record.telemetryStaleAfterSeconds) === undefined
        ? undefined
        : Math.min(86_400, Math.max(60, finiteNumber(record.telemetryStaleAfterSeconds)!)),
  }
}

export function parseSolarIntegrationInput(input: unknown) {
  const source = input && typeof input === 'object' ? input : {}
  const record = source as Record<string, unknown>
  const gatewayReference = text(record.gatewayReference, 128)
  const integrationAdapter =
    record.integrationAdapter === 'generic-signed-webhook'
      ? ('generic-signed-webhook' as const)
      : record.integrationAdapter === 'not-configured'
        ? ('not-configured' as const)
        : undefined
  const stale = finiteNumber(record.telemetryStaleAfterSeconds)
  const errors: Record<string, string> = {}
  if (!integrationAdapter) errors.integrationAdapter = 'Select a supported telemetry adapter.'
  if (integrationAdapter === 'generic-signed-webhook' && !gatewayReference) {
    errors.gatewayReference = 'Enter the gateway system reference.'
  }
  if (stale !== undefined && (stale < 60 || stale > 86_400)) {
    errors.telemetryStaleAfterSeconds = 'Freshness must be between 60 and 86400 seconds.'
  }
  if (Object.keys(errors).length) throw new InputError(errors)
  return {
    integrationAdapter: integrationAdapter!,
    gatewayReference: gatewayReference || undefined,
    telemetryStaleAfterSeconds: stale,
  }
}

export function parseSharingInput(input: unknown) {
  const source = input && typeof input === 'object' ? input : {}
  const record = source as Record<string, unknown>
  const energyKWh = finiteNumber(record.energyKWh)

  const direction: 'received' | 'distributed' | undefined =
    record.direction === 'received' || record.direction === 'distributed'
      ? record.direction
      : undefined

  const sourceSystem = positiveDocumentID(record.sourceSystem)
  const recipient =
    record.recipient === undefined || record.recipient === null || record.recipient === ''
      ? undefined
      : positiveDocumentID(record.recipient)

  const errors: Record<string, string> = {}

  if (!direction) errors.direction = 'Choose received or distributed.'
  if (energyKWh === undefined || energyKWh <= 0) {
    errors.energyKWh = 'Energy quantity must be greater than zero.'
  }
  if (!sourceSystem) errors.sourceSystem = 'Select an owned solar system.'
  if (record.recipient != null && record.recipient !== '' && !recipient) {
    errors.recipient = 'Select a valid recipient.'
  }

  if (Object.keys(errors).length) throw new InputError(errors)

  return {
    direction: direction!,
    energyKWh: energyKWh!,
    sourceSystem: sourceSystem!,
    recipient,
    counterpartyLabel: text(record.counterpartyLabel, 160) || undefined,
    allocationReference: text(record.allocationReference, 120) || undefined,
    recordedAt: new Date().toISOString(),
    status: 'proposed' as const,
    source: 'coordination' as const,
  }
}

export function paginationFromURL(url: URL) {
  const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1)
  const requestedLimit =
    Number.parseInt(url.searchParams.get('limit') || '50', 10) || 50
  return { page, limit: Math.min(100, Math.max(1, requestedLimit)) }
}
