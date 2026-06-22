import { Hono } from 'hono'
import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm'
import { players } from '@winandwin/db/schema'
import { paginationSchema } from '@winandwin/shared/validators'
import type { AppEnv } from '../types'

export const playersRouter = new Hono<AppEnv>()

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
