import { Hono } from 'hono'
import { eq, and, sql } from 'drizzle-orm'
import { games, prizes, merchants } from '@winandwin/db/schema'
import { createGameSchema } from '@winandwin/shared/validators'
import { getTierLimits } from '../lib/tier-limits'
import type { AppEnv } from '../types'

export const gamesRouter = new Hono<AppEnv>()

// GET / — List games, optionally filtered by merchantId
gamesRouter.get('/', async (c) => {
  try {
    const db = c.get('db')
    const merchantId = c.req.query('merchantId')

    const conditions = merchantId ? eq(games.merchantId, merchantId) : undefined

    const gameList = await db.query.games.findMany({
      where: conditions,
      with: { prizes: true },
      orderBy: (games, { desc }) => [desc(games.createdAt)],
    })

    // Flatten for list view: return prize count instead of full prize objects
    const data = gameList.map((game) => ({
      id: game.id,
      name: game.name,
      type: game.type,
      status: game.status,
      totalPlays: 0,
      totalWins: 0,
      prizes: game.prizes.length,
      createdAt: game.createdAt,
    }))

    return c.json({ success: true, data })
  } catch (err) {
    console.error('Error listing games:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list games' } },
      500,
    )
  }
})

// GET /:id — Get single game with prizes
gamesRouter.get('/:id', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    const game = await db.query.games.findFirst({
      where: eq(games.id, id),
      with: { prizes: true },
    })

    if (!game) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Game not found' } },
        404,
      )
    }

    return c.json({ success: true, data: game })
  } catch (err) {
    console.error('Error getting game:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get game' } },
      500,
    )
  }
})

// POST / — Create game + prizes in a transaction
gamesRouter.post('/', async (c) => {
  try {
    const db = c.get('db')
    const body = await c.req.json()

    const parsed = createGameSchema.safeParse(body)
    if (!parsed.success) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: parsed.error.flatten(),
          },
        },
        400,
      )
    }

    const merchantId = c.req.query('merchantId') || body.merchantId
    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    const { type, name, config } = parsed.data

    // Test mode bypass
    const isTestMode = c.req.query('testmode') === 'unlimited'

    if (!isTestMode) {
      // Tier limit: check maxGames
      const merchantResult = await db
        .select()
        .from(merchants)
        .where(eq(merchants.id, merchantId))
        .limit(1)

      if (merchantResult.length > 0) {
        const tierLimits = await getTierLimits(db)
        const tier = merchantResult[0]!.subscriptionTier as keyof typeof tierLimits
        const limits = tierLimits[tier] as Record<string, unknown> | undefined
        const maxGames = (limits?.maxGames as number) ?? 999

        const gameCountResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(games)
          .where(eq(games.merchantId, merchantId))

        const gameCount = gameCountResult[0]?.count ?? 0
        if (gameCount >= maxGames) {
          return c.json(
            {
              success: false,
              error: {
                code: 'TIER_LIMIT',
                message: `Your plan allows ${maxGames} active game${maxGames !== 1 ? 's' : ''}. Upgrade to create more.`,
              },
            },
            403,
          )
        }

        // Tier limit: check maxPrizes
        const maxPrizes = (limits?.maxPrizes as number) ?? 999
        if (config.prizes.length > maxPrizes) {
          return c.json(
            {
              success: false,
              error: {
                code: 'TIER_LIMIT',
                message: `Your plan allows ${maxPrizes} prize${maxPrizes !== 1 ? 's' : ''} per game.`,
              },
            },
            403,
          )
        }
      }
    }

    // Use batch to insert game + prizes (neon-http doesn't support interactive transactions)
    const gameId = crypto.randomUUID()

    const gameInsert = db.insert(games).values({
      id: gameId,
      merchantId,
      type,
      name,
      description: body.description ?? null,
      globalWinRate: String(config.globalWinRate),
      scheduling: config.scheduling,
      frequencyLimit: config.frequencyLimit,
      branding: config.branding,
    }).returning()

    const prizeInsert = db.insert(prizes).values(
      config.prizes.map((p) => ({
        gameId,
        name: p.name,
        description: p.description,
        emoji: p.emoji,
        winRate: p.winRate,
        maxTotal: p.maxTotal,
        maxPerDay: p.maxPerDay,
        couponValidityDays: p.couponValidityDays,
        couponActivationDelayHours: p.couponActivationDelayHours,
      })),
    ).returning()

    const [createdGames, createdPrizes] = await db.batch([gameInsert, prizeInsert])

    return c.json(
      { success: true, data: { ...createdGames[0], prizes: createdPrizes } },
      201,
    )
  } catch (err) {
    console.error('Error creating game:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create game' } },
      500,
    )
  }
})

// PATCH /:id — Update game status/config
gamesRouter.patch('/:id', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')
    const body = await c.req.json()

    // Check game exists
    const existing = await db.select().from(games).where(eq(games.id, id)).limit(1)
    if (existing.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Game not found' } },
        404,
      )
    }

    // Build update object from allowed fields
    const updates: Record<string, unknown> = {}
    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.status !== undefined) updates.status = body.status
    if (body.globalWinRate !== undefined) updates.globalWinRate = String(body.globalWinRate)
    if (body.branding !== undefined) updates.branding = body.branding
    if (body.scheduling !== undefined) updates.scheduling = body.scheduling
    if (body.frequencyLimit !== undefined) updates.frequencyLimit = body.frequencyLimit

    if (Object.keys(updates).length === 0) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'No fields to update' } },
        400,
      )
    }

    const result = await db
      .update(games)
      .set(updates)
      .where(eq(games.id, id))
      .returning()

    return c.json({ success: true, data: result[0] })
  } catch (err) {
    console.error('Error updating game:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update game' } },
      500,
    )
  }
})

// DELETE /:id — Delete game (cascades to prizes, plays)
gamesRouter.delete('/:id', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    const result = await db.delete(games).where(eq(games.id, id)).returning()

    if (result.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Game not found' } },
        404,
      )
    }

    return c.json({ success: true, data: { id, deleted: true } })
  } catch (err) {
    console.error('Error deleting game:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete game' } },
      500,
    )
  }
})
