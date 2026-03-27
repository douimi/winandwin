import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { users, sessions, accounts, verifications } from '@winandwin/db'
import { getDb } from './db'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _auth: any = null

/** Lazy singleton — only created when first accessed at runtime, never at build time */
export function getAuth() {
  if (!_auth) {
    _auth = betterAuth({
      database: drizzleAdapter(getDb(), {
        provider: 'pg',
        schema: {
          user: users,
          session: sessions,
          account: accounts,
          verification: verifications,
        },
      }),
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL,
      basePath: '/api/auth',
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
          enabled: true,
          maxAge: 5 * 60,
        },
      },
      plugins: [nextCookies()],
    })
  }
  return _auth as ReturnType<typeof betterAuth>
}

export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_, prop) {
    const instance = getAuth()
    const value = (instance as Record<string | symbol, unknown>)[prop]
    if (typeof value === 'function') {
      return (value as Function).bind(instance)
    }
    return value
  },
})

export type Session = ReturnType<typeof betterAuth>['$Infer']['Session']
