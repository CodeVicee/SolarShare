export type PayloadLoginClient = {
  login(options: {
    collection: 'users'
    data: { email: string; password: string }
    overrideAccess: true
  }): Promise<{ token?: null | string; user?: unknown; exp?: number }>
}

export type PayloadLoginOutcome =
  | { status: 'authenticated'; token: string; user: unknown; exp?: number }
  | { status: 'unverified' | 'locked' | 'invalid' | 'unavailable' }

export async function authenticatePayloadUser(
  payload: PayloadLoginClient,
  email: string,
  password: string,
): Promise<PayloadLoginOutcome> {
  try {
    const result = await payload.login({
      collection: 'users',
      data: { email, password },
      overrideAccess: true,
    })
    if (!result.token || !result.user) return { status: 'unavailable' }
    return {
      status: 'authenticated',
      token: result.token,
      user: result.user,
      exp: result.exp,
    }
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    const message = error instanceof Error ? error.message : ''
    if (name === 'UnverifiedEmail' || /unverified/i.test(message)) {
      return { status: 'unverified' }
    }
    if (name === 'LockedAuth' || /locked/i.test(message)) {
      return { status: 'locked' }
    }
    return { status: 'invalid' }
  }
}
