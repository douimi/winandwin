import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { APIError } from 'better-auth/api'
import { users, sessions, accounts, verifications } from '@winandwin/db'
import { getDb } from './db'
import { getPublicSignupEnabled } from './platform-flags'

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
      // Accept requests coming from both the apex domain and the www.
      // subdomain (whichever way the visitor typed the URL). Without this,
      // hitting www.winandwin.club when BETTER_AUTH_URL points at the apex
      // (or vice-versa) triggers a CSRF/invalid-origin 403.
      trustedOrigins: [
        'https://winandwin.club',
        'https://www.winandwin.club',
        'http://localhost:3000',
      ],
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
      },
      // Google OAuth — enabled when both env vars are present. Kept optional
      // so local/preview envs without Google credentials still boot.
      socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : undefined,
      // Auto-link a fresh Google sign-in to an existing account that shares
      // the same email. Without this better-auth returns
      // `unable_to_link_account` when a merchant who signed up with
      // email/password later tries the Google button. Google always returns
      // a verified email so trusting it here is safe.
      account: {
        accountLinking: {
          enabled: true,
          trustedProviders: ['google'],
        },
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
          enabled: true,
          maxAge: 5 * 60,
        },
      },
      // Enforce the "Try the app" toggle at the DB write step so it blocks
      // BOTH email/password sign-ups AND Google OAuth flows for brand-new
      // accounts. Existing users signing in via Google trigger an account-
      // link (not a create), so they're never affected. When the flag is
      // absent we fail open — a broken settings query shouldn't wall off
      // real visitors.
      databaseHooks: {
        user: {
          create: {
            before: async () => {
              const allowed = await getPublicSignupEnabled()
              if (!allowed) {
                throw APIError.from('FORBIDDEN', {
                  message: 'Public sign-up is currently disabled. Please contact us to open an account.',
                  code: 'PUBLIC_SIGNUP_DISABLED',
                })
              }
            },
          },
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
