import { describe, expect, it } from 'vitest'
import {
  InputError,
  paginationFromURL,
  parseSharingInput,
  parseSolarIntegrationInput,
  parseSolarSystemInput,
} from './validation'

describe('API request validation', () => {
  it('accepts ESP32 integration with a gateway reference', () => {
    expect(
      parseSolarIntegrationInput({
        integrationAdapter: 'esp32-monitor',
        gatewayReference: 'SOLAR-ESP32-001',
      }),
    ).toMatchObject({
      integrationAdapter: 'esp32-monitor',
      gatewayReference: 'SOLAR-ESP32-001',
    })
  })

  it('rejects ESP32 integration without a gateway reference', () => {
    expect(() =>
      parseSolarIntegrationInput({
        integrationAdapter: 'esp32-monitor',
      }),
    ).toThrow(InputError)
  })

  it('rejects unsupported telemetry adapters', () => {
    expect(() =>
      parseSolarIntegrationInput({
        integrationAdapter: 'unknown-adapter',
        gatewayReference: 'SOLAR-ESP32-001',
      }),
    ).toThrow(InputError)
  })
  it('allowlists solar-system fields and normalizes numeric capacity', () => {
    expect(
      parseSolarSystemInput({
        name: ' Lagos roof ',
        locationLabel: '12 Solar Avenue, Lagos',
        capacityKW: '8.5',
        batteryCapacityKWh: '12',
        owner: 'another-user',
        operationalStatus: 'connected',
      }),
    ).toEqual({
      name: 'Lagos roof',
      capacityKW: 8.5,
      siteReference: undefined,
      locationLabel: '12 Solar Avenue, Lagos',
      inverterModel: undefined,
      panelModel: undefined,
      battery: { capacityKWh: 12 },
      gatewayReference: undefined,
      integrationAdapter: 'not-configured',
      telemetryStaleAfterSeconds: undefined,
    })
  })

  it('rejects invalid installation and sharing payloads', () => {
    expect(() => parseSolarSystemInput({ name: 'x', capacityKW: -2 })).toThrow(InputError)
    expect(() =>
      parseSolarSystemInput({
        name: 'Valid system',
        locationLabel: '12 Solar Avenue',
        capacityKW: 5,
        batteryCapacityKWh: -1,
      }),
    ).toThrow(InputError)
    expect(() =>
      parseSharingInput({ direction: 'sent', energyKWh: 0 }),
    ).toThrow(InputError)
  })

  it('creates proposed coordination records without trusting workflow fields', () => {
    expect(
      parseSharingInput({
        direction: 'distributed',
        energyKWh: 3.25,
        sourceSystem: 1,
        status: 'completed',
        source: 'utility-confirmed',
      }),
    ).toMatchObject({
      direction: 'distributed',
      energyKWh: 3.25,
      sourceSystem: 1,
      status: 'proposed',
      source: 'coordination',
    })
  })

  it('bounds pagination input', () => {
    expect(paginationFromURL(new URL('https://example.test?limit=900&page=-3'))).toEqual({
      limit: 100,
      page: 1,
    })
  })
})
