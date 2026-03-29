import { Hono } from 'hono'
import { eq, and, gte, sql, count, desc, ilike } from 'drizzle-orm'
import { merchants, games, gamePlays, players, coupons, ctas, users, platformSettings, prizes } from '@winandwin/db/schema'
import { TIER_LIMITS } from '@winandwin/shared/constants'
import type { AppEnv } from '../types'

export const adminRouter = new Hono<AppEnv>()

// Helper: get tier limits from DB, falling back to hardcoded defaults
// biome-ignore lint/suspicious/noExplicitAny: db type is complex
async function getDbTierLimits(db: any): Promise<Record<string, { monthlyPlays: number }>> {
  try {
    const result = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, 'tier_limits'))
      .limit(1)

    if (result.length > 0 && result[0]!.value) {
      return result[0]!.value as Record<string, { monthlyPlays: number }>
    }
  } catch {
    // fall through to defaults
  }
  return {
    free: { monthlyPlays: TIER_LIMITS.free.monthlyPlays },
    starter: { monthlyPlays: TIER_LIMITS.starter.monthlyPlays },
    pro: { monthlyPlays: TIER_LIMITS.pro.monthlyPlays === Infinity ? 999999 : TIER_LIMITS.pro.monthlyPlays },
    enterprise: { monthlyPlays: TIER_LIMITS.enterprise.monthlyPlays === Infinity ? 999999 : (TIER_LIMITS.enterprise.monthlyPlays as number) },
  }
}

// ---------------------------------------------------------------------------
// GET /stats — Platform-wide stats
// ---------------------------------------------------------------------------
adminRouter.get('/stats', async (c) => {
  try {
    const db = c.get('db')

    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setUTCHours(0, 0, 0, 0)

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalMerchantsResult,
      totalPlayersResult,
      gamesTodayResult,
      gamesWeekResult,
      gamesMonthResult,
      totalCouponsResult,
      redeemedCouponsResult,
      newMerchantsWeekResult,
      disabledMerchantsResult,
      topMerchantsResult,
      recentPlaysResult,
    ] = await Promise.all([
      // Total merchants
      db.select({ count: sql<number>`count(*)::int` }).from(merchants),
      // Total players
      db.select({ count: sql<number>`count(*)::int` }).from(players),
      // Games today
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(gamePlays)
        .where(gte(gamePlays.playedAt, todayStart)),
      // Games this week
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(gamePlays)
        .where(gte(gamePlays.playedAt, oneWeekAgo)),
      // Games this month
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(gamePlays)
        .where(gte(gamePlays.playedAt, oneMonthAgo)),
      // Total coupons generated
      db.select({ count: sql<number>`count(*)::int` }).from(coupons),
      // Total coupons redeemed
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(coupons)
        .where(eq(coupons.status, 'redeemed')),
      // New merchants this week
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(merchants)
        .where(gte(merchants.createdAt, oneWeekAgo)),
      // Disabled merchants
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(merchants)
        .where(eq(merchants.disabled, true)),
      // Top 5 merchants by plays this week
      db
        .select({
          merchantId: gamePlays.merchantId,
          plays: sql<number>`count(*)::int`,
        })
        .from(gamePlays)
        .where(gte(gamePlays.playedAt, oneWeekAgo))
        .groupBy(gamePlays.merchantId)
        .orderBy(desc(sql`count(*)`))
        .limit(5),
      // Recent 10 game plays across all merchants
      db
        .select({
          id: gamePlays.id,
          merchantId: gamePlays.merchantId,
          result: gamePlays.result,
          playedAt: gamePlays.playedAt,
        })
        .from(gamePlays)
        .orderBy(desc(gamePlays.playedAt))
        .limit(10),
    ])

    // Fetch merchant names for top merchants and recent plays
    const allMerchantIds = new Set<string>()
    for (const r of topMerchantsResult) allMerchantIds.add(r.merchantId)
    for (const r of recentPlaysResult) allMerchantIds.add(r.merchantId)

    let nameMap = new Map<string, string>()
    if (allMerchantIds.size > 0) {
      const ids = [...allMerchantIds]
      const merchantRows = await db
        .select({ id: merchants.id, name: merchants.name })
        .from(merchants)
        .where(sql`${merchants.id} IN (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`)
      nameMap = new Map(merchantRows.map((m) => [m.id, m.name]))
    }

    const topMerchants = topMerchantsResult.map((r) => ({
      id: r.merchantId,
      name: nameMap.get(r.merchantId) ?? 'Unknown',
      plays: r.plays,
    }))

    const recentActivity = recentPlaysResult.map((r) => ({
      id: r.id,
      merchantId: r.merchantId,
      merchantName: nameMap.get(r.merchantId) ?? 'Unknown',
      result: r.result,
      playedAt: r.playedAt.toISOString(),
    }))

    return c.json({
      success: true,
      data: {
        totalMerchants: totalMerchantsResult[0]?.count ?? 0,
        totalPlayers: totalPlayersResult[0]?.count ?? 0,
        gamesPlayedToday: gamesTodayResult[0]?.count ?? 0,
        gamesPlayedThisWeek: gamesWeekResult[0]?.count ?? 0,
        gamesPlayedThisMonth: gamesMonthResult[0]?.count ?? 0,
        totalCouponsGenerated: totalCouponsResult[0]?.count ?? 0,
        totalCouponsRedeemed: redeemedCouponsResult[0]?.count ?? 0,
        revenue: 0,
        newMerchantsThisWeek: newMerchantsWeekResult[0]?.count ?? 0,
        disabledMerchants: disabledMerchantsResult[0]?.count ?? 0,
        topMerchants,
        recentActivity,
      },
    })
  } catch (err) {
    console.error('Error getting admin stats:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get admin stats' } },
      500,
    )
  }
})

// ---------------------------------------------------------------------------
// GET /merchants — List all merchants with usage data
// ---------------------------------------------------------------------------
adminRouter.get('/merchants', async (c) => {
  try {
    const db = c.get('db')
    const search = c.req.query('search') ?? ''

    // Get all merchants
    let merchantList
    if (search) {
      merchantList = await db
        .select()
        .from(merchants)
        .where(ilike(merchants.name, `%${search}%`))
        .orderBy(desc(merchants.createdAt))
    } else {
      merchantList = await db
        .select()
        .from(merchants)
        .orderBy(desc(merchants.createdAt))
    }

    // Get tier limits from DB
    const tierLimits = await getDbTierLimits(db)

    // Get monthly play counts and player counts for each merchant
    const monthStart = new Date()
    monthStart.setUTCDate(1)
    monthStart.setUTCHours(0, 0, 0, 0)

    const [monthlyPlayCounts, playerCounts, totalPlayCounts] = await Promise.all([
      db
        .select({
          merchantId: gamePlays.merchantId,
          count: sql<number>`count(*)::int`,
        })
        .from(gamePlays)
        .where(gte(gamePlays.playedAt, monthStart))
        .groupBy(gamePlays.merchantId),
      db
        .select({
          merchantId: players.merchantId,
          count: sql<number>`count(*)::int`,
        })
        .from(players)
        .groupBy(players.merchantId),
      db
        .select({
          merchantId: gamePlays.merchantId,
          count: sql<number>`count(*)::int`,
        })
        .from(gamePlays)
        .groupBy(gamePlays.merchantId),
    ])

    const monthlyPlaysMap = new Map(monthlyPlayCounts.map((r) => [r.merchantId, r.count]))
    const playersMap = new Map(playerCounts.map((r) => [r.merchantId, r.count]))
    const totalPlaysMap = new Map(totalPlayCounts.map((r) => [r.merchantId, r.count]))

    const data = merchantList.map((m) => {
      const tier = m.subscriptionTier as string
      const tierConfig = tierLimits[tier] as { monthlyPlays: number } | undefined
      const monthlyLimit = tierConfig?.monthlyPlays ?? 200
      const playsThisMonth = monthlyPlaysMap.get(m.id) ?? 0

      return {
        id: m.id,
        name: m.name,
        slug: m.slug,
        email: m.email,
        category: m.category,
        subscriptionTier: m.subscriptionTier,
        disabled: m.disabled,
        totalPlayers: playersMap.get(m.id) ?? 0,
        totalGamesPlayed: totalPlaysMap.get(m.id) ?? 0,
        playsThisMonth,
        monthlyLimit: monthlyLimit >= 999999 ? null : monthlyLimit,
        createdAt: m.createdAt.toISOString(),
      }
    })

    return c.json({ success: true, data })
  } catch (err) {
    console.error('Error listing merchants for admin:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list merchants' } },
      500,
    )
  }
})

// ---------------------------------------------------------------------------
// GET /merchants/:id — Merchant detail with all related data
// ---------------------------------------------------------------------------
adminRouter.get('/merchants/:id', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    const merchantResult = await db
      .select()
      .from(merchants)
      .where(eq(merchants.id, id))
      .limit(1)

    if (merchantResult.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } },
        404,
      )
    }

    const merchant = merchantResult[0]!

    // Get tier limits from DB
    const tierLimits = await getDbTierLimits(db)
    const tier = merchant.subscriptionTier as string
    const tierConfig = tierLimits[tier] as { monthlyPlays: number } | undefined
    const monthlyLimit = tierConfig?.monthlyPlays ?? 200

    const monthStart = new Date()
    monthStart.setUTCDate(1)
    monthStart.setUTCHours(0, 0, 0, 0)

    const [
      playsThisMonthResult,
      merchantGames,
      merchantCoupons,
      playerCountResult,
      merchantCtas,
      recentPlayersResult,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(gamePlays)
        .where(and(eq(gamePlays.merchantId, id), gte(gamePlays.playedAt, monthStart))),
      db
        .select()
        .from(games)
        .where(eq(games.merchantId, id))
        .orderBy(desc(games.createdAt)),
      db
        .select()
        .from(coupons)
        .where(eq(coupons.merchantId, id))
        .orderBy(desc(coupons.createdAt))
        .limit(50),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(players)
        .where(eq(players.merchantId, id)),
      db
        .select()
        .from(ctas)
        .where(eq(ctas.merchantId, id)),
      db
        .select()
        .from(players)
        .where(eq(players.merchantId, id))
        .orderBy(desc(players.lastSeenAt))
        .limit(20),
    ])

    // Get play counts per game
    const gamePlayCounts = await db
      .select({
        gameId: gamePlays.gameId,
        count: sql<number>`count(*)::int`,
      })
      .from(gamePlays)
      .where(eq(gamePlays.merchantId, id))
      .groupBy(gamePlays.gameId)

    const gamePlayMap = new Map(gamePlayCounts.map((r) => [r.gameId, r.count]))

    return c.json({
      success: true,
      data: {
        merchant: {
          id: merchant.id,
          name: merchant.name,
          slug: merchant.slug,
          email: merchant.email,
          category: merchant.category,
          phone: merchant.phone,
          subscriptionTier: merchant.subscriptionTier,
          disabled: merchant.disabled,
          createdAt: merchant.createdAt.toISOString(),
        },
        usage: {
          playsThisMonth: playsThisMonthResult[0]?.count ?? 0,
          monthlyLimit: monthlyLimit >= 999999 ? null : monthlyLimit,
          tier,
        },
        games: merchantGames.map((g) => ({
          id: g.id,
          name: g.name,
          type: g.type,
          status: g.status,
          playsCount: gamePlayMap.get(g.id) ?? 0,
          createdAt: g.createdAt.toISOString(),
        })),
        coupons: merchantCoupons.map((cp) => ({
          id: cp.id,
          code: cp.code,
          prizeName: cp.prizeName,
          status: cp.status,
          validUntil: cp.validUntil.toISOString(),
          createdAt: cp.createdAt.toISOString(),
        })),
        playerCount: playerCountResult[0]?.count ?? 0,
        recentPlayers: recentPlayersResult.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          totalPlays: p.totalPlays,
          totalWins: p.totalWins,
          lastSeenAt: p.lastSeenAt.toISOString(),
        })),
        ctas: merchantCtas.map((ct) => ({
          id: ct.id,
          type: ct.type,
          enabled: ct.enabled,
          weight: ct.weight,
        })),
      },
    })
  } catch (err) {
    console.error('Error getting merchant detail:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get merchant detail' } },
      500,
    )
  }
})

// ---------------------------------------------------------------------------
// PATCH /merchants/:id — Update tier, disable, etc.
// ---------------------------------------------------------------------------
adminRouter.patch('/merchants/:id', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')
    const body = await c.req.json<{
      subscriptionTier?: 'free' | 'starter' | 'pro' | 'enterprise'
      disabled?: boolean
    }>()

    const existing = await db.select().from(merchants).where(eq(merchants.id, id)).limit(1)
    if (existing.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } },
        404,
      )
    }

    const updates: Record<string, unknown> = {}
    if (body.subscriptionTier) updates.subscriptionTier = body.subscriptionTier
    if (typeof body.disabled === 'boolean') updates.disabled = body.disabled

    if (Object.keys(updates).length === 0) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'No fields to update' } },
        400,
      )
    }

    const result = await db
      .update(merchants)
      .set(updates)
      .where(eq(merchants.id, id))
      .returning()

    return c.json({ success: true, data: result[0] })
  } catch (err) {
    console.error('Error updating merchant:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update merchant' } },
      500,
    )
  }
})

// ---------------------------------------------------------------------------
// POST /merchants/:id/reset-plays — Reset monthly plays for a merchant
// ---------------------------------------------------------------------------
adminRouter.post('/merchants/:id/reset-plays', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    const existing = await db.select().from(merchants).where(eq(merchants.id, id)).limit(1)
    if (existing.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } },
        404,
      )
    }

    const monthStart = new Date()
    monthStart.setUTCDate(1)
    monthStart.setUTCHours(0, 0, 0, 0)

    const deleted = await db
      .delete(gamePlays)
      .where(
        and(
          eq(gamePlays.merchantId, id),
          gte(gamePlays.playedAt, monthStart),
        ),
      )
      .returning({ id: gamePlays.id })

    return c.json({
      success: true,
      data: { deletedCount: deleted.length },
    })
  } catch (err) {
    console.error('Error resetting plays:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reset plays' } },
      500,
    )
  }
})

// ---------------------------------------------------------------------------
// DELETE /merchants/:id — Delete merchant and all cascading data
// ---------------------------------------------------------------------------
adminRouter.delete('/merchants/:id', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    const existing = await db.select().from(merchants).where(eq(merchants.id, id)).limit(1)
    if (existing.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } },
        404,
      )
    }

    // Delete in order to respect foreign keys:
    // game_plays -> coupons -> prizes -> games -> ctas -> players -> merchant
    await db.delete(gamePlays).where(eq(gamePlays.merchantId, id))
    await db.delete(coupons).where(eq(coupons.merchantId, id))

    // Get game ids to delete prizes
    const merchantGames = await db.select({ id: games.id }).from(games).where(eq(games.merchantId, id))
    for (const g of merchantGames) {
      await db.delete(prizes).where(eq(prizes.gameId, g.id))
    }

    await db.delete(games).where(eq(games.merchantId, id))
    await db.delete(ctas).where(eq(ctas.merchantId, id))
    await db.delete(players).where(eq(players.merchantId, id))
    await db.delete(merchants).where(eq(merchants.id, id))

    return c.json({ success: true, data: { deleted: true } })
  } catch (err) {
    console.error('Error deleting merchant:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete merchant' } },
      500,
    )
  }
})

// ---------------------------------------------------------------------------
// GET /merchants/:id/games — All games for merchant
// ---------------------------------------------------------------------------
adminRouter.get('/merchants/:id/games', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    const merchantGames = await db
      .select()
      .from(games)
      .where(eq(games.merchantId, id))
      .orderBy(desc(games.createdAt))

    return c.json({ success: true, data: merchantGames })
  } catch (err) {
    console.error('Error getting merchant games:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get merchant games' } },
      500,
    )
  }
})

// ---------------------------------------------------------------------------
// GET /merchants/:id/coupons — All coupons for merchant
// ---------------------------------------------------------------------------
adminRouter.get('/merchants/:id/coupons', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    const merchantCoupons = await db
      .select()
      .from(coupons)
      .where(eq(coupons.merchantId, id))
      .orderBy(desc(coupons.createdAt))
      .limit(100)

    return c.json({ success: true, data: merchantCoupons })
  } catch (err) {
    console.error('Error getting merchant coupons:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get merchant coupons' } },
      500,
    )
  }
})

// ---------------------------------------------------------------------------
// GET /merchants/:id/players — All players for merchant
// ---------------------------------------------------------------------------
adminRouter.get('/merchants/:id/players', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    const merchantPlayers = await db
      .select()
      .from(players)
      .where(eq(players.merchantId, id))
      .orderBy(desc(players.lastSeenAt))
      .limit(100)

    return c.json({ success: true, data: merchantPlayers })
  } catch (err) {
    console.error('Error getting merchant players:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get merchant players' } },
      500,
    )
  }
})

// ---------------------------------------------------------------------------
// GET /settings — All platform settings
// ---------------------------------------------------------------------------
adminRouter.get('/settings', async (c) => {
  try {
    const db = c.get('db')
    const settings = await db.select().from(platformSettings)
    return c.json({ success: true, data: settings })
  } catch (err) {
    console.error('Error getting settings:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get settings' } },
      500,
    )
  }
})

// ---------------------------------------------------------------------------
// PATCH /settings/:key — Update a platform setting
// ---------------------------------------------------------------------------
adminRouter.patch('/settings/:key', async (c) => {
  try {
    const db = c.get('db')
    const key = c.req.param('key')
    const body = await c.req.json<{ value: unknown }>()

    if (body.value === undefined) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'value is required' } },
        400,
      )
    }

    // Upsert: insert or update
    const result = await db
      .insert(platformSettings)
      .values({ key, value: body.value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: { value: body.value, updatedAt: new Date() },
      })
      .returning()

    return c.json({ success: true, data: result[0] })
  } catch (err) {
    console.error('Error updating setting:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update setting' } },
      500,
    )
  }
})
