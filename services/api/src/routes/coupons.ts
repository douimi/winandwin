import { Hono } from 'hono'
import { eq, and, count, desc } from 'drizzle-orm'
import { coupons } from '@winandwin/db/schema'
import { paginationSchema } from '@winandwin/shared/validators'
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
