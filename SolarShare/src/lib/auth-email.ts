export function getApplicationOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.FIGMA_PUBLIC_URL
  if (!configured) throw new Error('The application URL is not configured.')

  const url = new URL(configured)
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('The application URL must use HTTP or HTTPS.')
  }
  return url.origin
}

export function getVerificationURL(token: string) {
  const url = new URL('/verify-email', getApplicationOrigin())
  url.searchParams.set('token', token)
  return url.toString()
}

export function getPasswordResetURL(token: string) {
  const url = new URL('/reset-password', getApplicationOrigin())
  url.searchParams.set('token', token)
  return url.toString()
}
