import { createHmac } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import {
  genericSignedWebhookAdapter,
  normalizeProviderReading,
} from './generic-signed-webhook'
import { TelemetryError } from './types'

afterEach(() => {
  delete process.env.TELEMETRY_INGESTION_SECRET
})

describe('generic signed telemetry adapter', () => {
  it('verifies HMAC signatures and normalizes UTC telemetry', () => {
    process.env.TELEMETRY_INGESTION_SECRET = 'test-only-secret'
    const raw = JSON.stringify({
      systemReference: 'gateway-1',
      eventId: 'event-1',
      measuredAt: '2026-01-02T03:04:05+01:00',
      mode: 'live',
      deviceConnected: true,
      readings: [
        {
          type: 'solar-generation-power',
          value: 4860,
          unit: 'W',
          quality: 'verified',
        },
        {
          type: 'solar-generation-energy',
          value: 18400,
          unit: 'Wh',
          quality: 'verified',
        },
      ],
    })
    const signature = createHmac('sha256', 'test-only-secret').update(raw).digest('hex')
    const headers = new Headers({ 'x-solarshare-signature': `sha256=${signature}` })

    expect(() => genericSignedWebhookAdapter.verifyRequest(raw, headers)).not.toThrow()
    expect(genericSignedWebhookAdapter.parseEvent(raw)).toMatchObject({
      measuredAt: '2026-01-02T02:04:05.000Z',
      readings: [
        { kind: 'generation', value: 4.86, unit: 'kW' },
        { kind: 'generation', value: 18.4, unit: 'kWh' },
      ],
    })
  })

  it('rejects invalid signatures, units, values, and missing measurements', () => {
    process.env.TELEMETRY_INGESTION_SECRET = 'test-only-secret'
    expect(() =>
      genericSignedWebhookAdapter.verifyRequest('{}', new Headers()),
    ).toThrow(TelemetryError)
    expect(() =>
      normalizeProviderReading({
        type: 'solar-generation-power',
        value: -1,
        unit: 'W',
      }),
    ).toThrow(TelemetryError)
    expect(() =>
      normalizeProviderReading({
        type: 'battery-state-of-charge',
        value: 101,
        unit: '%',
      }),
    ).toThrow(TelemetryError)
  })
})
