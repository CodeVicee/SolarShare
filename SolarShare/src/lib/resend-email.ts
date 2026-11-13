import type { EmailAdapter, SendEmailOptions } from 'payload'

export class TransactionalEmailError extends Error {
  constructor(
    public readonly reason:
      | 'not-configured'
      | 'provider-rejected'
      | 'provider-unavailable'
      | 'runtime-blocked',
    message: string,
  ) {
    super(message)
    this.name = 'TransactionalEmailError'
  }
}

function addresses(value: SendEmailOptions['to']): string[] {
  if (!value) return []
  const values = Array.isArray(value) ? value : [value]
  return values.flatMap((entry) => {
    if (typeof entry === 'string') return [entry]
    if (entry && typeof entry === 'object' && 'address' in entry && entry.address) {
      return [String(entry.address)]
    }
    return []
  })
}

export const resendEmailAdapter: EmailAdapter = () => ({
  name: 'resend',
  defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@solarshare.invalid',
  defaultFromName: 'SolarShare',
  sendEmail: async (message) => {
    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.EMAIL_FROM_ADDRESS
    if (!apiKey || !from) {
      throw new TransactionalEmailError(
        'not-configured',
        'Transactional email is not configured.',
      )
    }

    let response: Response
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: addresses(message.to),
          cc: addresses(message.cc),
          bcc: addresses(message.bcc),
          subject: message.subject,
          html: typeof message.html === 'string' ? message.html : undefined,
          text: typeof message.text === 'string' ? message.text : undefined,
          reply_to: addresses(message.replyTo)[0],
        }),
      })
    } catch {
      console.error('[email] Resend request failed before receiving a response')
      throw new TransactionalEmailError(
        'provider-unavailable',
        'The transactional email provider is unavailable.',
      )
    }

    if (!response.ok) {
      console.error('[email] Resend rejected a message', { status: response.status })
      if (response.status === 520) {
        throw new TransactionalEmailError(
          'runtime-blocked',
          'Outbound email is unavailable in the Figma preview runtime. Use the published application to request this email.',
        )
      }
      throw new TransactionalEmailError(
        'provider-rejected',
        `The transactional email provider rejected the message (${response.status}).`,
      )
    }

    const responseBody = await response.text()
    if (!responseBody) return { status: response.status }
    try {
      return JSON.parse(responseBody)
    } catch {
      // A 2xx response is the delivery acceptance signal; response metadata is optional.
      return { status: response.status }
    }
  },
})
