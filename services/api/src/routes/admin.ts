import { Hono } from 'hono'
import { eq, and, gte, sql, count, desc, ilike } from 'drizzle-orm'
import { merchants, games, gamePlays, players, coupons, ctas, users } from '@winandwin/db/schema'
import { TIER_LIMITS } from '@winandwin/shared/constants'
import type { AppEnv } from '../types'

export const adminRouter = new Hono<AppEnv>()

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
      topMerchantsResult,
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
    ])

    // Fetch merchant names for top merchants
    let topMerchants: { id: string; name: string; plays: number }[] = []
    if (topMerchantsResult.length > 0) {
      const merchantIds = topMerchantsResult.map((r) => r.merchantId)
      const merchantRows = await db
        .select({ id: merchants.id, name: merchants.name })
        .from(merchants)
        .where(sql`${merchants.id} IN (${sql.join(merchantIds.map((id) => sql`${id}`), sql`, `)})`)

      const nameMap = new Map(merchantRows.map((m) => [m.id, m.name]))
      topMerchants = topMerchantsResult.map((r) => ({
        id: r.merchantId,
        name: nameMap.get(r.merchantId) ?? 'Unknown',
        plays: r.plays,
      }))
    }

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
        topMerchants,
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
      const tier = m.subscriptionTier as keyof typeof TIER_LIMITS
      const monthlyLimit = TIER_LIMITS[tier]?.monthlyPlays ?? 200
      const playsThisMonth = monthlyPlaysMap.get(m.id) ?? 0

      return {
        id: m.id,
        name: m.name,
        slug: m.slug,
        email: m.email,
        category: m.category,
        subscriptionTier: m.subscriptionTier,
        totalPlayers: playersMap.get(m.id) ?? 0,
        totalGamesPlayed: totalPlaysMap.get(m.id) ?? 0,
        playsThisMonth,
        monthlyLimit: monthlyLimit === Number.POSITIVE_INFINITY ? null : monthlyLimit,
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
    const tier = merchant.subscriptionTier as keyof typeof TIER_LIMITS
    const monthlyLimit = TIER_LIMITS[tier]?.monthlyPlays ?? 200

    const monthStart = new Date()
    monthStart.setUTCDate(1)
    monthStart.setUTCHours(0, 0, 0, 0)

    const [
      playsThisMonthResult,
      merchantGames,
      merchantCoupons,
      playerCountResult,
      merchantCtas,
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
          createdAt: merchant.createdAt.toISOString(),
        },
        usage: {
          playsThisMonth: playsThisMonthResult[0]?.count ?? 0,
          monthlyLimit: monthlyLimit === Number.POSITIVE_INFINITY ? null : monthlyLimit,
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
