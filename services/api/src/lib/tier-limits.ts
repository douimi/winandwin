import { eq } from 'drizzle-orm'
import { platformSettings } from '@winandwin/db/schema'
import { TIER_LIMITS } from '@winandwin/shared/constants'
import type { Database } from '@winandwin/db'

// Module-level cache for tier limits from DB
let cachedMergedLimits: Record<string, Record<string, unknown>> | null = null
let tierLimitsCachedAt = 0
const TIER_LIMITS_CACHE_TTL = 30 * 1000 // 30 seconds (short cache for quick updates)

/** Deep merge DB tier limits over hardcoded defaults */
export async function getTierLimits(db: Database): Promise<typeof TIER_LIMITS> {
  const now = Date.now()
  if (cachedMergedLimits && now - tierLimitsCachedAt < TIER_LIMITS_CACHE_TTL) {
    return cachedMergedLimits as unknown as typeof TIER_LIMITS
  }

  try {
    const result = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, 'tier_limits'))
      .limit(1)

    if (result.length > 0 && result[0]!.value) {
      const dbLimits = result[0]!.value as Record<string, Record<string, unknown>>
      // Deep merge: for each tier, merge DB values over defaults
      const merged: Record<string, Record<string, unknown>> = {}
      for (const tier of Object.keys(TIER_LIMITS)) {
        const defaults = TIER_LIMITS[tier as keyof typeof TIER_LIMITS]
        const overrides = dbLimits[tier] || {}
        merged[tier] = { ...defaults, ...overrides }
      }
      cachedMergedLimits = merged
      tierLimitsCachedAt = now
      return merged as unknown as typeof TIER_LIMITS
    }
  } catch (err) {
    console.error('Failed to fetch tier limits from DB, using defaults:', err)
  }

  return TIER_LIMITS
}
