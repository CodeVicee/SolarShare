
import { afterEach, describe, expect, it } from 'vitest'
import {
  getApplicationOrigin,
  getPasswordResetURL,
  getVerificationURL,
} from './auth-email'

const previousPublicURL = process.env.NEXT_PUBLIC_SITE_URL

afterEach(() => {
  if (previousPublicURL === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = previousPublicURL
  }
})

describe('authentication email URLs', () => {
  it('uses the public site origin and safely encodes verification tokens', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://solarshare.example/path'

    expect(getApplicationOrigin()).toBe('https://solarshare.example')

    expect(getVerificationURL('a token&value')).toBe(
      'https://solarshare.example/verify-email?token=a+token%26value',
    )

    expect(getPasswordResetURL('reset-token')).toBe(
      'https://solarshare.example/reset-password?token=reset-token',
    )
  })

  it('rejects missing application URLs', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL

    expect(() => getApplicationOrigin()).toThrow(
      'The application URL is not configured.',
    )
  })

  it('rejects unsafe URL protocols', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'javascript:alert(1)'

    expect(() => getApplicationOrigin()).toThrow('HTTP or HTTPS')
  })
})
