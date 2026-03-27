import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { users, sessions, accounts, verifications } from '@winandwin/db'
import { createDb } from '@winandwin/db'

function buildAuth() {
  const db = createDb(process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost/placeholder')
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications,
      },
    }),
    secret: process.env.BETTER_AUTH_SECRET || 'build-time-placeholder-secret-not-used',
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
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

export const auth = buildAuth()
export type Session = typeof auth.$Infer.Session
