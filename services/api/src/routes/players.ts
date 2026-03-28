import { Hono } from 'hono'
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm'
import { players } from '@winandwin/db/schema'
import type { AppEnv } from '../types'

export const playersRouter = new Hono<AppEnv>()

// GET /api/v1/players?merchantId=xxx&search=yyy
playersRouter.get('/', async (c) => {
  try {
    const db = c.get('db')
    const merchantId = c.req.query('merchantId')
    const search = c.req.query('search')

    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    const conditions = [eq(players.merchantId, merchantId)]

    if (search) {
      conditions.push(
        or(
          ilike(players.name, `%${search}%`),
          ilike(players.email, `%${search}%`),
        )!,
      )
    }

    const playerList = await db
      .select({
        id: players.id,
        name: players.name,
        email: players.email,
        totalPlays: players.totalPlays,
        totalWins: players.totalWins,
        lastSeenAt: players.lastSeenAt,
        createdAt: players.createdAt,
      })
      .from(players)
      .where(and(...conditions))
      .orderBy(desc(players.lastSeenAt))
      .limit(200)

    const data = playerList.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      totalPlays: p.totalPlays,
      totalWins: p.totalWins,
      lastSeenAt: p.lastSeenAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
    }))

    return c.json({ success: true, data })
  } catch (err) {
    console.error('Error listing players:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list players' } },
      500,
    )
  }
})

// GET /api/v1/players/ranking?merchantId=xxx&limit=20
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
