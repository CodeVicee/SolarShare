import { roundKWh } from './money'

function positiveEnergy(value: number) {
  if (!Number.isFinite(value) || value <= 0) throw new Error('Energy must be a positive number.')
}

export function planAllocation(inventoryKWh: number, walletKWh: number, requestedKWh: number) {
  positiveEnergy(requestedKWh)
  if (inventoryKWh < requestedKWh) throw new Error('Insufficient verified allocatable energy.')
  return {
    ownerBalanceKWh: roundKWh(inventoryKWh - requestedKWh),
    customerBalanceKWh: roundKWh(walletKWh + requestedKWh),
  }
}

export function planConsumption(
  balanceKWh: number,
  totalConsumedKWh: number,
  consumptionKWh: number,
) {
  positiveEnergy(consumptionKWh)
  if (balanceKWh < consumptionKWh) {
    return {
      status: 'insufficient-credit' as const,
      balanceKWh: roundKWh(balanceKWh),
      totalConsumedKWh: roundKWh(totalConsumedKWh),
    }
  }
  return {
    status: 'applied' as const,
    balanceKWh: roundKWh(balanceKWh - consumptionKWh),
    totalConsumedKWh: roundKWh(totalConsumedKWh + consumptionKWh),
  }
}
