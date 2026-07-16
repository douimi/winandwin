import { Hono } from 'hono'
import { and, asc, count, desc, eq, ilike, isNotNull, or, sql, type SQL } from 'drizzle-orm'
import { coupons, gamePlays, games, players, prizes } from '@winandwin/db/schema'
import { paginationSchema } from '@winandwin/shared/validators'
import type { AppEnv } from '../types'

export const playersRouter = new Hono<AppEnv>()

// A player is "identified" when they've registered (has a name OR email).
// Unregistered players — device fingerprints that spun once and closed —
// clutter the merchant Players list without adding value, so they're
// filtered out by default. Set ?includeAnonymous=1 to bring them back.
function identifiedFilter() {
  return or(isNotNull(players.name), isNotNull(players.email))!
}

// Whitelist of sortable columns — never trust the client to name a column.
const SORTABLE_COLUMNS = {
  name: players.name,
  email: players.email,
  points: players.points,
  totalPlays: players.totalPlays,
  totalWins: players.totalWins,
  lastSeenAt: players.lastSeenAt,
  createdAt: players.createdAt,
} as const

type SortKey = keyof typeof SORTABLE_COLUMNS

// GET / — Paginated, sortable, searchable players list for one merchant
playersRouter.get('/', async (c) => {
  try {
    const db = c.get('db')
    const query = c.req.query()
    const { page, pageSize } = paginationSchema.parse(query)
    const merchantId = c.req.query('merchantId')
    const search = c.req.query('search')?.trim() || ''
    const sortParam = c.req.query('sort') || 'lastSeenAt'
    const dirParam = c.req.query('dir') || 'desc'
    const includeAnonymous = c.req.query('includeAnonymous') === '1'

    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    const sortKey = (Object.keys(SORTABLE_COLUMNS) as SortKey[]).includes(sortParam as SortKey)
      ? (sortParam as SortKey)
      : 'lastSeenAt'
    const sortDir = dirParam === 'asc' ? asc : desc
    const orderExpr = sortDir(SORTABLE_COLUMNS[sortKey])

    const offset = (page - 1) * pageSize

    const whereParts: SQL[] = [eq(players.merchantId, merchantId)]
    // Hide anonymous (no name, no email) players from the list by default —
    // they're just device fingerprints that spun once and never registered.
    if (!includeAnonymous) whereParts.push(identifiedFilter())
    if (search) {
      const pattern = `%${search}%`
      whereParts.push(or(ilike(players.name, pattern), ilike(players.email, pattern))!)
    }
    const whereExpr = whereParts.length === 1 ? whereParts[0]! : and(...whereParts)!

    // Single aggregate query so the dashboard's KPI cards reflect the FULL
    // filtered set (not just the current page). Cheap — same WHERE as the list.
    const [playerList, statsRow] = await Promise.all([
      db
        .select({
          id: players.id,
          name: players.name,
          email: players.email,
          points: players.points,
          totalPlays: players.totalPlays,
          totalWins: players.totalWins,
          lastSeenAt: players.lastSeenAt,
          createdAt: players.createdAt,
        })
        .from(players)
        .where(whereExpr)
        .orderBy(orderExpr)
        .limit(pageSize)
        .offset(offset),
      db
        .select({
          total: count(),
          totalPlays: sql<number>`coalesce(sum(${players.totalPlays}), 0)::int`,
          totalWins: sql<number>`coalesce(sum(${players.totalWins}), 0)::int`,
        })
        .from(players)
        .where(whereExpr),
    ])

    const stats = statsRow[0] ?? { total: 0, totalPlays: 0, totalWins: 0 }

    const data = playerList.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      points: p.points,
      totalPlays: p.totalPlays,
      totalWins: p.totalWins,
      lastSeenAt: p.lastSeenAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
    }))

    return c.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total: stats.total,
        totalPages: Math.ceil(stats.total / pageSize),
      },
      sort: { field: sortKey, dir: dirParam === 'asc' ? 'asc' : 'desc' },
      stats: {
        totalPlayers: stats.total,
        totalPlays: stats.totalPlays,
        totalWins: stats.totalWins,
      },
    })
  } catch (err) {
    console.error('Error listing players:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list players' } },
      500,
    )
  }
})

// GET /ranking — Leaderboard, unchanged
playersRouter.get('/ranking', async (c) => {
  try {
    const db = c.get('db')
    const merchantId = c.req.query('merchantId')
    const limitParam = c.req.query('limit')
    const limit = Math.min(Math.max(Number(limitParam) || 20, 1), 100)

    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    const playerList = await db
      .select({
        id: players.id,
        name: players.name,
        email: players.email,
        points: players.points,
        totalPlays: players.totalPlays,
        totalWins: players.totalWins,
        lastSeenAt: players.lastSeenAt,
      })
      .from(players)
      .where(eq(players.merchantId, merchantId))
      .orderBy(desc(players.points), desc(players.totalWins))
      .limit(limit)

    const data = playerList.map((p, index) => ({
      rank: index + 1,
      id: p.id,
      name: p.name,
      email: p.email,
      points: p.points,
      totalPlays: p.totalPlays,
      totalWins: p.totalWins,
      lastSeenAt: p.lastSeenAt.toISOString(),
    }))

    return c.json({ success: true, data })
  } catch (err) {
    console.error('Error listing player ranking:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list player ranking' } },
      500,
    )
  }
})

// GET /:id — Full player profile: identity, aggregate stats, full game
// history (joined to games + prizes for readable rows), and all issued
// coupons. Powers the /dashboard/players/[id] detail page.
playersRouter.get('/:id', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')
    const merchantId = c.req.query('merchantId')

    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    const playerRow = await db
      .select({
        id: players.id,
        merchantId: players.merchantId,
        name: players.name,
        email: players.email,
        phone: players.phone,
        points: players.points,
        totalPlays: players.totalPlays,
        totalWins: players.totalWins,
        suspiciousScore: players.suspiciousScore,
        createdAt: players.createdAt,
        lastSeenAt: players.lastSeenAt,
      })
      .from(players)
      .where(and(eq(players.id, id), eq(players.merchantId, merchantId)))
      .limit(1)

    if (playerRow.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Player not found' } },
        404,
      )
    }

    const player = playerRow[0]!

    // Fire the play history + coupon list in parallel — both are small
    // per-player queries so they're safe to run unbounded here.
    const [playRows, couponRows] = await Promise.all([
      db
        .select({
          id: gamePlays.id,
          gameId: gamePlays.gameId,
          gameName: games.name,
          gameType: games.type,
          result: gamePlays.result,
          prizeId: gamePlays.prizeId,
          prizeName: prizes.name,
          prizeEmoji: prizes.emoji,
          completedActions: gamePlays.completedActions,
          playedAt: gamePlays.playedAt,
        })
        .from(gamePlays)
        .leftJoin(games, eq(gamePlays.gameId, games.id))
        .leftJoin(prizes, eq(gamePlays.prizeId, prizes.id))
        .where(eq(gamePlays.playerId, id))
        .orderBy(desc(gamePlays.playedAt))
        .limit(200),
      db
        .select({
          id: coupons.id,
          code: coupons.code,
          status: coupons.status,
          prizeName: coupons.prizeName,
          prizeDescription: coupons.prizeDescription,
          redemptionConditions: coupons.redemptionConditions,
          validFrom: coupons.validFrom,
          validUntil: coupons.validUntil,
          redeemedAt: coupons.redeemedAt,
          createdAt: coupons.createdAt,
        })
        .from(coupons)
        .where(eq(coupons.playerId, id))
        .orderBy(desc(coupons.createdAt))
        .limit(100),
    ])

    return c.json({
      success: true,
      data: {
        player: {
          id: player.id,
          merchantId: player.merchantId,
          name: player.name,
          email: player.email,
          phone: player.phone,
          points: player.points,
          totalPlays: player.totalPlays,
          totalWins: player.totalWins,
          suspiciousScore: player.suspiciousScore,
          createdAt: player.createdAt.toISOString(),
          lastSeenAt: player.lastSeenAt.toISOString(),
          winRate:
            player.totalPlays > 0
              ? Math.round((player.totalWins / player.totalPlays) * 100)
              : 0,
        },
        plays: playRows.map((p) => ({
          id: p.id,
          gameId: p.gameId,
          gameName: p.gameName ?? '(deleted game)',
          gameType: p.gameType ?? 'unknown',
          result: p.result,
          prizeId: p.prizeId,
          prizeName: p.prizeName ?? null,
          prizeEmoji: p.prizeEmoji ?? null,
          completedActions: (p.completedActions as string[] | null) ?? [],
          playedAt: p.playedAt.toISOString(),
        })),
        coupons: couponRows.map((cp) => ({
          id: cp.id,
          code: cp.code,
          status: cp.status,
          prizeName: cp.prizeName,
          prizeDescription: cp.prizeDescription,
          redemptionConditions: (cp.redemptionConditions as string[] | null) ?? [],
          validFrom: cp.validFrom.toISOString(),
          validUntil: cp.validUntil.toISOString(),
          redeemedAt: cp.redeemedAt?.toISOString() ?? null,
          createdAt: cp.createdAt.toISOString(),
        })),
      },
    })
  } catch (err) {
    console.error('Error getting player detail:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get player detail' } },
      500,
    )
  }
})
