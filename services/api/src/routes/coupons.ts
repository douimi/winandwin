import { Hono } from 'hono'
import { eq, and, count, desc } from 'drizzle-orm'
import { coupons, merchants } from '@winandwin/db/schema'
import { paginationSchema } from '@winandwin/shared/validators'
import { z } from 'zod'
import type { AppEnv } from '../types'

export const couponsRouter = new Hono<AppEnv>()

// GET / — List coupons for a merchant with pagination
couponsRouter.get('/', async (c) => {
  try {
    const db = c.get('db')
    const query = c.req.query()
    const { page, pageSize } = paginationSchema.parse(query)
    const merchantId = c.req.query('merchantId')

    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    const offset = (page - 1) * pageSize

    const [couponList, totalResult] = await Promise.all([
      db
        .select()
        .from(coupons)
        .where(eq(coupons.merchantId, merchantId))
        .orderBy(desc(coupons.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: count() })
        .from(coupons)
        .where(eq(coupons.merchantId, merchantId)),
    ])

    const total = totalResult[0]?.total ?? 0

    return c.json({
      success: true,
      data: couponList,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
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

    // Check validity window
    const now = new Date()
    if (now < couponData.validFrom) {
      return c.json(
        {
          success: false,
          error: { code: 'NOT_YET_VALID', message: 'Coupon is not yet valid' },
        },
        400,
      )
    }

    if (now > couponData.validUntil) {
      // Mark as expired
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
