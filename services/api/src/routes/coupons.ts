import { Hono } from 'hono'
import { eq, and, count, asc, desc, ilike, or, type SQL } from 'drizzle-orm'
import { coupons, merchants, players } from '@winandwin/db/schema'
import { paginationSchema } from '@winandwin/shared/validators'
import { z } from 'zod'
import type { AppEnv } from '../types'

export const couponsRouter = new Hono<AppEnv>()

// Whitelist of sortable columns — never trust the client to name a column.
const SORTABLE_COLUMNS = {
  code: coupons.code,
  prizeName: coupons.prizeName,
  status: coupons.status,
  validFrom: coupons.validFrom,
  validUntil: coupons.validUntil,
  redeemedAt: coupons.redeemedAt,
  createdAt: coupons.createdAt,
  playerName: players.name,
  playerEmail: players.email,
} as const

type SortKey = keyof typeof SORTABLE_COLUMNS

// GET / — List coupons for a merchant with pagination + sort + search
couponsRouter.get('/', async (c) => {
  try {
    const db = c.get('db')
    const query = c.req.query()
    const { page, pageSize } = paginationSchema.parse(query)
    const merchantId = c.req.query('merchantId')
    const search = c.req.query('search')?.trim() || ''
    const statusFilter = c.req.query('status')?.trim() || ''
    const sortParam = c.req.query('sort') || 'createdAt'
    const dirParam = c.req.query('dir') || 'desc'

    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    const sortKey = (Object.keys(SORTABLE_COLUMNS) as SortKey[]).includes(sortParam as SortKey)
      ? (sortParam as SortKey)
      : 'createdAt'
    const sortDir = dirParam === 'asc' ? asc : desc
    const orderExpr = sortDir(SORTABLE_COLUMNS[sortKey])

    const offset = (page - 1) * pageSize

    const whereParts: SQL[] = [eq(coupons.merchantId, merchantId)]

    if (statusFilter && ['active', 'redeemed', 'expired', 'revoked'].includes(statusFilter)) {
      whereParts.push(eq(coupons.status, statusFilter as 'active' | 'redeemed' | 'expired' | 'revoked'))
    }

    if (search) {
      const pattern = `%${search}%`
      whereParts.push(
        or(
          ilike(coupons.code, pattern),
          ilike(coupons.prizeName, pattern),
          ilike(players.name, pattern),
          ilike(players.email, pattern),
        )!,
      )
    }

    const whereExpr = whereParts.length === 1 ? whereParts[0]! : and(...whereParts)!

    const [couponList, totalResult] = await Promise.all([
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
          playerId: coupons.playerId,
          playerName: players.name,
          playerEmail: players.email,
        })
        .from(coupons)
        .leftJoin(players, eq(coupons.playerId, players.id))
        .where(whereExpr)
        .orderBy(orderExpr)
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: count() })
        .from(coupons)
        .leftJoin(players, eq(coupons.playerId, players.id))
        .where(whereExpr),
    ])

    const total = totalResult[0]?.total ?? 0

    const data = couponList.map((row) => ({
      id: row.id,
      code: row.code,
      status: row.status,
      prizeName: row.prizeName,
      prizeDescription: row.prizeDescription,
      redemptionConditions: (row.redemptionConditions as string[] | null) ?? [],
      validFrom: row.validFrom.toISOString(),
      validUntil: row.validUntil.toISOString(),
      redeemedAt: row.redeemedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      playerId: row.playerId,
      playerName: row.playerName,
      playerEmail: row.playerEmail,
    }))

    return c.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      sort: { field: sortKey, dir: dirParam === 'asc' ? 'asc' : 'desc' },
    })
  } catch (err) {
    console.error('Error listing coupons:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list coupons' } },
      500,
    )
  }
})

// POST /:id/redeem — Redeem a coupon
couponsRouter.post('/:id/redeem', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    // Check coupon exists and is active
    const coupon = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1)

    if (coupon.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Coupon not found' } },
        404,
      )
    }

    const couponData = coupon[0]!

    if (couponData.status !== 'active') {
      return c.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Coupon is ${couponData.status}, cannot redeem`,
          },
        },
        400,
      )
    }

    // Only the expiration cutoff matters for the merchant admin action.
    // We intentionally DON'T check validFrom (the activation-delay window)
    // — that check exists on the customer-facing /validate/:code + PIN
    // flow, where it prevents a customer from redeeming before the
    // configured delay. But the merchant is physically with the customer
    // when they click Redeem, so blocking them because "the coupon
    // technically activates in 4 hours" would just leave staff staring
    // at a silent 400 error (as a merchant reported).
    const now = new Date()

    if (now > couponData.validUntil) {
      // Mark as expired so the list reflects the truth going forward.
      await db
        .update(coupons)
        .set({ status: 'expired' })
        .where(eq(coupons.id, id))

      return c.json(
        { success: false, error: { code: 'EXPIRED', message: 'Coupon has expired' } },
        400,
      )
    }

    const result = await db
      .update(coupons)
      .set({ status: 'redeemed', redeemedAt: now })
      .where(eq(coupons.id, id))
      .returning()

    return c.json({ success: true, data: result[0] })
  } catch (err) {
    console.error('Error redeeming coupon:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to redeem coupon' } },
      500,
    )
  }
})

// POST /:id/revoke — Revoke a coupon
couponsRouter.post('/:id/revoke', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    const coupon = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1)

    if (coupon.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Coupon not found' } },
        404,
      )
    }

    const couponData = coupon[0]!

    if (couponData.status === 'redeemed') {
      return c.json(
        {
          success: false,
          error: { code: 'ALREADY_REDEEMED', message: 'Cannot revoke a redeemed coupon' },
        },
        400,
      )
    }

    const result = await db
      .update(coupons)
      .set({ status: 'revoked' })
      .where(eq(coupons.id, id))
      .returning()

    return c.json({ success: true, data: result[0] })
  } catch (err) {
    console.error('Error revoking coupon:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to revoke coupon' } },
      500,
    )
  }
})

// GET /api/v1/coupons/lookup/:code — Look up a coupon by code (public, for validation page)
couponsRouter.get('/lookup/:code', async (c) => {
  try {
    const db = c.get('db')
    const code = c.req.param('code')

    const couponResult = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1)

    if (couponResult.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Coupon not found' } },
        404,
      )
    }

    const couponData = couponResult[0]!

    // Look up the merchant name
    const merchantResult = await db
      .select({ name: merchants.name })
      .from(merchants)
      .where(eq(merchants.id, couponData.merchantId))
      .limit(1)

    const merchantName = merchantResult[0]?.name ?? 'Unknown'

    // Check if expired
    const now = new Date()
    let status = couponData.status
    if (status === 'active' && now > couponData.validUntil) {
      status = 'expired'
    }

    return c.json({
      success: true,
      data: {
        code: couponData.code,
        status,
        prizeName: couponData.prizeName,
        prizeDescription: couponData.prizeDescription,
        redemptionConditions: (couponData.redemptionConditions as string[] | null) ?? [],
        merchantName,
        validFrom: couponData.validFrom.toISOString(),
        validUntil: couponData.validUntil.toISOString(),
        redeemedAt: couponData.redeemedAt?.toISOString() ?? null,
      },
    })
  } catch (err) {
    console.error('Error looking up coupon:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to look up coupon' } },
      500,
    )
  }
})

const validateSchema = z.object({
  code: z.string().min(1),
  pin: z.string().min(4).max(6).regex(/^\d+$/),
})

// POST /api/v1/coupons/validate — Validate and redeem a coupon with merchant PIN
couponsRouter.post('/validate', async (c) => {
  try {
    const db = c.get('db')
    const body = await c.req.json()

    const parsed = validateSchema.safeParse(body)
    if (!parsed.success) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input. Provide a valid coupon code and PIN.',
            details: parsed.error.flatten(),
          },
        },
        400,
      )
    }

    const { code, pin } = parsed.data

    // Look up coupon
    const couponResult = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1)

    if (couponResult.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Coupon not found' } },
        404,
      )
    }

    const couponData = couponResult[0]!

    // Look up merchant and verify PIN
    const merchantResult = await db
      .select()
      .from(merchants)
      .where(eq(merchants.id, couponData.merchantId))
      .limit(1)

    if (merchantResult.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } },
        404,
      )
    }

    const merchantData = merchantResult[0]!

    if (merchantData.validationPin !== pin) {
      return c.json(
        { success: false, error: { code: 'INVALID_PIN', message: 'Invalid PIN' } },
        403,
      )
    }

    // Check coupon status
    if (couponData.status === 'redeemed') {
      return c.json(
        {
          success: false,
          error: {
            code: 'ALREADY_REDEEMED',
            message: 'This coupon has already been redeemed',
          },
        },
        400,
      )
    }

    if (couponData.status !== 'active') {
      return c.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Coupon is ${couponData.status}`,
          },
        },
        400,
      )
    }

    // Check validity window
    const now = new Date()
    if (now < couponData.validFrom) {
      return c.json(
        { success: false, error: { code: 'NOT_YET_VALID', message: 'Coupon is not yet valid' } },
        400,
      )
    }

    if (now > couponData.validUntil) {
      await db
        .update(coupons)
        .set({ status: 'expired' })
        .where(eq(coupons.id, couponData.id))

      return c.json(
        { success: false, error: { code: 'EXPIRED', message: 'Coupon has expired' } },
        400,
      )
    }

    // Redeem the coupon
    const result = await db
      .update(coupons)
      .set({ status: 'redeemed', redeemedAt: now })
      .where(eq(coupons.id, couponData.id))
      .returning()

    return c.json({
      success: true,
      data: {
        code: result[0]!.code,
        status: 'redeemed',
        prizeName: result[0]!.prizeName,
        merchantName: merchantData.name,
        redeemedAt: now.toISOString(),
      },
    })
  } catch (err) {
    console.error('Error validating coupon:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to validate coupon' } },
      500,
    )
  }
})
