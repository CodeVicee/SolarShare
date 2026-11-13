# SolarShare telemetry integration

## Current status

The telemetry ingestion pipeline is implemented, but no inverter, battery,
meter, gateway, or vendor account is connected. No genuine live reading has
been received or verified.

The only supported adapter is `generic-signed-webhook`. It is a provider-neutral
contract for gateways capable of sending HTTPS webhooks. It does not claim
compatibility with any named vendor.

## Adapter contract

Adapters implement `TelemetryAdapter` in `src/server/telemetry/types.ts`:

- request authentication and connection mode;
- provider payload parsing;
- mapping into normalized SolarShare readings;
- safe validation errors;
- provider/device connection state.

Provider-specific polling, token refresh, backoff, or webhook verification must
be added in a separate adapter after the provider, API documentation, account,
device model, and credential lifecycle are known. Do not infer those contracts.

## Configure a system

An authenticated owner registers a solar system, then configures:

- `integrationAdapter`: `generic-signed-webhook`;
- `gatewayReference`: the stable external system/device identifier;
- `telemetryStaleAfterSeconds`: 60–86400 seconds, default 900.

The configuration endpoint is:

```http
PATCH /app-api/v1/solar-systems/{id}
Content-Type: application/json

{
  "integrationAdapter": "generic-signed-webhook",
  "gatewayReference": "gateway-system-reference",
  "telemetryStaleAfterSeconds": 900
}
```

Ownership is enforced by Payload access control.

## Signed webhook

```http
POST /app-api/v1/telemetry
X-SolarShare-Adapter: generic-signed-webhook
X-SolarShare-Signature: sha256=<hex HMAC>
Content-Type: application/json
```

The signature is HMAC-SHA256 over the exact raw request body using
`TELEMETRY_INGESTION_SECRET`. Compare signatures before parsing the payload.

Example contract:

```json
{
  "systemReference": "gateway-system-reference",
  "eventId": "provider-event-unique-id",
  "measuredAt": "2026-01-02T03:04:05Z",
  "mode": "live",
  "deviceConnected": true,
  "inverterStatus": "connected",
  "readings": [
    {
      "type": "solar-generation-power",
      "value": 4860,
      "unit": "W",
      "quality": "verified"
    },
    {
      "type": "solar-generation-energy",
      "value": 18.4,
      "unit": "kWh",
      "quality": "verified"
    }
  ]
}
```

`mode` is one of `live`, `historical`, or `demo`. Missing mode defaults to
`historical`; missing quality defaults to `unverified`. Demo readings are stored
as demo/unverified and are excluded from genuine analytics.

Supported measurements:

| Provider type | Accepted unit | Stored unit |
| --- | --- | --- |
| `solar-generation-power` | W, kW | kW |
| `solar-generation-energy` | Wh, kWh | kWh |
| `household-consumption-power` | W, kW | kW |
| `household-consumption-energy` | Wh, kWh | kWh |
| `battery-state-of-charge` | % | % |
| `battery-charge-power` | W, kW | kW |
| `battery-discharge-power` | W, kW | kW |
| `grid-import-power` | W, kW | kW |
| `grid-import-energy` | Wh, kWh | kWh |
| `grid-export-power` | W, kW | kW |
| `grid-export-energy` | Wh, kWh | kWh |

Every timestamp is normalized to UTC. Unsupported units, non-finite or negative
values, future timestamps, duplicate measurements within one event, unknown
systems, and invalid signatures are rejected.

## Reliability behavior

- A deterministic SHA-256 key deduplicates each event/system/kind/unit.
- Duplicate events return successfully without creating another reading.
- Out-of-order readings remain historical and never move the system's current
  update timestamp backwards.
- Live status requires a verified reading, signed source, connected device, and
  a timestamp inside the configured freshness window.
- Offline or stale equipment retains historical records while current values
  are labelled historical or unavailable.
- Ingestion audit records store only safe status, counts, hashes, timestamps,
  and sanitized error codes—not raw payloads, signatures, or credentials.
- A per-process webhook limit of 120 requests per minute provides application
  protection. Production should also apply distributed rate limiting at the
  gateway/load-balancer layer.

## Historical analytics

```http
GET /app-api/v1/analytics?period=daily
GET /app-api/v1/analytics?period=weekly
GET /app-api/v1/analytics?period=monthly
GET /app-api/v1/analytics?period=yearly
```

Optional `from` and `to` UTC timestamps override the default period window.
Only accumulated `kWh` readings are summed. Instantaneous `kW` readings,
unverified readings, and demo readings are excluded. Missing intervals are not
fabricated.

## Connecting a real vendor

Required information:

1. Vendor and exact inverter/meter/battery/gateway model.
2. Official API or webhook documentation.
3. Whether the provider supports push webhooks, polling, or a local gateway.
4. Authentication method, token expiry/refresh behavior, and rate limits.
5. Stable site/device identifiers.
6. Supported measurements, units, timestamp semantics, and event IDs.
7. Webhook signature specification and retry behavior, when applicable.
8. A non-production device/account for verification.

Only after those details and credentials exist should a vendor adapter be
implemented and genuine readings be labelled live.
