
import { cookies, headers } from 'next/headers'
import type { ServerAdapter } from 'payload'
import { logout } from 'payload/auth'
import config from '@payload-config'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const requestHeaders = await headers()

  const serverAdapter: ServerAdapter = {
    forbidden: () => {
      throw new Error('Unexpected forbidden response during logout')
    },

    getCookies: () => ({
      get: (name) => cookieStore.get(name) ?? undefined,
      getAll: () =>
        cookieStore.getAll().map(({ name, value }) => ({ name, value })),
      set: (name, value, options) => {
        cookieStore.set(name, value, options)
      },
    }),

    getHeaders: () => requestHeaders,

    notFound: () => {
      throw new Error('Unexpected not-found response during logout')
    },

    permanentRedirect: (path) => {
      throw new Error(`Unexpected permanent redirect: ${path}`)
    },

    redirect: (path) => {
      throw new Error(`Unexpected redirect: ${path}`)
    },

    setCookie: (name, value, options) => {
      cookieStore.set(name, value, options)
    },

    unauthorized: () => {
      throw new Error('Unexpected unauthorized response during logout')
    },
  }

  await logout({ config, serverAdapter })

  const redirectURL = new URL(
  '/',
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
)

return Response.redirect(redirectURL, 303)
}
