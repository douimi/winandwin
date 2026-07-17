import 'server-only'
import { eq } from 'drizzle-orm'
import { platformSettings } from '@winandwin/db'
import { getDb } from './db'

// Platform-wide feature flags stored in `platform_settings`. All flags are
// read on demand from the database so an admin can flip them from the admin
// console without a redeploy.
//
// Key: `public_signup_enabled`
//   true  → visitors can self-serve sign up at /sign-up
//   false → /sign-up shows a "Contact us" card, better-auth refuses to
//           create new users, and Google OAuth for brand-new accounts is
//           blocked at the user-create hook. Existing merchants can still
//           sign in either way.

const KEY_PUBLIC_SIGNUP_ENABLED = 'public_signup_enabled' as const

/**
 * Whether public sign-up is currently enabled. Defaults to `true` when the
 * row is missing so a fresh Neon instance behaves like it always did.
 * Any DB / parse failure also defaults to `true` — a broken settings query
 * shouldn't wall off sign-up for real visitors.
 */
export async function getPublicSignupEnabled(): Promise<boolean> {
  try {
    const rows = await getDb()
      .select({ value: platformSettings.value })
      .from(platformSettings)
      .where(eq(platformSettings.key, KEY_PUBLIC_SIGNUP_ENABLED))
      .limit(1)

    const raw = rows[0]?.value
    if (raw === undefined || raw === null) return true
    if (typeof raw === 'boolean') return raw
    if (typeof raw === 'string') return raw !== 'false'
    if (typeof raw === 'object' && raw !== null && 'enabled' in raw) {
      const inner = (raw as { enabled: unknown }).enabled
      return inner !== false
    }
    return true
  } catch {
    return true
  }
}
