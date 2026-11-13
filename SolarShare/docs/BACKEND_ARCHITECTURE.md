# SolarShare backend architecture

SolarShare uses the connected Figma-managed Payload backend. Payload is the
durable data layer, authentication provider, upload service, and canonical REST
API. The public application uses the separate `users` auth collection; Payload
Admin continues to use `admins`.

## Runtime boundaries

- `src/collections/`: database schema, ownership rules, relationship invariants,
  and workflow constraints.
- `src/server/solarshare/validation.ts`: transport-independent request
  allowlisting and validation.
- `src/server/solarshare/repository.ts`: authenticated Payload Local API access.
- `src/server/solarshare/analytics.ts`: deterministic energy, sharing, and alert
  calculations.
- `src/server/telemetry/`: signed ingestion adapters, normalization,
  deduplication, freshness mapping, and persistence.
- `src/server/commerce/`: tariffs, Paystack verification, transactional
  allocation, wallet/ledger accounting, and cumulative meter ingestion.
- `src/app/(frontend)/app-api/v1/[resource]/route.ts`: versioned HTTP adapter.
- `src/lib/dashboard-data.ts`: server-component facade used by the existing
  dashboard.
- `src/components/`: presentation and interaction only.

The validation, repository contracts, and JSON response envelopes can be mapped
to a future FastAPI service without changing dashboard presentation. FastAPI
would replace the route adapter and repository implementation, not the domain
contracts.

## Data model

- `users`: Payload-native credentials, verification, account status, provider
  identity, names, phone, avatar, theme, and notification preferences. The
  Payload document ID is the provider subject. Password hashes and session state
  remain owned by Payload.
- `solar-systems`: owner, site metadata, capacity, equipment references,
  connection state, data source, and battery details.
- `energy-records`: owner, system, reading kind, non-negative value, canonical
  unit, timestamp, source, source reference, and quality.
- `sharing-records`: sender, recipient, source system, quantity, allocation
  status, source, reference, and lifecycle timestamps. These records describe
  allocations or coordination. They are not evidence of physical electricity
  delivery.
- `app-notifications`: owner, type, severity, content, and read timestamp.
- `system-alerts`: owner, system, severity, category, description, lifecycle
  status, source, and alert timestamps.
- Commerce and customer-energy collections are described in
  [`COMMERCE_AND_METERING.md`](./COMMERCE_AND_METERING.md).

Payload supplies document IDs, relationship foreign keys, timestamps, and
database indexes declared with `index: true`. The Figma-managed adapter owns
physical database migrations; this project must not add SQL, DDL, or adapter
packages.

## Application API

All endpoints require the HTTP-only `app-session` cookie and return JSON.
Anonymous requests receive `401`. Collection access and explicit owner filters
are both applied server-side.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/app-api/v1/profile` | Safe current-user profile |
| GET/POST | `/app-api/v1/solar-systems` | List or register installations |
| GET | `/app-api/v1/energy-readings` | Paginated readings; supports `from`, `to`, and `kind` |
| GET | `/app-api/v1/analytics` | Energy, sharing, and alert summaries |
| GET/POST | `/app-api/v1/sharing` | List or propose allocation records |
| GET | `/app-api/v1/notifications` | Paginated account notifications |
| GET | `/app-api/v1/system-alerts` | Paginated equipment/system alerts |
| POST | `/app-api/v1/telemetry` | Signed equipment telemetry ingestion |
| PATCH | `/app-api/v1/solar-systems/{id}` | Configure an owned telemetry source |
| GET/POST | `/app-api/v1/commerce/{action}` | Provider lookup, connection requests, payments, and tariffs |
| PATCH | `/app-api/v1/connections/{id}` | Owner relationship review |
| PATCH | `/app-api/v1/allocations/{id}` | Owner allocation review |
| POST | `/app-api/v1/payments/webhook` | Paystack-signed payment notification |
| GET | `/payment/callback` | Server-side Paystack verification and dashboard redirect |

List endpoints accept `page` and `limit`; limits are clamped to 1–100.
Validation errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "fields": {}
  }
}
```

Payload also exposes its platform-managed `/api/*` endpoints. Browser
application code should use the app API or server actions so the dedicated app
session and ownership checks remain separate from Payload Admin authentication.

## Security

- Password hashing, verification tokens, lockouts, and sessions are Payload
  native.
- `app-session` is HTTP-only, secure in production, same-site `lax`, and never
  written to local storage.
- User-facing Local API calls pass the authenticated user and set
  `overrideAccess: false`.
- Owner and sharing-sender fields are assigned server-side and cannot be changed
  by submitted data.
- Relationships to solar systems are validated against the current owner.
- Overview analytics exclude unverified readings and non-energy (`kW`) samples.
- Authentication rate controls are configured in `Users.ts`.

Production HTTPS, database credentials, storage credentials, and database
least-privilege configuration are managed by the Figma/Payload platform.

## Environment and external services

Platform-owned Payload/Figma variables are injected automatically. Do not add
local database credentials.

Transactional email requires:

- `RESEND_API_KEY`
- `EMAIL_FROM_ADDRESS`

Signed gateway telemetry requires:

- `TELEMETRY_INGESTION_SECRET`

Paystack test checkout requires:

- `PAYSTACK_SECRET_KEY` with an `sk_test_` key

Live Paystack keys are rejected unless `PAYSTACK_ALLOW_LIVE=true`. Live mode
must not be enabled until operational payment and refund procedures have been
approved.

`FIGMA_PUBLIC_URL` supplies the deployed public URL. SMS phone verification is
not configured and requires a separate provider before phone ownership can be
claimed as verified.

## Local verification and deployment

The supervised development server starts automatically in Figma Make.

```sh
pnpm install
pnpm test
pnpm exec tsc --noEmit
NODE_ENV=production pnpm run build
NODE_ENV=production figma make verify-deploy
```

Publish through the normal Figma Make publish/deploy workflow. Do not run local
database migrations or add a database adapter; schema synchronization belongs to
the managed backend lifecycle.
