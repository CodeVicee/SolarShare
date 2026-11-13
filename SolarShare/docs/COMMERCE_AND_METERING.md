# SolarShare commerce and metering

## Scope and safety

SolarShare records payments, owner-approved energy allocations, wallet credits,
and verified consumption. A payment or wallet credit is an accounting event. It
does not prove electricity was physically delivered. No automatic settlement
or transfer to solar owners is implemented.

## Model

- `solar-owner-profiles` and `customer-profiles`: role-specific account state.
- `customer-relationships`: customer invitation/request lifecycle for one
  installation.
- `energy-tariffs`: effective tariff history; the active default is ₦100/kWh.
- `payment-transactions`: Paystack references and immutable purchase-time
  amount, tariff, and energy equivalent.
- `energy-allocation-requests`: one idempotent request per verified payment.
- `energy-allocation-records`: one immutable owner approval result per request.
- `energy-wallets`: cached balance and totals for fast display.
- `energy-ledger-entries`: immutable owner-inventory and customer-wallet audit
  entries with unique idempotency keys.
- `meter-registrations`: pre-provisioned stable meter identity and last accepted
  cumulative reading.
- `meter-readings`: accepted and rejected provider readings, including quality
  and deduplication identity.
- `consumption-records`: wallet application result for a positive verified
  cumulative-reading delta.

Wallet fields are caches; the ledger is the accounting audit trail. Payments
and energy ledger entries remain separate.

## Invariants

1. Customer registration codes are generated server-side for installations.
2. Only approved customer relationships can initialize a payment.
3. Each payment stores its tariff and computed kWh at purchase time.
4. Browser redirects never credit energy. The server verifies reference,
   amount, currency, and success with Paystack.
5. `payment-transactions.reference`,
   `energy-allocation-requests.payment`, allocation request relationships, and
   ledger idempotency keys are unique. Payment and allocation state changes run
   in Payload transactions. Owner inventory and customer wallets also use
   version-checked compare-and-swap updates, so concurrent approvals or meter
   debits cannot silently overwrite one another.
6. An allocation cannot exceed `solar-systems.allocatableEnergyKWh`. That
   inventory defaults to zero and has no customer/owner input route; only a
   future verified telemetry or audited inventory process may credit it.
7. Wallets never go negative. A meter delta larger than available credit is
   recorded as `insufficient-credit` and is not applied to wallet totals.
8. Only verified, ordered cumulative readings from an active, pre-provisioned
   meter can debit a wallet. Estimated, unverified, decreasing, and out-of-order
   readings are retained but not applied.
9. Consumption stays explicitly unavailable when no meter is connected.

For Mr. A’s ₦100/kWh tariff, Mr. B’s verified ₦5,000 payment creates a 50 kWh
allocation request. Mr. B’s wallet is credited only after Mr. A approves and
the installation has at least 50 kWh of verified allocatable inventory.

## Application endpoints

All commerce endpoints except Paystack’s webhook and callback require the
existing HTTP-only SolarShare app session.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/app-api/v1/commerce/lookup-provider?code=…` | Validate a registration code |
| POST | `/app-api/v1/commerce/request-connection` | Request an owner relationship |
| POST | `/app-api/v1/commerce/initialize-payment` | Create a local transaction and Paystack checkout |
| POST | `/app-api/v1/commerce/set-tariff` | Set an owned installation’s active tariff |
| PATCH | `/app-api/v1/connections/{id}` | Approve, reject, suspend, or disconnect a customer |
| PATCH | `/app-api/v1/allocations/{id}` | Approve or reject a pending allocation |
| POST | `/app-api/v1/payments/webhook` | Verify Paystack HMAC and re-verify a successful charge |
| GET | `/payment/callback?reference=…` | Re-verify and redirect to Energy Management |

Meter ingestion is deliberately a server-only service
(`ingestMeterReading`). A future provider adapter must authenticate its request
before calling it. There is no anonymous generic meter endpoint.

## Paystack sandbox configuration

Set `PAYSTACK_SECRET_KEY` to a Paystack test secret (`sk_test_…`). The secret is
read only by server code. Configure the Paystack test webhook URL as:

```text
https://<published-origin>/app-api/v1/payments/webhook
```

The handler validates `x-paystack-signature` with HMAC-SHA512 and then calls
Paystack’s transaction verification API. `PAYSTACK_ALLOW_LIVE` is unset by
default; a live secret is rejected unless it is explicitly set to `true`.

Automated refunds are **not implemented**. A rejected allocation is retained
with a payment-resolution/refund-review requirement. Operators must resolve the
payment outside this workflow and must not mark a payment refunded without a
verified refund process.

## Email and notifications

Owner and customer events use `app-notifications`. When the existing Resend
transport is configured (`RESEND_API_KEY` and `EMAIL_FROM_ADDRESS`), verified
payments also attempt an owner email. Email failure does not reverse a verified
payment.

## Current readiness

- Tariff, checkout initialization, server verification, webhook HMAC,
  idempotent allocation request creation, owner review, transactional ledger,
  wallet, and low-balance logic are implemented.
- Meter schemas and server-only cumulative-reading ingestion are implemented.
  No physical meter provider or meter provisioning UI is connected.
- Owner inventory cannot currently be credited from the browser. A verified
  generation/audited inventory source is required before allocation approval.
- No owner fund settlement and no automated Paystack refund are implemented.
- Unit tests do not contact Paystack or create charges. A full sandbox checkout
  requires a configured Paystack test account and an interactive test-card
  session.
