import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { users } from '@winandwin/db'
import { auth } from './auth'
import { getDb } from './db'

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
}

export async function requireSession() {
  const session = await getSession()
  if (!session) {
    redirect('/sign-in')
  }
  return session
}

/**
 * Returns the merchantId for the currently logged-in user.
 * Queries the user row because better-auth does not expose custom columns
 * on the session object by default.
 */
export async function getMerchantId(userId: string): Promise<string | null> {
  const db = getDb()
  const row = await db
    .select({ merchantId: users.merchantId })
    .from(users)
    .where(eq(users.id, userId))
    .then((rows) => rows[0])
  return row?.merchantId ?? null
}

/**
 * Convenience: require session + resolve merchantId in one call.
 * Redirects to /sign-in if no session, returns merchantId (may be null if
 * merchant not yet created).
 */
export async function requireSessionWithMerchant() {
  const session = await requireSession()
  const merchantId = await getMerchantId(session.user.id)
  return { session, merchantId }
}
