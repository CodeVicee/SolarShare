import { createHmac } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { planAllocation, planConsumption } from './accounting'
import { calculateConsumption, calculateEnergyKWh } from './money'
import { verifyPaystackWebhook } from './paystack'

afterEach(() => {
  delete process.env.PAYSTACK_SECRET_KEY
})

describe('commerce accounting', () => {
  it('calculates the required Mr. A and Mr. B example', () => {
    expect(calculateEnergyKWh(500_000, 100)).toBe(50)
    expect(planAllocation(80, 2.5, 50)).toEqual({
      ownerBalanceKWh: 30,
      customerBalanceKWh: 52.5,
    })
  })

  it('rounds energy and rejects invalid amounts and tariffs', () => {
    expect(calculateEnergyKWh(10_000, 300)).toBe(0.333)
    expect(() => calculateEnergyKWh(9_999, 100)).toThrow('at least ₦100')
    expect(() => calculateEnergyKWh(10_000, 0)).toThrow('valid tariff')
  })

  it('rejects decreasing cumulative readings', () => {
    expect(calculateConsumption(100, 102.1254)).toBe(2.125)
    expect(() => calculateConsumption(100, 99)).toThrow('cannot decrease')
    expect(() => calculateConsumption(-1, 1)).toThrow('cannot decrease')
  })

  it('never lets allocation or consumption create a negative balance', () => {
    expect(() => planAllocation(49.999, 0, 50)).toThrow('Insufficient')
    expect(planConsumption(2, 10, 3)).toEqual({
      status: 'insufficient-credit',
      balanceKWh: 2,
      totalConsumedKWh: 10,
    })
    expect(planConsumption(5, 10, 3)).toEqual({
      status: 'applied',
      balanceKWh: 2,
      totalConsumedKWh: 13,
    })
  })

  it('supports one approval plan and rejects insufficient owner capacity', () => {
    expect(planAllocation(50, 0, 50)).toEqual({
      ownerBalanceKWh: 0,
      customerBalanceKWh: 50,
    })
    expect(() => planAllocation(49.999, 0, 50)).toThrow('Insufficient verified allocatable energy')
  })

  it('verifies Paystack webhook HMAC signatures', () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_unit_only'
    const body = JSON.stringify({ event: 'charge.success', data: { reference: 'test' } })
    const signature = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex')
    expect(verifyPaystackWebhook(body, signature)).toBe(true)
    expect(verifyPaystackWebhook(body, '0'.repeat(128))).toBe(false)
    expect(verifyPaystackWebhook(body, null)).toBe(false)
  })
})
