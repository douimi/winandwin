import { Hono } from 'hono'
import { eq, and, gte, sql, count } from 'drizzle-orm'
import { players, gamePlays, coupons, prizes, merchants } from '@winandwin/db/schema'
import { TIER_LIMITS } from '@winandwin/shared/constants'
import type { AppEnv } from '../types'

export const statsRouter = new Hono<AppEnv>()

// GET /overview — Overview stats for a merchant
statsRouter.get('/overview', async (c) => {
  try {
    const db = c.get('db')
    const merchantId = c.req.query('merchantId')

    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    const [
      playersTodayResult,
      gamesPlayedTodayResult,
      actionsCompletedResult,
      couponsRedeemedTodayResult,
    ] = await Promise.all([
      // Players seen today
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(players)
        .where(
          and(
            eq(players.merchantId, merchantId),
            gte(players.lastSeenAt, todayStart),
          ),
        ),
      // Games played today
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(gamePlays)
        .where(
          and(
            eq(gamePlays.merchantId, merchantId),
            gte(gamePlays.playedAt, todayStart),
          ),
        ),
      // Total actions completed today (count of plays that have actions)
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(gamePlays)
        .where(
          and(
            eq(gamePlays.merchantId, merchantId),
            gte(gamePlays.playedAt, todayStart),
          ),
        ),
      // Coupons redeemed today
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(coupons)
        .where(
          and(
            eq(coupons.merchantId, merchantId),
            eq(coupons.status, 'redeemed'),
            gte(coupons.redeemedAt, todayStart),
          ),
        ),
    ])

    return c.json({
      success: true,
      data: {
        activePlayersToday: playersTodayResult[0]?.count ?? 0,
        gamesPlayed: gamesPlayedTodayResult[0]?.count ?? 0,
        actionsCompleted: actionsCompletedResult[0]?.count ?? 0,
        couponsRedeemed: couponsRedeemedTodayResult[0]?.count ?? 0,
      },
    })
  } catch (err) {
    console.error('Error getting overview stats:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get stats' } },
      500,
    )
  }
})

// GET /funnel — Conversion funnel data
statsRouter.get('/funnel', async (c) => {
  try {
    const db = c.get('db')
    const merchantId = c.req.query('merchantId')

    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    const [
      totalPlayersResult,
      totalPlaysResult,
      totalWinsResult,
      totalRedeemedResult,
    ] = await Promise.all([
      // Total unique players
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(players)
        .where(eq(players.merchantId, merchantId)),
      // Total plays
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(gamePlays)
        .where(eq(gamePlays.merchantId, merchantId)),
      // Total wins
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(gamePlays)
        .where(
          and(
            eq(gamePlays.merchantId, merchantId),
            eq(gamePlays.result, 'win'),
          ),
        ),
      // Total redeemed coupons
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(coupons)
        .where(
          and(
            eq(coupons.merchantId, merchantId),
            eq(coupons.status, 'redeemed'),
          ),
        ),
    ])

    const totalPlayers = totalPlayersResult[0]?.count ?? 0
    const totalPlays = totalPlaysResult[0]?.count ?? 0
    const totalWins = totalWinsResult[0]?.count ?? 0
    const totalRedeemed = totalRedeemedResult[0]?.count ?? 0

    return c.json({
      success: true,
      data: {
        funnel: [
          { stage: 'visitors', count: totalPlayers, rate: 100 },
          {
            stage: 'played',
            count: totalPlays,
            rate: totalPlayers > 0 ? Math.round((totalPlays / totalPlayers) * 100) : 0,
          },
          {
            stage: 'won',
            count: totalWins,
            rate: totalPlays > 0 ? Math.round((totalWins / totalPlays) * 100) : 0,
          },
          {
            stage: 'redeemed',
            count: totalRedeemed,
            rate: totalWins > 0 ? Math.round((totalRedeemed / totalWins) * 100) : 0,
          },
        ],
      },
    })
  } catch (err) {
    console.error('Error getting funnel stats:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get funnel data' } },
      500,
    )
  }
})

// GET /analytics — Combined analytics data for the dashboard
statsRouter.get('/analytics', async (c) => {
  try {
    const db = c.get('db')
    const merchantId = c.req.query('merchantId')

    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Current week and previous week KPIs
    const [
      totalPlayersResult,
      totalPlayersLastWeekResult,
      gamesPlayedResult,
      gamesPlayedLastWeekResult,
      actionsCompletedResult,
      actionsCompletedLastWeekResult,
      couponsRedeemedResult,
      couponsRedeemedLastWeekResult,
      // Funnel data
      funnelPlayersResult,
      funnelPlaysResult,
      funnelWinsResult,
      funnelRedeemedResult,
    ] = await Promise.all([
      // Total players this week
      db.select({ count: sql<number>`count(*)::int` }).from(players)
        .where(and(eq(players.merchantId, merchantId), gte(players.lastSeenAt, oneWeekAgo))),
      // Total players last week
      db.select({ count: sql<number>`count(*)::int` }).from(players)
        .where(and(eq(players.merchantId, merchantId), gte(players.lastSeenAt, twoWeeksAgo))),
      // Games played this week
      db.select({ count: sql<number>`count(*)::int` }).from(gamePlays)
        .where(and(eq(gamePlays.merchantId, merchantId), gte(gamePlays.playedAt, oneWeekAgo))),
      // Games played last week
      db.select({ count: sql<number>`count(*)::int` }).from(gamePlays)
        .where(and(eq(gamePlays.merchantId, merchantId), gte(gamePlays.playedAt, twoWeeksAgo))),
      // Actions this week (plays with actions)
      db.select({ count: sql<number>`count(*)::int` }).from(gamePlays)
        .where(and(eq(gamePlays.merchantId, merchantId), gte(gamePlays.playedAt, oneWeekAgo))),
      // Actions last week
      db.select({ count: sql<number>`count(*)::int` }).from(gamePlays)
        .where(and(eq(gamePlays.merchantId, merchantId), gte(gamePlays.playedAt, twoWeeksAgo))),
      // Coupons redeemed this week
      db.select({ count: sql<number>`count(*)::int` }).from(coupons)
        .where(and(eq(coupons.merchantId, merchantId), eq(coupons.status, 'redeemed'), gte(coupons.redeemedAt, oneWeekAgo))),
      // Coupons redeemed last week
      db.select({ count: sql<number>`count(*)::int` }).from(coupons)
        .where(and(eq(coupons.merchantId, merchantId), eq(coupons.status, 'redeemed'), gte(coupons.redeemedAt, twoWeeksAgo))),
      // Funnel: total unique players
      db.select({ count: sql<number>`count(*)::int` }).from(players)
        .where(eq(players.merchantId, merchantId)),
      // Funnel: total plays
      db.select({ count: sql<number>`count(*)::int` }).from(gamePlays)
        .where(eq(gamePlays.merchantId, merchantId)),
      // Funnel: total wins
      db.select({ count: sql<number>`count(*)::int` }).from(gamePlays)
        .where(and(eq(gamePlays.merchantId, merchantId), eq(gamePlays.result, 'win'))),
      // Funnel: total redeemed coupons
      db.select({ count: sql<number>`count(*)::int` }).from(coupons)
        .where(and(eq(coupons.merchantId, merchantId), eq(coupons.status, 'redeemed'))),
    ])

    // Calculate change percentages
    function changePercent(current: number, previous: number): string {
      if (previous === 0) return current > 0 ? '+100%' : '0%'
      const diff = current - (previous - current) // previous includes current
      const pct = Math.round(((current - Math.max(previous - current, 0)) / Math.max(previous - current, 1)) * 100)
      return pct >= 0 ? `+${pct}%` : `${pct}%`
    }

    const totalPlayers = totalPlayersResult[0]?.count ?? 0
    const totalPlayersLast = totalPlayersLastWeekResult[0]?.count ?? 0
    const gamesPlayed = gamesPlayedResult[0]?.count ?? 0
    const gamesPlayedLast = gamesPlayedLastWeekResult[0]?.count ?? 0
    const actionsCompleted = actionsCompletedResult[0]?.count ?? 0
    const actionsCompletedLast = actionsCompletedLastWeekResult[0]?.count ?? 0
    const couponsRedeemed = couponsRedeemedResult[0]?.count ?? 0
    const couponsRedeemedLast = couponsRedeemedLastWeekResult[0]?.count ?? 0

    // Funnel
    const funnelPlayers = funnelPlayersResult[0]?.count ?? 0
    const funnelPlays = funnelPlaysResult[0]?.count ?? 0
    const funnelWins = funnelWinsResult[0]?.count ?? 0
    const funnelRedeemed = funnelRedeemedResult[0]?.count ?? 0
    const funnelMax = Math.max(funnelPlayers, 1)

    // Top actions: parse completedActions from game_plays
    const actionRows = await db
      .select({ completedActions: gamePlays.completedActions })
      .from(gamePlays)
      .where(eq(gamePlays.merchantId, merchantId))

    const actionCounts: Record<string, number> = {}
    let totalActionCount = 0
    for (const row of actionRows) {
      const actions = row.completedActions
      if (Array.isArray(actions)) {
        for (const action of actions) {
          actionCounts[action as string] = (actionCounts[action as string] ?? 0) + 1
          totalActionCount++
        }
      }
    }

    const actionIcons: Record<string, string> = {
      google_review: '\u2B50',
      instagram_follow: '\uD83D\uDCF7',
      email_collect: '\uD83D\uDCE7',
      visit_stamp: '\uD83D\uDCCD',
      receipt_photo: '\uD83D\uDCC4',
    }

    const actionLabels: Record<string, string> = {
      google_review: 'Google Review',
      instagram_follow: 'Instagram Follow',
      email_collect: 'Email Collection',
      visit_stamp: 'Visit Stamp',
      receipt_photo: 'Receipt Photo',
    }

    const topActions = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, cnt]) => ({
        label: actionLabels[type] ?? type,
        icon: actionIcons[type] ?? '\uD83C\uDFAF',
        count: cnt,
        percentage: totalActionCount > 0 ? Math.round((cnt / totalActionCount) * 100) : 0,
      }))

    // Prize popularity from coupons
    const prizeRows = await db
      .select({
        prizeName: coupons.prizeName,
        count: sql<number>`count(*)::int`,
      })
      .from(coupons)
      .where(eq(coupons.merchantId, merchantId))
      .groupBy(coupons.prizeName)

    const totalPrizeCount = prizeRows.reduce((sum, r) => sum + r.count, 0)
    const prizePopularity = prizeRows
      .sort((a, b) => b.count - a.count)
      .map((r) => ({
        label: r.prizeName,
        icon: '\uD83C\uDFC6',
        count: r.count,
        percentage: totalPrizeCount > 0 ? Math.round((r.count / totalPrizeCount) * 100) : 0,
      }))

    return c.json({
      success: true,
      data: {
        kpis: {
          totalPlayers,
          totalPlayersChange: changePercent(totalPlayers, totalPlayersLast),
          gamesPlayed,
          gamesPlayedChange: changePercent(gamesPlayed, gamesPlayedLast),
          actionsCompleted,
          actionsCompletedChange: changePercent(actionsCompleted, actionsCompletedLast),
          couponsRedeemed,
          couponsRedeemedChange: changePercent(couponsRedeemed, couponsRedeemedLast),
        },
        funnel: [
          { label: 'Unique Players', value: funnelPlayers, percentage: 100 },
          {
            label: 'Games Played',
            value: funnelPlays,
            percentage: Math.round((funnelPlays / funnelMax) * 100),
          },
          {
            label: 'Wins',
            value: funnelWins,
            percentage: Math.round((funnelWins / funnelMax) * 100),
          },
          {
            label: 'Coupons Redeemed',
            value: funnelRedeemed,
            percentage: Math.round((funnelRedeemed / funnelMax) * 100),
          },
        ],
        topActions,
        prizePopularity,
      },
    })
  } catch (err) {
    console.error('Error getting analytics:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get analytics' } },
      500,
    )
  }
})

// GET /coupons — Coupon stats for a merchant
statsRouter.get('/coupons', async (c) => {
  try {
    const db = c.get('db')
    const merchantId = c.req.query('merchantId')

    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [activeResult, redeemedThisWeekResult, totalResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(coupons)
        .where(and(eq(coupons.merchantId, merchantId), eq(coupons.status, 'active'))),
      db.select({ count: sql<number>`count(*)::int` }).from(coupons)
        .where(and(eq(coupons.merchantId, merchantId), eq(coupons.status, 'redeemed'), gte(coupons.redeemedAt, oneWeekAgo))),
      db.select({ count: sql<number>`count(*)::int` }).from(coupons)
        .where(eq(coupons.merchantId, merchantId)),
    ])

    const active = activeResult[0]?.count ?? 0
    const redeemedThisWeek = redeemedThisWeekResult[0]?.count ?? 0
    const total = totalResult[0]?.count ?? 0

    return c.json({
      success: true,
      data: {
        active,
        redeemedThisWeek,
        redemptionRate: total > 0 ? Math.round((redeemedThisWeek / total) * 100) : 0,
      },
    })
  } catch (err) {
    console.error('Error getting coupon stats:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get coupon stats' } },
      500,
    )
  }
})

// GET /usage — Usage stats for a merchant (plays this month vs tier limit)
statsRouter.get('/usage', async (c) => {
  try {
    const db = c.get('db')
    const merchantId = c.req.query('merchantId')

    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    // Get merchant tier
    const merchantResult = await db
      .select({ subscriptionTier: merchants.subscriptionTier })
      .from(merchants)
      .where(eq(merchants.id, merchantId))
      .limit(1)

    if (merchantResult.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } },
        404,
      )
    }

    const tier = merchantResult[0]!.subscriptionTier as keyof typeof TIER_LIMITS
    const monthlyLimit = TIER_LIMITS[tier]?.monthlyPlays ?? 200

    // Count plays this month
    const monthStart = new Date()
    monthStart.setUTCDate(1)
    monthStart.setUTCHours(0, 0, 0, 0)

    const playsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(gamePlays)
      .where(and(eq(gamePlays.merchantId, merchantId), gte(gamePlays.playedAt, monthStart)))

    const playsThisMonth = playsResult[0]?.count ?? 0
    const isUnlimited = monthlyLimit === Number.POSITIVE_INFINITY
    const percentUsed = isUnlimited ? 0 : Math.round((playsThisMonth / monthlyLimit) * 100)

    return c.json({
      success: true,
      data: {
        playsThisMonth,
        monthlyLimit: isUnlimited ? null : monthlyLimit,
        tier,
        percentUsed,
      },
    })
  } catch (err) {
    console.error('Error getting usage stats:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get usage stats' } },
      500,
    )
  }
})
