# Authentication testing

SolarShare uses Payload-native email/password authentication in every environment.
Production email verification remains mandatory.

## Development-only verification

The optional test endpoint is:

```text
POST /app-api/v1/auth/test-verify
```

It is available only when all of these server-side conditions are true:

- `NODE_ENV` is `development` or `test`;
- `AUTH_TEST_VERIFICATION_ENABLED` is exactly `true`;
- the submitted email is listed in `AUTH_TEST_RECOVERY_EMAILS_V2` when
  configured, then `AUTH_TEST_RECOVERY_EMAILS`, otherwise
  `AUTH_TEST_VERIFICATION_EMAILS`;
- `x-solarshare-test-verification` matches `AUTH_TEST_RECOVERY_SECRET_V2` when
  configured, then `AUTH_TEST_RECOVERY_SECRET`, otherwise
  `AUTH_TEST_VERIFICATION_SECRET`;
- the secret is at least 32 characters.

Example request shape:

```sh
curl -X POST \
  -H 'content-type: application/json' \
  -H 'x-solarshare-test-verification: <server-side test secret>' \
  -d '{"email":"authorized-test@example.test"}' \
  http://localhost:3000/app-api/v1/auth/test-verify
```

Never put the test secret in frontend code, browser storage, screenshots, or
committed files. The endpoint reads Payload's verification token on the server
and calls Payload's native `verifyEmail`; it never returns that token.

When `NODE_ENV=production`, the endpoint returns `404` even if all test
variables are accidentally present. Published SolarShare accounts must continue
through normal email verification.

## Email runtime behavior

The Figma Make preview runtime currently rejects outbound requests to Resend
with HTTP 520. Use the published application to test real email delivery. A
successful provider API response confirms acceptance, not inbox receipt; check
Resend delivery logs and the recipient inbox separately.
