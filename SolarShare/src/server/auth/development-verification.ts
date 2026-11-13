import { createHash, timingSafeEqual } from 'node:crypto'

type Environment = Record<string, string | undefined>

export type DevelopmentVerificationPayload = {
  find(options: {
    collection: 'users'
    where: { email: { equals: string } }
    limit: 1
    depth: 0
    overrideAccess: true
    showHiddenFields: true
  }): Promise<{
    docs: Array<{ _verified?: boolean | null; _verificationToken?: null | string }>
  }>
  verifyEmail(options: { collection: 'users'; token: string }): Promise<boolean>
}

export class DevelopmentVerificationError extends Error {
  constructor(
    public readonly status: 401 | 403 | 404 | 409,
    message: string,
  ) {
    super(message)
    this.name = 'DevelopmentVerificationError'
  }
}

const digest = (value: string) => createHash('sha256').update(value).digest()

function secretsMatch(expected: string, provided: string) {
  if (expected.length < 32 || !provided) return false
  return timingSafeEqual(digest(expected), digest(provided))
}

function allowedEmails(env: Environment) {
  return new Set(
    (
      env.AUTH_TEST_RECOVERY_EMAILS_V2 ||
      env.AUTH_TEST_RECOVERY_EMAILS ||
      env.AUTH_TEST_VERIFICATION_EMAILS ||
      ''
    )
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function developmentVerificationAvailable(env: Environment) {
  return (
    (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') &&
    env.AUTH_TEST_VERIFICATION_ENABLED === 'true'
  )
}

export async function verifyDevelopmentTestAccount(input: {
  payload: DevelopmentVerificationPayload
  email: string
  providedSecret: string
  env?: Environment
}) {
  const env = input.env || process.env
  if (!developmentVerificationAvailable(env)) {
    throw new DevelopmentVerificationError(404, 'Not found.')
  }

  const expectedSecret =
    env.AUTH_TEST_RECOVERY_SECRET_V2 ||
    env.AUTH_TEST_RECOVERY_SECRET ||
    env.AUTH_TEST_VERIFICATION_SECRET ||
    ''
  if (!secretsMatch(expectedSecret, input.providedSecret)) {
    throw new DevelopmentVerificationError(401, 'Authentication failed.')
  }

  const email = input.email.trim().toLowerCase()
  if (!email || !allowedEmails(env).has(email)) {
    throw new DevelopmentVerificationError(403, 'This account is not authorized for testing.')
  }

  const result = await input.payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
  })
  const user = result.docs[0]
  if (!user) throw new DevelopmentVerificationError(404, 'Test account not found.')
  if (user._verified === true) return { verified: true, alreadyVerified: true }
  if (!user._verificationToken) {
    throw new DevelopmentVerificationError(409, 'The test account has no verification token.')
  }

  const verified = await input.payload.verifyEmail({
    collection: 'users',
    token: user._verificationToken,
  })
  if (!verified) {
    throw new DevelopmentVerificationError(409, 'Payload could not verify the test account.')
  }
  return { verified: true, alreadyVerified: false }
}
