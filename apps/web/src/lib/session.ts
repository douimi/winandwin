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
export async function getUserInfo(userId: string): Promise<{ merchantId: string | null; isAdmin: boolean }> {
  const db = getDb()
  const row = await db
    .select({ merchantId: users.merchantId, isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, userId))
    .then((rows) => rows[0])
  return { merchantId: row?.merchantId ?? null, isAdmin: row?.isAdmin ?? false }
}

/** @deprecated Use getUserInfo instead */
export async function getMerchantId(userId: string): Promise<string | null> {
  const info = await getUserInfo(userId)
  return info.merchantId
}

/**
 * Convenience: require session + resolve merchantId + isAdmin in one call.
 */
export async function requireSessionWithMerchant() {
  const session = await requireSession()
  const { merchantId, isAdmin } = await getUserInfo(session.user.id)
  return { session, merchantId, isAdmin }
}
