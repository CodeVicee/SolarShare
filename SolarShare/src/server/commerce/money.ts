export const roundKWh = (value: number) => Math.round(value * 1000) / 1000

export function calculateEnergyKWh(amountKobo: number, tariffNairaPerKWh: number) {
  if (!Number.isInteger(amountKobo) || amountKobo < 10_000) {
    throw new Error('Payment amount must be at least ₦100.')
  }
  if (!Number.isFinite(tariffNairaPerKWh) || tariffNairaPerKWh < 1) {
    throw new Error('A valid tariff is required.')
  }
  return roundKWh(amountKobo / 100 / tariffNairaPerKWh)
}

export function calculateConsumption(previousKWh: number, currentKWh: number) {
  if (!Number.isFinite(previousKWh) || !Number.isFinite(currentKWh)) {
    throw new Error('Meter readings must be finite numbers.')
  }
  if (previousKWh < 0 || currentKWh < 0 || currentKWh < previousKWh) {
    throw new Error('Cumulative meter readings cannot decrease.')
  }
  return roundKWh(currentKWh - previousKWh)
}
