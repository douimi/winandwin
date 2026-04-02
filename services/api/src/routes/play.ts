import { Hono } from 'hono'
import { eq, and, sql, gte } from 'drizzle-orm'
import { merchants, games, prizes, players, gamePlays, coupons, ctas } from '@winandwin/db/schema'
import {
  calculateCouponDates,
  determineGameOutcome,
  generateCouponCode,
  type PrizeConfig,
} from '../lib/game-engine'
import { sendCouponEmail } from '../lib/email'
import { getTierLimits } from '../lib/tier-limits'
import type { AppEnv } from '../types'

export const playRouter = new Hono<AppEnv>()

// GET /api/v1/play/:slug — Get game config for a merchant
playRouter.get('/:slug', async (c) => {
  try {
    const db = c.get('db')
    const slug = c.req.param('slug')

    // Look up merchant by slug
    const merchant = await db
      .select()
      .from(merchants)
      .where(eq(merchants.slug, slug))
      .limit(1)

    if (merchant.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } },
        404,
      )
    }

    const merchantData = merchant[0]!

    if (merchantData.disabled) {
      return c.json({
        success: false,
        error: { code: 'MERCHANT_DISABLED', message: 'This game is currently unavailable.' },
      }, 403)
    }

    // Get active game with prizes
    const activeGame = await db.query.games.findFirst({
      where: and(eq(games.merchantId, merchantData.id), eq(games.status, 'active')),
      with: { prizes: true },
    })

    if (!activeGame) {
      return c.json(
        { success: false, error: { code: 'NO_ACTIVE_GAME', message: 'No active game found' } },
        404,
      )
    }

    // Get enabled CTAs for this merchant (needed for config and replay logic)
    const enabledCtas = await db
      .select()
      .from(ctas)
      .where(and(eq(ctas.merchantId, merchantData.id), eq(ctas.enabled, true)))

    const gameBranding = activeGame.branding as Record<string, unknown> | null

    // Check monthly limit for the merchant
    const tierLimits = await getTierLimits(db)
    const tier = merchantData.subscriptionTier as keyof typeof tierLimits
    const monthlyLimit = (tierLimits[tier] as Record<string, unknown>)?.monthlyPlays as number ?? 200
    let monthlyLimitReached = false
    if (monthlyLimit !== Infinity) {
      const monthStart = new Date()
      monthStart.setUTCDate(1)
      monthStart.setUTCHours(0, 0, 0, 0)
      const monthlyPlaysResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(gamePlays)
        .where(and(eq(gamePlays.merchantId, merchantData.id), gte(gamePlays.playedAt, monthStart)))
      monthlyLimitReached = (monthlyPlaysResult[0]?.count ?? 0) >= monthlyLimit
    }

    c.header('Cache-Control', 'public, max-age=60, s-maxage=300')

    return c.json({
      success: true,
      data: {
        merchantName: merchantData.name,
        monthlyLimitReached,
        merchantLogo: merchantData.logoUrl,
        merchantDescription: merchantData.description,
        merchantCategory: merchantData.category,
        game: {
          id: activeGame.id,
          type: activeGame.type,
          name: activeGame.name,
          description: activeGame.description || undefined,
          branding: {
            primaryColor: merchantData.primaryColor || (gameBranding?.primaryColor as string) || '#6366f1',
            secondaryColor: merchantData.secondaryColor || (gameBranding?.secondaryColor as string) || '#ec4899',
            backgroundUrl: merchantData.backgroundUrl || (gameBranding?.backgroundUrl as string) || null,
            logoUrl: (gameBranding?.logoUrl as string) || null,
          },
          prizes: activeGame.prizes.map((p) => ({
            id: p.id,
            name: p.name,
            emoji: p.emoji,
          })),
        },
        requiredActions: enabledCtas.map((cta) => ({
          type: cta.type,
          label: cta.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          weight: cta.weight,
          config: cta.config,
        })),
        cooldownHours: merchantData.cooldownHours || 24,
        ctaMode: merchantData.ctaMode || 'one_and_done',
        atmosphere: merchantData.atmosphere || 'joyful',
        customColors: (merchantData.atmosphere === 'custom') ? {
          c1: (merchantData as Record<string, unknown>).customColor1 as string || '#6366f1',
          c2: (merchantData as Record<string, unknown>).customColor2 as string || '#ec4899',
          c3: (merchantData as Record<string, unknown>).customColor3 as string || '#f59e0b',
        } : undefined,
        minActionsRequired: 1,
      },
    })
  } catch (err) {
    console.error('Error getting game config:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to load game' } },
      500,
    )
  }
})

// GET /api/v1/play/:slug/state — Get player state for a merchant
playRouter.get('/:slug/state', async (c) => {
  try {
    const db = c.get('db')
    const slug = c.req.param('slug')
    const fingerprintId = c.req.query('fingerprintId')

    if (!fingerprintId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'fingerprintId is required' } },
        400,
      )
    }

    // Look up merchant by slug
    const merchantResult = await db
      .select()
      .from(merchants)
      .where(eq(merchants.slug, slug))
      .limit(1)

    if (merchantResult.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } },
        404,
      )
    }

    const merchantData = merchantResult[0]!

    // Get active game
    const activeGame = await db.query.games.findFirst({
      where: and(eq(games.merchantId, merchantData.id), eq(games.status, 'active')),
    })

    if (!activeGame) {
      return c.json(
        { success: false, error: { code: 'NO_ACTIVE_GAME', message: 'No active game found' } },
        404,
      )
    }

    // Find player by fingerprintId OR hardwareId (cross-browser detection)
    const hardwareId = c.req.query('hardwareId')
    let playerResult = await db
      .select()
      .from(players)
      .where(
        and(
          eq(players.merchantId, merchantData.id),
          eq(players.fingerprintId, fingerprintId),
        ),
      )
      .limit(1)

    // Cross-browser detection: if no match by fingerprint, try hardwareId
    if (playerResult.length === 0 && hardwareId) {
      playerResult = await db
        .select()
        .from(players)
        .where(
          and(
            eq(players.merchantId, merchantData.id),
            eq(players.hardwareId, hardwareId),
          ),
        )
        .limit(1)
    }

    // Get enabled CTAs for this merchant (for replay logic)
    const enabledCtasForState = await db
      .select()
      .from(ctas)
      .where(and(eq(ctas.merchantId, merchantData.id), eq(ctas.enabled, true)))
    const totalCtaTypes = enabledCtasForState.map((ct) => ct.type)

    if (playerResult.length === 0) {
      const maxPlaysPerDay = activeGame.frequencyLimit?.maxPlaysPerDay ?? 1
      return c.json({
        success: true,
        data: {
          playerId: null,
          completedActionsToday: [],
          completedActionsEver: [],
          playsToday: 0,
          maxPlaysPerDay,
          canPlay: true,
          lastPlayResult: null,
          lastCoupon: null,
          allCtasCompleted: false,
        },
      })
    }

    const playerData = playerResult[0]!
    const maxPlaysPerDay = activeGame.frequencyLimit?.maxPlaysPerDay ?? 1
    const cooldownHours = merchantData.cooldownHours || 24
    const cooldownMs = cooldownHours * 60 * 60 * 1000
    const cooldownStart = new Date(Date.now() - cooldownMs)

    // Query plays within cooldown period (replaces "today" check)
    const recentPlays = await db
      .select()
      .from(gamePlays)
      .where(
        and(
          eq(gamePlays.gameId, activeGame.id),
          eq(gamePlays.playerId, playerData.id),
          gte(gamePlays.playedAt, cooldownStart),
        ),
      )

    // Also query ALL plays ever to get every action ever completed
    const allPlays = await db
      .select({ completedActions: gamePlays.completedActions })
      .from(gamePlays)
      .where(eq(gamePlays.playerId, playerData.id))

    // Check max wins per period
    const winPeriodDays = merchantData.winPeriodDays || 7
    const winPeriodStart = new Date(Date.now() - winPeriodDays * 24 * 60 * 60 * 1000)
    const winsInPeriodResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(gamePlays)
      .where(
        and(
          eq(gamePlays.playerId, playerData.id),
          eq(gamePlays.merchantId, merchantData.id),
          eq(gamePlays.result, 'win'),
          gte(gamePlays.playedAt, winPeriodStart),
        ),
      )
    const winsInPeriod = winsInPeriodResult[0]?.count ?? 0
    const maxWinsReached = winsInPeriod >= (merchantData.maxWinsPerPeriod || 5)

    const playsInCooldown = recentPlays.length

    // New replay logic: check if player has won in the cooldown period
    const hasWonInCooldown = recentPlays.some((p) => p.result === 'win')

    // Check if all CTAs have been completed ever
    const allCtasCompleted = totalCtaTypes.length > 0 && totalCtaTypes.every((t) => completedActionsEver.includes(t))

    // canPlay depends on ctaMode
    const ctaMode = merchantData.ctaMode || 'one_and_done'
    let canPlay: boolean
    if (ctaMode === 'one_and_done') {
      // One play per cooldown period, regardless of outcome
      canPlay = playsInCooldown === 0 && !maxWinsReached
    } else {
      // replay_with_ctas: can play if haven't won + CTAs remaining
      canPlay = !hasWonInCooldown && !allCtasCompleted && !maxWinsReached
    }

    // Calculate next play time
    let nextPlayAt: string | null = null
    if (recentPlays.length > 0 && !canPlay) {
      const sorted = recentPlays.sort(
        (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
      )
      const lastPlayTime = new Date(sorted[0]!.playedAt).getTime()
      nextPlayAt = new Date(lastPlayTime + cooldownMs).toISOString()
    }

    // Extract actions completed in cooldown period
    const completedActionsToday: string[] = []
    for (const play of recentPlays) {
      const actions = play.completedActions as string[] | null
      if (actions) {
        for (const action of actions) {
          if (!completedActionsToday.includes(action)) {
            completedActionsToday.push(action)
          }
        }
      }
    }

    // Extract ALL actions ever completed (for preventing repeat actions)
    const completedActionsEver: string[] = []
    for (const play of allPlays) {
      const actions = play.completedActions as string[] | null
      if (actions) {
        for (const action of actions) {
          if (!completedActionsEver.includes(action)) {
            completedActionsEver.push(action)
          }
        }
      }
    }

    // Determine last play result
    let lastPlayResult: 'win' | 'lose' | null = null
    let lastCoupon: { code: string; validFrom: string; validUntil: string } | null = null

    if (recentPlays.length > 0) {
      const sorted = recentPlays.sort(
        (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
      )
      const lastPlay = sorted[0]!
      lastPlayResult = lastPlay.result

      if (lastPlayResult === 'win' && lastPlay.prizeId) {
        const couponResult = await db
          .select()
          .from(coupons)
          .where(
            and(
              eq(coupons.playerId, playerData.id),
              eq(coupons.gameId, activeGame.id),
              gte(coupons.createdAt, cooldownStart),
            ),
          )
          .limit(1)

        if (couponResult.length > 0) {
          const couponData = couponResult[0]!
          lastCoupon = {
            code: couponData.code,
            validFrom: couponData.validFrom.toISOString(),
            validUntil: couponData.validUntil.toISOString(),
          }
        }
      }
    }

    return c.json({
      success: true,
      data: {
        playerId: playerData.id,
        completedActionsToday,
        completedActionsEver,
        playsToday: playsInCooldown,
        maxPlaysPerDay,
        canPlay,
        lastPlayResult,
        lastCoupon,
        nextPlayAt,
        maxWinsReached,
        cooldownHours,
        allCtasCompleted,
        hasWonInCooldown,
      },
    })
  } catch (err) {
    console.error('Error getting player state:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get player state' } },
      500,
    )
  }
})

// POST /api/v1/play/:slug/spin — Play the game
playRouter.post('/:slug/spin', async (c) => {
  try {
    const db = c.get('db')
    const slug = c.req.param('slug')

    // Step a: Look up merchant by slug
    const merchantResult = await db
      .select()
      .from(merchants)
      .where(eq(merchants.slug, slug))
      .limit(1)

    if (merchantResult.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } },
        404,
      )
    }

    const merchantData = merchantResult[0]!

    // Freemium limit check: count plays this month for the merchant
    const dynamicTierLimits = await getTierLimits(db)
    const tier = merchantData.subscriptionTier as keyof typeof dynamicTierLimits
    const monthlyLimit = dynamicTierLimits[tier]?.monthlyPlays ?? 200

    if (monthlyLimit !== Number.POSITIVE_INFINITY) {
      const monthStart = new Date()
      monthStart.setUTCDate(1)
      monthStart.setUTCHours(0, 0, 0, 0)

      const monthlyPlaysResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(gamePlays)
        .where(
          and(
            eq(gamePlays.merchantId, merchantData.id),
            gte(gamePlays.playedAt, monthStart),
          ),
        )

      const playsThisMonth = monthlyPlaysResult[0]?.count ?? 0

      if (playsThisMonth >= monthlyLimit) {
        return c.json(
          {
            success: false,
            error: {
              code: 'MONTHLY_LIMIT_REACHED',
              message: 'Monthly play limit reached. Upgrade your plan for more plays.',
              details: {
                playsThisMonth,
                monthlyLimit,
                tier,
              },
            },
          },
          429,
        )
      }
    }

    // Step b: Get active game with prizes
    const activeGame = await db.query.games.findFirst({
      where: and(eq(games.merchantId, merchantData.id), eq(games.status, 'active')),
      with: { prizes: true },
    })

    if (!activeGame) {
      return c.json(
        { success: false, error: { code: 'NO_ACTIVE_GAME', message: 'No active game found' } },
        404,
      )
    }

    const body = await c.req.json<{
      fingerprintId: string
      hardwareId?: string
      completedActions: string[]
    }>()

    // Validate at least one action completed
    if (!body.completedActions || body.completedActions.length === 0) {
      return c.json(
        {
          success: false,
          error: { code: 'ACTIONS_REQUIRED', message: 'Complete at least one action to play' },
        },
        400,
      )
    }

    if (!body.fingerprintId) {
      return c.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'fingerprintId is required' },
        },
        400,
      )
    }

    // Step c: Find or create player — check fingerprint first, then hardwareId for cross-browser
    let player = await db
      .select()
      .from(players)
      .where(
        and(
          eq(players.merchantId, merchantData.id),
          eq(players.fingerprintId, body.fingerprintId),
        ),
      )
      .limit(1)

    // Cross-browser detection: same hardware on different browser
    if (player.length === 0 && body.hardwareId) {
      player = await db
        .select()
        .from(players)
        .where(
          and(
            eq(players.merchantId, merchantData.id),
            eq(players.hardwareId, body.hardwareId),
          ),
        )
        .limit(1)
    }

    let playerId: string

    if (player.length === 0) {
      const newPlayer = await db
        .insert(players)
        .values({
          merchantId: merchantData.id,
          fingerprintId: body.fingerprintId,
          hardwareId: body.hardwareId,
        })
        .returning()
      playerId = newPlayer[0]!.id
    } else {
      playerId = player[0]!.id
      // Update lastSeenAt and hardwareId if provided
      const updateSet: Record<string, unknown> = { lastSeenAt: new Date() }
      if (body.hardwareId) updateSet.hardwareId = body.hardwareId
      await db
        .update(players)
        .set(updateSet)
        .where(eq(players.id, playerId))
    }

    // Step d: Check frequency limits — new replay logic
    const isTestMode = c.req.query('testmode') === 'unlimited'
    const cooldownHours = merchantData.cooldownHours || 24
    const cooldownMs = cooldownHours * 60 * 60 * 1000
    const cooldownStart = new Date(Date.now() - cooldownMs)

    // Get recent plays in cooldown period
    const recentPlays = await db
      .select()
      .from(gamePlays)
      .where(
        and(
          eq(gamePlays.gameId, activeGame.id),
          eq(gamePlays.playerId, playerId),
          gte(gamePlays.playedAt, cooldownStart),
        ),
      )

    // Check if player has already WON in the cooldown period
    const hasWonInCooldown = recentPlays.some((p) => p.result === 'win')

    // Get enabled CTAs to check if there are still uncompleted ones
    const enabledCtasForSpin = await db
      .select()
      .from(ctas)
      .where(and(eq(ctas.merchantId, merchantData.id), eq(ctas.enabled, true)))
    const totalCtaTypes = enabledCtasForSpin.map((ct) => ct.type)

    // Get ALL actions ever completed by this player
    const allPlaysForActions = await db
      .select({ completedActions: gamePlays.completedActions })
      .from(gamePlays)
      .where(eq(gamePlays.playerId, playerId))

    const completedActionsEver: string[] = []
    for (const play of allPlaysForActions) {
      const actions = play.completedActions as string[] | null
      if (actions) {
        for (const action of actions) {
          if (!completedActionsEver.includes(action)) {
            completedActionsEver.push(action)
          }
        }
      }
    }

    const allCtasCompleted = totalCtaTypes.length > 0 && totalCtaTypes.every((t) => completedActionsEver.includes(t))

    if (!isTestMode) {
      const ctaMode = merchantData.ctaMode || 'one_and_done'

      // Block if player already WON in this cooldown period
      if (hasWonInCooldown) {
        return c.json(
          {
            success: false,
            error: { code: 'ALREADY_WON', message: 'You already won in this period! Come back later.' },
          },
          429,
        )
      }

      // In "one_and_done" mode: block if player has already played in cooldown period (any result)
      if (ctaMode === 'one_and_done' && recentPlays.length > 0) {
        return c.json(
          {
            success: false,
            error: { code: 'COOLDOWN_ACTIVE', message: 'You have already played. Come back later!' },
          },
          429,
        )
      }

      // In "replay_with_ctas" mode: block if all CTAs are exhausted
      if (ctaMode === 'replay_with_ctas' && totalCtaTypes.length > 0 && allCtasCompleted) {
        return c.json(
          {
            success: false,
            error: { code: 'ALL_CTAS_COMPLETED', message: 'You have completed all actions. Come back later!' },
          },
          429,
        )
      }
    }

    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    // Step e: Count today's wins per prize for game engine
    const todayWinsPerPrize = await db
      .select({
        prizeId: gamePlays.prizeId,
        count: sql<number>`count(*)::int`,
      })
      .from(gamePlays)
      .where(
        and(
          eq(gamePlays.gameId, activeGame.id),
          eq(gamePlays.result, 'win'),
          gte(gamePlays.playedAt, todayStart),
        ),
      )
      .groupBy(gamePlays.prizeId)

    const todayWonMap = new Map<string, number>()
    for (const row of todayWinsPerPrize) {
      if (row.prizeId) {
        todayWonMap.set(row.prizeId, row.count)
      }
    }

    // Build prize configs for game engine
    const prizeConfigs: PrizeConfig[] = activeGame.prizes.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? undefined,
      emoji: p.emoji ?? undefined,
      winRate: p.winRate,
      maxTotal: p.maxTotal ?? undefined,
      maxPerDay: p.maxPerDay ?? undefined,
      totalWon: p.totalWon,
      todayWon: todayWonMap.get(p.id) ?? 0,
      couponValidityDays: p.couponValidityDays,
      couponActivationDelayHours: p.couponActivationDelayHours,
    }))

    // Run game engine
    const result = determineGameOutcome(Number(activeGame.globalWinRate), prizeConfigs)

    // Step f & g: Handle result
    if (result.outcome === 'win' && result.prize) {
      const couponCode = generateCouponCode()
      const { validFrom, validUntil } = calculateCouponDates(
        result.prize.couponActivationDelayHours,
        result.prize.couponValidityDays,
      )

      // Create coupon, increment totalWon, create game play, update player stats
      const couponInsert = db.insert(coupons).values({
        merchantId: merchantData.id,
        gameId: activeGame.id,
        prizeId: result.prize.id,
        playerId,
        code: couponCode,
        prizeName: result.prize.name,
        prizeDescription: result.prize.description,
        validFrom,
        validUntil,
      }).returning()

      const prizeUpdate = db
        .update(prizes)
        .set({ totalWon: sql`${prizes.totalWon} + 1` })
        .where(eq(prizes.id, result.prize.id))

      const gamePlayInsert = db.insert(gamePlays).values({
        gameId: activeGame.id,
        merchantId: merchantData.id,
        playerId,
        result: 'win',
        prizeId: result.prize.id,
        completedActions: body.completedActions,
      })

      // Points: +1 for play, +2 per completed action, +5 for win
      const actionPoints = (body.completedActions?.length ?? 0) * 2
      const winPoints = 1 + actionPoints + 5

      const playerUpdate = db
        .update(players)
        .set({
          totalPlays: sql`${players.totalPlays} + 1`,
          totalWins: sql`${players.totalWins} + 1`,
          points: sql`${players.points} + ${winPoints}`,
          lastSeenAt: new Date(),
        })
        .where(eq(players.id, playerId))

      const [couponResult] = await db.batch([couponInsert, prizeUpdate, gamePlayInsert, playerUpdate])

      // Email is now sent via the separate /register endpoint after the player fills in their details

      return c.json({
        success: true,
        data: {
          outcome: 'win',
          prize: {
            name: result.prize.name,
            description: result.prize.description,
            emoji: result.prize.emoji,
          },
          coupon: {
            code: couponResult[0]!.code,
            validFrom: validFrom.toISOString(),
            validUntil: validUntil.toISOString(),
          },
        },
      })
    }

    // Lose outcome — record play and update player stats
    // Points: +1 for play, +2 per completed action
    const loseActionPoints = (body.completedActions?.length ?? 0) * 2
    const losePoints = 1 + loseActionPoints

    const gamePlayInsert = db.insert(gamePlays).values({
      gameId: activeGame.id,
      merchantId: merchantData.id,
      playerId,
      result: 'lose',
      completedActions: body.completedActions,
    })

    const playerUpdate = db
      .update(players)
      .set({
        totalPlays: sql`${players.totalPlays} + 1`,
        points: sql`${players.points} + ${losePoints}`,
        lastSeenAt: new Date(),
      })
      .where(eq(players.id, playerId))

    await db.batch([gamePlayInsert, playerUpdate])

    return c.json({
      success: true,
      data: {
        outcome: 'lose',
        message: 'Better luck next time! Come back tomorrow for another chance.',
      },
    })
  } catch (err) {
    console.error('Error playing game:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to play game' } },
      500,
    )
  }
})

// POST /api/v1/play/:slug/register — Register player name/email and send coupon email
playRouter.post('/:slug/register', async (c) => {
  try {
    const db = c.get('db')
    const slug = c.req.param('slug')

    const body = await c.req.json<{
      fingerprintId: string
      hardwareId?: string
      name: string
      email: string
    }>()

    if (!body.fingerprintId || !body.name || !body.email) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'fingerprintId, name, and email are required' } },
        400,
      )
    }

    // Look up merchant by slug
    const merchantResult = await db
      .select()
      .from(merchants)
      .where(eq(merchants.slug, slug))
      .limit(1)

    if (merchantResult.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } },
        404,
      )
    }

    const merchantData = merchantResult[0]!

    // Find player by fingerprintId or hardwareId
    let playerResult = await db
      .select()
      .from(players)
      .where(
        and(
          eq(players.merchantId, merchantData.id),
          eq(players.fingerprintId, body.fingerprintId),
        ),
      )
      .limit(1)

    if (playerResult.length === 0 && body.hardwareId) {
      playerResult = await db
        .select()
        .from(players)
        .where(
          and(
            eq(players.merchantId, merchantData.id),
            eq(players.hardwareId, body.hardwareId),
          ),
        )
        .limit(1)
    }

    if (playerResult.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Player not found' } },
        404,
      )
    }

    const playerData = playerResult[0]!

    // Update player name and email
    await db
      .update(players)
      .set({ name: body.name, email: body.email, lastSeenAt: new Date() })
      .where(eq(players.id, playerData.id))

    // Find the most recent coupon for this player
    const recentCoupon = await db
      .select()
      .from(coupons)
      .where(eq(coupons.playerId, playerData.id))
      .orderBy(sql`${coupons.createdAt} DESC`)
      .limit(1)

    let emailSent = false

    if (recentCoupon.length > 0) {
      const couponData = recentCoupon[0]!
      const apiKey = c.env.RESEND_API_KEY ?? ''

      try {
        await sendCouponEmail({
          to: body.email,
          playerName: body.name,
          merchantName: merchantData.name,
          prizeName: couponData.prizeName,
          prizeEmoji: undefined,
          couponCode: couponData.code,
          validFrom: couponData.validFrom.toISOString(),
          validUntil: couponData.validUntil.toISOString(),
        }, apiKey)
        emailSent = true
      } catch (err) {
      }
    } else {
    }

    return c.json({
      success: true,
      data: { emailSent },
    })
  } catch (err) {
    console.error('Error registering player:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to register' } },
      500,
    )
  }
})

// GET /api/v1/play/coupon/:code — Verify a coupon
playRouter.get('/coupon/:code', async (c) => {
  try {
    const db = c.get('db')
    const code = c.req.param('code')

    const coupon = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1)

    if (coupon.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Coupon not found' } },
        404,
      )
    }

    const couponData = coupon[0]!

    return c.json({
      success: true,
      data: {
        code: couponData.code,
        status: couponData.status,
        prizeName: couponData.prizeName,
        prizeDescription: couponData.prizeDescription,
        validFrom: couponData.validFrom.toISOString(),
        validUntil: couponData.validUntil.toISOString(),
        redeemedAt: couponData.redeemedAt?.toISOString() ?? null,
      },
    })
  } catch (err) {
    console.error('Error verifying coupon:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to verify coupon' } },
      500,
    )
  }
})
