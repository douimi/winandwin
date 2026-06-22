import { Hono } from 'hono'
import { eq, and, gte, lt, sql } from 'drizzle-orm'
import { players, gamePlays, coupons, prizes, merchants, platformSettings } from '@winandwin/db/schema'
import { TIER_LIMITS } from '@winandwin/shared/constants'
import type { AppEnv } from '../types'

export const statsRouter = new Hono<AppEnv>()

// GET /overview — Lifetime KPIs for a merchant (with today's active-players badge)
//
// Note: this endpoint used to return TODAY-only counts (gamesPlayedToday,
// actionsCompletedToday etc.). Merchants saw zeros on days with no activity
// even when their lifetime data was significant. KPIs now reflect totals;
// "Active Today" is the only time-windowed metric and is clearly labelled.
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
      activePlayersTodayResult,
      gamesPlayedResult,
      actionsCompletedResult,
      couponsRedeemedResult,
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
      // Lifetime games played
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(gamePlays)
        .where(eq(gamePlays.merchantId, merchantId)),
      // Lifetime actions completed — sum the length of each play's
      // completedActions array, not the number of plays.
      db
        .select({
          count: sql<number>`coalesce(sum(jsonb_array_length(${gamePlays.completedActions})), 0)::int`,
        })
        .from(gamePlays)
        .where(eq(gamePlays.merchantId, merchantId)),
      // Lifetime coupons redeemed
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

    return c.json({
      success: true,
      data: {
        activePlayersToday: activePlayersTodayResult[0]?.count ?? 0,
        gamesPlayed: gamesPlayedResult[0]?.count ?? 0,
        actionsCompleted: actionsCompletedResult[0]?.count ?? 0,
        couponsRedeemed: couponsRedeemedResult[0]?.count ?? 0,
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

// GET /analytics — period-aware KPIs (with previous-period delta), funnel,
// top actions, prize popularity, and a fixed-last-7-days plays chart.
//
// ?period= today | week | month | all   (default: month)
// 'all' returns lifetime totals and skips the change% (returns '').
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

    type Period = 'today' | 'week' | 'month' | 'all'
    const periodParam = c.req.query('period') as Period | undefined
    const period: Period = (['today', 'week', 'month', 'all'] as const).includes(
      periodParam as Period,
    )
      ? (periodParam as Period)
      : 'month'

    // ── Date windows ────────────────────────────────────────────────
    // For 'today' we use calendar-day boundaries (UTC midnight). For week
    // and month we use rolling windows so the prior-period comparison is
    // a clean shift of the same length.
    const now = new Date()
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)

    let periodStart: Date | null
    let priorStart: Date | null
    let priorEnd: Date | null
    if (period === 'today') {
      periodStart = todayStart
      priorStart = yesterdayStart
      priorEnd = todayStart
    } else if (period === 'week') {
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      priorStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      priorEnd = periodStart
    } else if (period === 'month') {
      periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      priorStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
      priorEnd = periodStart
    } else {
      // 'all' — no time filter
      periodStart = null
      priorStart = null
      priorEnd = null
    }

    // Helper builders so the period filter is uniform across queries.
    const playerScope = periodStart
      ? and(eq(players.merchantId, merchantId), gte(players.createdAt, periodStart))
      : eq(players.merchantId, merchantId)
    const playScope = periodStart
      ? and(eq(gamePlays.merchantId, merchantId), gte(gamePlays.playedAt, periodStart))
      : eq(gamePlays.merchantId, merchantId)
    const winScope = periodStart
      ? and(
          eq(gamePlays.merchantId, merchantId),
          eq(gamePlays.result, 'win'),
          gte(gamePlays.playedAt, periodStart),
        )
      : and(eq(gamePlays.merchantId, merchantId), eq(gamePlays.result, 'win'))
    const redeemedScope = periodStart
      ? and(
          eq(coupons.merchantId, merchantId),
          eq(coupons.status, 'redeemed'),
          gte(coupons.redeemedAt, periodStart),
        )
      : and(eq(coupons.merchantId, merchantId), eq(coupons.status, 'redeemed'))

    // ── Current period counts ─────────────────────────────────────────
    const [
      curPlayersResult,
      curPlaysResult,
      curActionsResult,
      curRedeemedResult,
      // Funnel (period-scoped — same scopes as above)
      funnelPlayersResult,
      funnelPlaysResult,
      funnelWinsResult,
      funnelRedeemedResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(players).where(playerScope),
      db.select({ count: sql<number>`count(*)::int` }).from(gamePlays).where(playScope),
      db.select({
        count: sql<number>`coalesce(sum(jsonb_array_length(${gamePlays.completedActions})), 0)::int`,
      }).from(gamePlays).where(playScope),
      db.select({ count: sql<number>`count(*)::int` }).from(coupons).where(redeemedScope),
      db.select({ count: sql<number>`count(*)::int` }).from(players).where(playerScope),
      db.select({ count: sql<number>`count(*)::int` }).from(gamePlays).where(playScope),
      db.select({ count: sql<number>`count(*)::int` }).from(gamePlays).where(winScope),
      db.select({ count: sql<number>`count(*)::int` }).from(coupons).where(redeemedScope),
    ])

    // ── Prior period counts (only when comparing makes sense) ────────
    let prevPlayers = 0,
      prevPlays = 0,
      prevActions = 0,
      prevRedeemed = 0
    if (priorStart && priorEnd) {
      const playerPriorScope = and(
        eq(players.merchantId, merchantId),
        gte(players.createdAt, priorStart),
        lt(players.createdAt, priorEnd),
      )
      const playPriorScope = and(
        eq(gamePlays.merchantId, merchantId),
        gte(gamePlays.playedAt, priorStart),
        lt(gamePlays.playedAt, priorEnd),
      )
      const redeemedPriorScope = and(
        eq(coupons.merchantId, merchantId),
        eq(coupons.status, 'redeemed'),
        gte(coupons.redeemedAt, priorStart),
        lt(coupons.redeemedAt, priorEnd),
      )
      const [r1, r2, r3, r4] = await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(players).where(playerPriorScope),
        db.select({ count: sql<number>`count(*)::int` }).from(gamePlays).where(playPriorScope),
        db.select({
          count: sql<number>`coalesce(sum(jsonb_array_length(${gamePlays.completedActions})), 0)::int`,
        }).from(gamePlays).where(playPriorScope),
        db.select({ count: sql<number>`count(*)::int` }).from(coupons).where(redeemedPriorScope),
      ])
      prevPlayers = r1[0]?.count ?? 0
      prevPlays = r2[0]?.count ?? 0
      prevActions = r3[0]?.count ?? 0
      prevRedeemed = r4[0]?.count ?? 0
    }

    const curPlayers = curPlayersResult[0]?.count ?? 0
    const curPlays = curPlaysResult[0]?.count ?? 0
    const curActions = curActionsResult[0]?.count ?? 0
    const curRedeemed = curRedeemedResult[0]?.count ?? 0

    // Change %. For 'all', skip the comparison entirely — there's no
    // "previous all-time", so the UI gets an empty string and renders
    // no trend arrow.
    function changePercent(current: number, previous: number): string {
      if (period === 'all') return ''
      if (previous === 0 && current === 0) return '0%'
      if (previous === 0) return '+100%'
      const pct = Math.round(((current - previous) / previous) * 100)
      return pct >= 0 ? `+${pct}%` : `${pct}%`
    }

    // ── Funnel (period-scoped) — Players → Plays → Wins → Redeemed ──
    const funnelPlayers = funnelPlayersResult[0]?.count ?? 0
    const funnelPlays = funnelPlaysResult[0]?.count ?? 0
    const funnelWins = funnelWinsResult[0]?.count ?? 0
    const funnelRedeemed = funnelRedeemedResult[0]?.count ?? 0
    const funnelMax = Math.max(funnelPlayers, funnelPlays, funnelWins, funnelRedeemed, 1)

    // ── Top actions: SUM of completedActions arrays by type (period-scoped) ──
    const actionRows = await db
      .select({ completedActions: gamePlays.completedActions })
      .from(gamePlays)
      .where(playScope)

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
      google_review: '⭐',
      instagram_follow: '📷',
      email_collect: '📧',
      visit_stamp: '📍',
      receipt_photo: '📄',
      tripadvisor_review: '🏨',
      facebook_like: '👍',
      tiktok_follow: '🎵',
      book_appointment: '📅',
      whatsapp_join: '💬',
      refer_friend: '👥',
      survey_feedback: '📋',
    }

    const actionLabels: Record<string, string> = {
      google_review: 'Google Review',
      instagram_follow: 'Instagram Follow',
      email_collect: 'Email Collection',
      visit_stamp: 'Visit Stamp',
      receipt_photo: 'Receipt Photo',
      tripadvisor_review: 'TripAdvisor Review',
      facebook_like: 'Facebook Like',
      tiktok_follow: 'TikTok Follow',
      book_appointment: 'Book Appointment',
      whatsapp_join: 'WhatsApp Join',
      refer_friend: 'Refer a Friend',
      survey_feedback: 'Survey Feedback',
    }

    const topActions = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, cnt]) => ({
        label: actionLabels[type] ?? type,
        icon: actionIcons[type] ?? '🎯',
        count: cnt,
        percentage: totalActionCount > 0 ? Math.round((cnt / totalActionCount) * 100) : 0,
      }))

    // ── Prize popularity — count actual WINS from gamePlays, joined to
    // prizes for the current name. Period-scoped via winScope so the
    // selected period filter applies here too.
    const prizeWinRows = await db
      .select({
        prizeId: gamePlays.prizeId,
        prizeName: prizes.name,
        prizeEmoji: prizes.emoji,
        count: sql<number>`count(*)::int`,
      })
      .from(gamePlays)
      .leftJoin(prizes, eq(gamePlays.prizeId, prizes.id))
      .where(winScope)
      .groupBy(gamePlays.prizeId, prizes.name, prizes.emoji)

    const totalPrizeCount = prizeWinRows.reduce((sum, r) => sum + r.count, 0)
    const prizePopularity = prizeWinRows
      .filter((r) => r.prizeName) // skip wins where the prize row was deleted
      .sort((a, b) => b.count - a.count)
      .map((r) => ({
        label: r.prizeName ?? 'Unknown',
        icon: r.prizeEmoji ?? '🏆',
        count: r.count,
        percentage: totalPrizeCount > 0 ? Math.round((r.count / totalPrizeCount) * 100) : 0,
      }))

    // ── Weekly activity chart — real per-day play counts for the last 7 days.
    // Postgres returns date keys as 'YYYY-MM-DD' UTC; we then iterate the
    // last 7 calendar days and fill zeros where there were no plays.
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    sevenDaysAgo.setUTCHours(0, 0, 0, 0)

    const dailyRows = await db
      .select({
        day: sql<string>`to_char(${gamePlays.playedAt} at time zone 'UTC', 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(gamePlays)
      .where(
        and(
          eq(gamePlays.merchantId, merchantId),
          gte(gamePlays.playedAt, sevenDaysAgo),
        ),
      )
      .groupBy(sql`to_char(${gamePlays.playedAt} at time zone 'UTC', 'YYYY-MM-DD')`)

    const dailyMap = new Map<string, number>()
    for (const r of dailyRows) dailyMap.set(r.day, r.count)

    const weeklyActivity: { day: string; date: string; count: number }[] = []
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10) // 'YYYY-MM-DD'
      weeklyActivity.push({
        day: dayNames[d.getUTCDay()] ?? '',
        date: key,
        count: dailyMap.get(key) ?? 0,
      })
    }

    return c.json({
      success: true,
      data: {
        period,
        kpis: {
          // KPI numbers for the selected period (or lifetime when period='all').
          totalPlayers: curPlayers,
          totalPlayersChange: changePercent(curPlayers, prevPlayers),
          gamesPlayed: curPlays,
          gamesPlayedChange: changePercent(curPlays, prevPlays),
          actionsCompleted: curActions,
          actionsCompletedChange: changePercent(curActions, prevActions),
          couponsRedeemed: curRedeemed,
          couponsRedeemedChange: changePercent(curRedeemed, prevRedeemed),
        },
        funnel: [
          { label: 'Unique Players', value: funnelPlayers, percentage: Math.round((funnelPlayers / funnelMax) * 100) },
          { label: 'Games Played', value: funnelPlays, percentage: Math.round((funnelPlays / funnelMax) * 100) },
          { label: 'Wins', value: funnelWins, percentage: Math.round((funnelWins / funnelMax) * 100) },
          { label: 'Coupons Redeemed', value: funnelRedeemed, percentage: Math.round((funnelRedeemed / funnelMax) * 100) },
        ],
        topActions,
        prizePopularity,
        weeklyActivity,
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

    let monthlyLimit = TIER_LIMITS[tier]?.monthlyPlays ?? 200
    try {
      const dbSettings = await db
        .select()
        .from(platformSettings)
        .where(eq(platformSettings.key, 'tier_limits'))
        .limit(1)
      if (dbSettings.length > 0 && dbSettings[0]!.value) {
        const dbLimits = dbSettings[0]!.value as Record<string, { monthlyPlays?: number }>
        if (dbLimits[tier]?.monthlyPlays !== undefined) {
          monthlyLimit = dbLimits[tier]!.monthlyPlays!
        }
      }
    } catch { /* use default */ }

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
