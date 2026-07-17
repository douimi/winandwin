import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { APIError } from 'better-auth/api'
import { eq } from 'drizzle-orm'
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
      // Moderation flow for the "public sign-up" flag.
      //
      // user.create.before — when the flag is OFF, mark every new user as
      //   'pending' before they hit the DB. Sign-up still succeeds; admins
      //   see the row in /admin/pending and activate manually.
      // session.create.before — reject session creation for pending users
      //   so a pending merchant who tries to sign in gets a clean 403 with
      //   a friendly code (`PENDING_ACTIVATION`) the sign-in form can
      //   translate into a message.
      //
      // On any DB error we fail open — a broken settings query shouldn't
      // wall off real visitors.
      databaseHooks: {
        user: {
          create: {
            before: async (userInput) => {
              const allowed = await getPublicSignupEnabled()
              if (allowed) return
              return {
                data: {
                  ...userInput,
                  activationStatus: 'pending',
                },
              }
            },
          },
        },
        session: {
          create: {
            before: async (sessionInput) => {
              const uid = (sessionInput as { userId?: string }).userId
              if (!uid) return
              try {
                const row = await getDb()
                  .select({ status: users.activationStatus })
                  .from(users)
                  .where(eq(users.id, uid))
                  .limit(1)
                if (row[0]?.status === 'pending') {
                  throw APIError.from('FORBIDDEN', {
                    message: 'Your account is awaiting approval. Our team will contact you shortly to complete the onboarding.',
                    code: 'PENDING_ACTIVATION',
                  })
                }
              } catch (err) {
                // Re-throw our own APIError; swallow anything else (fail
                // open on transient DB errors).
                if (err instanceof APIError) throw err
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
