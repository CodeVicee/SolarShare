import { afterEach, describe, expect, it } from 'vitest'
import { getApplicationOrigin, getPasswordResetURL, getVerificationURL } from './auth-email'

const previousPublicURL = process.env.NEXT_PUBLIC_SITE_URL
const previousFigmaURL = process.env.FIGMA_PUBLIC_URL

afterEach(() => {
  if (previousPublicURL === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
  else process.env.NEXT_PUBLIC_SITE_URL = previousPublicURL
  if (previousFigmaURL === undefined) delete process.env.FIGMA_PUBLIC_URL
  else process.env.FIGMA_PUBLIC_URL = previousFigmaURL
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

  it('falls back to the Figma runtime origin and rejects unsafe protocols', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    process.env.FIGMA_PUBLIC_URL = 'https://preview.example'
    expect(getApplicationOrigin()).toBe('https://preview.example')
    process.env.FIGMA_PUBLIC_URL = 'javascript:alert(1)'
    expect(() => getApplicationOrigin()).toThrow('HTTP or HTTPS')
  })
})
