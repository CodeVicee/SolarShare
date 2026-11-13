'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  CircleDollarSign,
  CreditCard,
  Download,
  Gauge,
  Network,
  Package,
  UserPlus,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { PublicAppUser } from '@/lib/app-auth'
import type { DashboardData } from '@/lib/dashboard-data'

const id = (value: unknown) =>
  value && typeof value === 'object' && 'id' in value ? String(value.id) : String(value || '')
const name = (value: unknown) =>
  value && typeof value === 'object' && 'firstName' in value
    ? `${String(value.firstName)} ${String('lastName' in value ? value.lastName : '')}`.trim()
    : 'SolarShare member'
const money = (amountKobo: number) =>
  `₦${(amountKobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`
const date = (value: string) =>
  new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )

async function mutate(path: string, method: 'POST' | 'PATCH', body: unknown) {
  const response = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error?.message || 'Request failed.')
  return result.data
}

export default function EnergyManagement({
  user,
  data,
}: {
  user: PublicAppUser
  data: DashboardData['commerce']
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [code, setCode] = useState('')
  const [amount, setAmount] = useState('5000')
  const [reviewing, setReviewing] = useState(false)
  const [selectedPackageID, setSelectedPackageID] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const isOwner = user.roles.includes('solar-owner')
  const ownerRelationships = data.relationships.filter((item) => id(item.solarOwner) === user.id)
  const customerRelationships = data.relationships.filter((item) => id(item.customer) === user.id)
  const approved = customerRelationships.find((item) => item.status === 'approved')
  const wallet = data.wallets.find((item) => id(item.relationship) === approved?.id)
  const tariff = data.tariffs.find((item) => approved && id(item.system) === id(approved.system))
  const availablePackages = data.packages.filter(
    (item) => approved && item.active && id(item.system) === id(approved.system),
  )
  const customerPayments = data.payments.filter((item) => id(item.customer) === user.id)
  const customerAllocations = data.allocations.filter((item) => id(item.customer) === user.id)
  const ownerPayments = data.payments.filter((item) => id(item.solarOwner) === user.id)
  const ownerAllocations = data.allocations.filter((item) => id(item.solarOwner) === user.id)
  const filteredPayments = customerPayments.filter((payment) => {
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesDate = !dateFilter || payment.initiatedAt.slice(0, 10) === dateFilter
    return matchesStatus && matchesDate
  })
  const successfulCustomerPayments = customerPayments.filter(
    (payment) => payment.status === 'successful',
  )
  const latestPayment = customerPayments[0]
  const pendingCustomerKWh = customerAllocations
    .filter((allocation) => allocation.status === 'pending')
    .reduce((sum, allocation) => sum + allocation.requestedKWh, 0)
  const confirmedOwnerPayments = ownerPayments.filter((payment) => payment.status === 'successful')
  const awaitingOwnerPaymentIDs = new Set(
    ownerAllocations
      .filter((allocation) => allocation.status === 'pending')
      .map((allocation) => id(allocation.payment)),
  )
  const selectedPackage = availablePackages.find((item) => item.id === selectedPackageID)
  const checkoutAmountKobo = selectedPackage
    ? selectedPackage.amountKobo
    : Math.round(Number(amount) * 100)
  const equivalent = useMemo(
    () =>
      tariff && checkoutAmountKobo > 0
        ? Math.round((checkoutAmountKobo / 100 / tariff.nairaPerKWh) * 1000) / 1000
        : 0,
    [checkoutAmountKobo, tariff],
  )
  const execute = (task: () => Promise<unknown>, success: string) => {
    setMessage('')
    startTransition(async () => {
      try {
        await task()
        setMessage(success)
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Request failed.')
      }
    })
  }

  return (
    <main className="mx-auto max-w-[1600px] p-4 md:p-8 xl:p-10">
      <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#1675DD]">
        {isOwner ? 'Solar owner energy operations' : 'Customer energy accounting'}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-[#071426]">
        Energy Management
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        Payments, allocations and wallet balances are auditable accounting records—not proof that
        electricity was physically delivered.
      </p>
      {message && (
        <p className="mt-6 border border-blue-200 bg-blue-50 p-4 text-xs text-[#145FAE]">
          {message}
        </p>
      )}

      {isOwner && data.systems.length > 0 ? (
        <>
          <section className="mt-8 grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
            {(
              [
                [
                  'Confirmed revenue',
                  money(confirmedOwnerPayments.reduce((sum, x) => sum + x.amountKobo, 0)),
                  CircleDollarSign,
                ],
                [
                  'Awaiting allocation',
                  money(
                    confirmedOwnerPayments
                      .filter((x) => awaitingOwnerPaymentIDs.has(x.id))
                      .reduce((sum, x) => sum + x.amountKobo, 0),
                  ),
                  Network,
                ],
                [
                  'Approved allocations',
                  String(ownerAllocations.filter((x) => x.status === 'approved').length),
                  Check,
                ],
                [
                  'Rejected allocations',
                  String(ownerAllocations.filter((x) => x.status === 'rejected').length),
                  X,
                ],
              ] satisfies Array<[string, string, LucideIcon]>
            ).map(([label, value, Icon]) => (
              <div key={String(label)} className="bg-white p-6">
                <Icon className="h-4 w-4 text-[#1675DD]" />
                <p className="mt-5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </p>
                <p className="mt-2 font-mono text-2xl">{value}</p>
              </div>
            ))}
          </section>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold">Installations & tariffs</h2>
              {data.systems.map((system) => {
                const current = data.tariffs.find((x) => id(x.system) === system.id)
                return (
                  <form
                    key={system.id}
                    className="mt-4 border border-slate-200 p-4"
                    onSubmit={(event) => {
                      event.preventDefault()
                      const form = new FormData(event.currentTarget)
                      execute(
                        () =>
                          mutate('/app-api/v1/commerce/set-tariff', 'POST', {
                            systemID: system.id,
                            nairaPerKWh: Number(form.get('tariff')),
                          }),
                        'Tariff updated.',
                      )
                    }}
                  >
                    <p className="text-xs font-semibold">{system.name}</p>
                    <p className="mt-2 font-mono text-[10px] text-slate-500">
                      Customer code: {system.customerRegistrationCode || 'Generating…'}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <input
                        name="tariff"
                        type="number"
                        min="1"
                        step=".01"
                        defaultValue={current?.nairaPerKWh || 100}
                        className="min-w-0 flex-1 border border-slate-200 p-3 text-sm"
                      />
                      <button
                        disabled={pending}
                        className="bg-[#071426] px-4 text-xs font-bold text-white"
                      >
                        Save ₦/kWh
                      </button>
                    </div>
                  </form>
                )
              })}
            </section>
            <section className="border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold">Customer requests</h2>
              {ownerRelationships.map((relationship) => (
                <div
                  key={relationship.id}
                  className="mt-4 flex items-center justify-between border border-slate-200 p-4"
                >
                  <div>
                    <p className="text-xs font-semibold">{name(relationship.customer)}</p>
                    <p className="mt-1 text-[9px] uppercase text-slate-400">
                      {relationship.status}
                    </p>
                  </div>
                  {relationship.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        aria-label="Approve customer"
                        onClick={() =>
                          execute(
                            () =>
                              mutate(`/app-api/v1/connections/${relationship.id}`, 'PATCH', {
                                decision: 'approved',
                              }),
                            'Customer approved.',
                          )
                        }
                        className="grid h-9 w-9 place-items-center bg-emerald-600 text-white"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Reject customer"
                        onClick={() =>
                          execute(
                            () =>
                              mutate(`/app-api/v1/connections/${relationship.id}`, 'PATCH', {
                                decision: 'rejected',
                                reason: 'Owner declined this request.',
                              }),
                            'Customer rejected.',
                          )
                        }
                        className="grid h-9 w-9 place-items-center bg-red-600 text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {!ownerRelationships.length && (
                <p className="mt-5 text-xs text-slate-500">No requests yet.</p>
              )}
            </section>
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
            <section className="border border-slate-200 bg-white p-6">
              <Package className="h-5 w-5 text-[#1675DD]" />
              <h2 className="mt-4 text-sm font-semibold">Customer payment packages</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Packages lock the NGN amount. The kWh estimate always uses the active tariff
                captured when the customer starts payment.
              </p>
              {data.systems.map((system) => (
                <form
                  key={system.id}
                  className="mt-5 grid gap-3 border border-slate-200 p-4"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const form = new FormData(event.currentTarget)
                    execute(
                      () =>
                        mutate('/app-api/v1/commerce/create-payment-package', 'POST', {
                          systemID: system.id,
                          name: form.get('name'),
                          description: form.get('description'),
                          amountNaira: Number(form.get('amountNaira')),
                        }),
                      'Payment package created.',
                    )
                  }}
                >
                  <p className="text-xs font-semibold">{system.name}</p>
                  <input
                    name="name"
                    required
                    maxLength={80}
                    placeholder="Starter energy"
                    className="min-h-11 border border-slate-200 p-3 text-sm"
                  />
                  <input
                    name="description"
                    maxLength={160}
                    placeholder="Optional package note"
                    className="min-h-11 border border-slate-200 p-3 text-sm"
                  />
                  <input
                    name="amountNaira"
                    type="number"
                    min="100"
                    step="1"
                    required
                    placeholder="Amount in NGN"
                    className="min-h-11 border border-slate-200 p-3 text-sm"
                  />
                  <button
                    disabled={pending}
                    className="min-h-11 bg-[#071426] px-4 text-xs font-bold text-white"
                  >
                    Add package
                  </button>
                </form>
              ))}
              {data.packages
                .filter((item) => id(item.solarOwner) === user.id)
                .map((item) => (
                  <div
                    key={item.id}
                    className="mt-3 flex items-center justify-between border border-slate-200 p-4 text-xs"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-slate-500">
                        {money(item.amountKobo)} · {item.active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <Package className="h-4 w-4 text-[#1675DD]" />
                  </div>
                ))}
            </section>
            <section className="border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold">Payments & revenue</h2>
              <p className="mt-2 text-xs text-slate-500">
                Confirmed revenue excludes pending, failed, abandoned and reversed transactions.
              </p>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-xs">
                  <thead className="border-b border-slate-200 text-[9px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Reference</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownerPayments.slice(0, 12).map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-100">
                        <td className="py-4 font-semibold">{name(payment.customer)}</td>
                        <td className="py-4 font-mono text-[10px]">{payment.reference}</td>
                        <td className="py-4 text-slate-500">{date(payment.initiatedAt)}</td>
                        <td className="py-4">{money(payment.amountKobo)}</td>
                        <td className="py-4 uppercase text-slate-500">{payment.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!ownerPayments.length && (
                  <p className="py-8 text-xs text-slate-500">
                    No customer payment transactions yet.
                  </p>
                )}
              </div>
            </section>
          </div>
          <section className="mt-6 border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold">Allocation approvals</h2>
            {ownerAllocations.map((allocation) => {
              const payment = ownerPayments.find((item) => id(allocation.payment) === item.id)
              return (
                <div
                  key={allocation.id}
                  className="mt-4 flex flex-col justify-between gap-3 border border-slate-200 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="text-xs font-semibold">
                      {name(allocation.customer)} · {allocation.requestedKWh} kWh ·{' '}
                      {payment ? money(payment.amountKobo) : 'Payment unavailable'}
                    </p>
                    <p className="mt-1 font-mono text-[9px] text-slate-400">
                      {payment?.reference} · {date(allocation.requestedAt)} ·{' '}
                      {allocation.status.toUpperCase()}
                    </p>
                  </div>
                  {allocation.status === 'pending' && (
                    <div className="flex flex-col gap-2 sm:min-w-72">
                      <input
                        value={rejectionReasons[allocation.id] || ''}
                        onChange={(event) =>
                          setRejectionReasons((current) => ({
                            ...current,
                            [allocation.id]: event.target.value,
                          }))
                        }
                        placeholder="Reason required to reject"
                        maxLength={240}
                        className="min-h-10 border border-slate-200 p-2 text-xs"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            execute(
                              () =>
                                mutate(`/app-api/v1/allocations/${allocation.id}`, 'PATCH', {
                                  decision: 'approve',
                                }),
                              'Allocation approved.',
                            )
                          }
                          className="bg-emerald-600 px-4 py-3 text-xs font-bold text-white"
                        >
                          Approve
                        </button>
                        <button
                          disabled={!rejectionReasons[allocation.id]?.trim()}
                          onClick={() =>
                            execute(
                              () =>
                                mutate(`/app-api/v1/allocations/${allocation.id}`, 'PATCH', {
                                  decision: 'reject',
                                  reason: rejectionReasons[allocation.id],
                                }),
                              'Allocation rejected.',
                            )
                          }
                          className="border border-red-200 px-4 py-3 text-xs font-bold text-red-700 disabled:opacity-40"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                  {allocation.status === 'rejected' && (
                    <p className="text-xs text-red-700">{allocation.rejectionReason}</p>
                  )}
                </div>
              )
            })}
            {!ownerAllocations.length && (
              <p className="mt-5 text-xs text-slate-500">No allocation requests yet.</p>
            )}
          </section>
        </>
      ) : isOwner ? (
        <section className="mt-8 border border-slate-200 bg-white p-8 md:p-10">
          <Network className="h-5 w-5 text-[#1675DD]" />
          <h2 className="mt-5 text-xl font-semibold">Solar Owner workspace ready</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            This verified owner account has no solar installation connected yet. Owner controls,
            customer approvals and tariffs will appear after an installation record is provisioned.
          </p>
          <form
            className="mt-8 grid gap-4 border-t border-slate-100 pt-8 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault()
              const form = new FormData(event.currentTarget)
              execute(
                () =>
                  mutate('/app-api/v1/solar-systems', 'POST', {
                    name: form.get('name'),
                    siteReference: form.get('siteReference'),
                    locationLabel: form.get('locationLabel'),
                    capacityKW: Number(form.get('capacityKW')),
                    batteryCapacityKWh: form.get('batteryCapacityKWh')
                      ? Number(form.get('batteryCapacityKWh'))
                      : undefined,
                    inverterModel: form.get('inverterModel'),
                    panelModel: form.get('panelModel'),
                  }),
                'Solar installation created with an initial tariff.',
              )
            }}
          >
            <label className="text-xs font-semibold text-slate-600">
              Installation name
              <input
                name="name"
                required
                className="mt-2 min-h-11 w-full border border-slate-200 p-3 text-sm font-normal"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Site reference
              <input
                name="siteReference"
                className="mt-2 min-h-11 w-full border border-slate-200 p-3 text-sm font-normal"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600 md:col-span-2">
              Installation address
              <input
                name="locationLabel"
                required
                className="mt-2 min-h-11 w-full border border-slate-200 p-3 text-sm font-normal"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Solar capacity (kW)
              <input
                name="capacityKW"
                type="number"
                min=".1"
                step=".1"
                required
                className="mt-2 min-h-11 w-full border border-slate-200 p-3 text-sm font-normal"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Battery capacity (kWh, optional)
              <input
                name="batteryCapacityKWh"
                type="number"
                min="0"
                step=".1"
                className="mt-2 min-h-11 w-full border border-slate-200 p-3 text-sm font-normal"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Inverter model
              <input
                name="inverterModel"
                className="mt-2 min-h-11 w-full border border-slate-200 p-3 text-sm font-normal"
              />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Panel model
              <input
                name="panelModel"
                className="mt-2 min-h-11 w-full border border-slate-200 p-3 text-sm font-normal"
              />
            </label>
            <button
              disabled={pending}
              className="min-h-12 bg-[#071426] px-6 text-xs font-bold text-white md:col-span-2"
            >
              {pending ? 'Creating installation…' : 'Complete solar-system setup'}
            </button>
          </form>
        </section>
      ) : null}
      {!isOwner && (
        <>
          {!approved && (
            <form
              className="mt-8 border border-slate-200 bg-white p-6 md:p-8"
              onSubmit={(event) => {
                event.preventDefault()
                execute(
                  () => mutate('/app-api/v1/commerce/request-connection', 'POST', { code }),
                  'Connection request submitted.',
                )
              }}
            >
              <UserPlus className="h-5 w-5 text-[#1675DD]" />
              <h2 className="mt-5 text-xl font-semibold">Connect to a solar owner</h2>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="SS-XXXXXXXXXX"
                  required
                  className="min-h-11 flex-1 border border-slate-200 p-3 text-sm"
                />
                <button
                  disabled={pending}
                  className="bg-[#071426] px-6 text-xs font-bold text-white"
                >
                  Request connection
                </button>
              </div>
              {customerRelationships[0] && (
                <p className="mt-4 text-xs text-[#A45115]">
                  Request status: {customerRelationships[0].status}
                </p>
              )}
            </form>
          )}
          {approved && (
            <>
              <section className="mt-8 grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-5">
                {(
                  [
                    [
                      'Total paid',
                      money(successfulCustomerPayments.reduce((sum, x) => sum + x.amountKobo, 0)),
                      CircleDollarSign,
                    ],
                    [
                      'Latest payment',
                      latestPayment
                        ? `${money(latestPayment.amountKobo)} · ${latestPayment.status}`
                        : 'No payments',
                      CreditCard,
                    ],
                    [
                      'Pending allocation',
                      `${Math.round(pendingCustomerKWh * 1000) / 1000} kWh`,
                      Network,
                    ],
                    [
                      'Purchased energy',
                      `${successfulCustomerPayments.reduce((sum, x) => sum + x.energyKWh, 0).toFixed(3)} kWh`,
                      Gauge,
                    ],
                    ['Credited energy', `${wallet?.totalAllocatedKWh || 0} kWh`, WalletCards],
                  ] satisfies Array<[string, string, LucideIcon]>
                ).map(([label, value, Icon]) => (
                  <div key={label} className="bg-white p-6">
                    <Icon className="h-4 w-4 text-[#1675DD]" />
                    <p className="mt-5 text-[9px] font-bold uppercase text-slate-400">{label}</p>
                    <p className="mt-2 font-mono text-xl">{value}</p>
                  </div>
                ))}
              </section>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <form
                  className="border border-slate-200 bg-white p-6 md:p-8"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!reviewing) {
                      setReviewing(true)
                      return
                    }
                    execute(async () => {
                      const result = await mutate(
                        '/app-api/v1/commerce/initialize-payment',
                        'POST',
                        {
                          relationshipID: approved.id,
                          amountNaira: Number(amount),
                          packageID: selectedPackageID || undefined,
                        },
                      )
                      window.location.assign(result.authorizationURL)
                    }, 'Opening secure Paystack checkout.')
                  }}
                >
                  <CreditCard className="h-5 w-5 text-[#1675DD]" />
                  <h2 className="mt-5 text-2xl font-semibold">
                    {reviewing ? 'Review payment' : 'Buy Energy'}
                  </h2>
                  {availablePackages.length > 0 && !reviewing && (
                    <div className="mt-6">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Solar Owner packages
                      </p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {availablePackages.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedPackageID(item.id)
                              setAmount(String(item.amountKobo / 100))
                            }}
                            className={`border p-4 text-left ${selectedPackageID === item.id ? 'border-[#1675DD] bg-blue-50' : 'border-slate-200'}`}
                          >
                            <span className="block text-xs font-semibold">{item.name}</span>
                            <span className="mt-1 block font-mono text-sm">
                              {money(item.amountKobo)}
                            </span>
                            {item.description && (
                              <span className="mt-1 block text-[10px] text-slate-500">
                                {item.description}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {!reviewing && (
                    <>
                      <label className="mt-6 block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Custom NGN amount
                      </label>
                      <input
                        value={amount}
                        onChange={(event) => {
                          setSelectedPackageID('')
                          setAmount(event.target.value)
                        }}
                        type="number"
                        min="100"
                        step="1"
                        required
                        className="mt-2 w-full border border-slate-200 p-4 text-lg"
                      />
                    </>
                  )}
                  <div className="mt-4 grid grid-cols-2 border border-slate-200">
                    <div className="border-r p-4">
                      <p className="text-[9px] uppercase text-slate-400">Tariff</p>
                      <p className="mt-2 font-mono">₦{tariff?.nairaPerKWh || '—'}/kWh</p>
                    </div>
                    <div className="p-4">
                      <p className="text-[9px] uppercase text-slate-400">Equivalent</p>
                      <p className="mt-2 font-mono">{equivalent} kWh</p>
                    </div>
                  </div>
                  {reviewing && (
                    <div className="mt-4 border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                      You will pay <strong>{money(checkoutAmountKobo)}</strong> in NGN through
                      Paystack. The captured tariff is <strong>₦{tariff?.nairaPerKWh}/kWh</strong>,
                      producing an estimated <strong>{equivalent} kWh</strong>. Payment confirmation
                      is separate from Solar Owner allocation approval.
                    </div>
                  )}
                  <button
                    disabled={pending || !tariff || checkoutAmountKobo < 10_000}
                    className="mt-5 min-h-12 w-full bg-[#FF8A24] text-xs font-bold text-[#071426]"
                  >
                    {reviewing ? 'Confirm and continue to Paystack' : 'Review payment'}
                  </button>
                  {reviewing && (
                    <button
                      type="button"
                      onClick={() => setReviewing(false)}
                      className="mt-2 min-h-11 w-full border border-slate-200 text-xs font-bold"
                    >
                      Back to amount
                    </button>
                  )}
                </form>
                <section className="border border-slate-200 bg-white p-6">
                  <h2 className="text-sm font-semibold">Payment history</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="min-h-11 border border-slate-200 p-3 text-xs"
                    >
                      <option value="all">All statuses</option>
                      {[
                        'initiated',
                        'pending',
                        'successful',
                        'failed',
                        'abandoned',
                        'reversed',
                      ].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <input
                      value={dateFilter}
                      onChange={(event) => setDateFilter(event.target.value)}
                      type="date"
                      className="min-h-11 border border-slate-200 p-3 text-xs"
                    />
                  </div>
                  {filteredPayments.map((payment) => (
                    <div key={payment.id} className="mt-4 border-b border-slate-100 pb-4 text-xs">
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold">{money(payment.amountKobo)}</span>
                        <span className="uppercase text-slate-500">{payment.status}</span>
                      </div>
                      <p className="mt-1 font-mono text-[9px] text-slate-400">
                        {payment.energyKWh} kWh · {payment.reference}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">{date(payment.initiatedAt)}</p>
                      {(payment.status === 'successful' || payment.status === 'reversed') &&
                        payment.paidAt && (
                          <a
                            href={`/app-api/v1/payments/${payment.id}/receipt`}
                            className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold text-[#1675DD]"
                          >
                            <Download className="h-3.5 w-3.5" /> Download receipt
                          </a>
                        )}
                    </div>
                  ))}
                  {!filteredPayments.length && (
                    <p className="py-8 text-xs text-slate-500">No payments match these filters.</p>
                  )}
                </section>
              </div>
              <section className="mt-6 border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold">Pending & reviewed allocations</h2>
                {customerAllocations.map((allocation) => (
                  <div key={allocation.id} className="mt-4 border border-slate-200 p-4 text-xs">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="font-semibold">{allocation.requestedKWh} kWh</span>
                      <span className="uppercase text-slate-500">{allocation.status}</span>
                    </div>
                    <p className="mt-2 text-slate-500">
                      {allocation.status === 'pending'
                        ? 'Payment is confirmed. The Solar Owner must approve this allocation before your wallet is credited.'
                        : allocation.status === 'rejected'
                          ? `Payment remains successful, but allocation was rejected: ${allocation.rejectionReason || 'Contact the Solar Owner for next steps.'}`
                          : 'The allocation review is complete.'}
                    </p>
                  </div>
                ))}
                {!customerAllocations.length && (
                  <p className="mt-4 text-xs text-slate-500">No allocation requests yet.</p>
                )}
              </section>
              <section className="mt-6 border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold">Meter information</h2>
                <p className="mt-3 text-xs leading-6 text-slate-500">
                  No physical smart meter is connected. Verified consumption remains unavailable;
                  SolarShare does not fabricate usage.
                </p>
              </section>
            </>
          )}
        </>
      )}
    </main>
  )
}
