import { Hono } from 'hono'
import { eq, and, sql } from 'drizzle-orm'
import { ctas, merchants } from '@winandwin/db/schema'
import { createCtaSchema } from '@winandwin/shared/validators'
import { getTierLimits } from '../lib/tier-limits'
import { z } from 'zod'
import type { AppEnv } from '../types'

const updateCtaSchema = z.object({
  enabled: z.boolean().optional(),
  weight: z.number().int().min(1).max(10).optional(),
  config: z.record(z.unknown()).optional(),
})

export const ctasRouter = new Hono<AppEnv>()

// GET / — List CTAs for a merchant
ctasRouter.get('/', async (c) => {
  try {
    const db = c.get('db')
    const merchantId = c.req.query('merchantId')

    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    const ctaList = await db
      .select()
      .from(ctas)
      .where(eq(ctas.merchantId, merchantId))

    return c.json({ success: true, data: ctaList })
  } catch (err) {
    console.error('Error listing CTAs:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list CTAs' } },
      500,
    )
  }
})

// POST / — Create a CTA
ctasRouter.post('/', async (c) => {
  try {
    const db = c.get('db')
    const body = await c.req.json()

    const merchantId = body.merchantId
    if (!merchantId) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'merchantId is required' } },
        400,
      )
    }

    const parsed = createCtaSchema.safeParse(body)
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

    // Test mode bypass
    const isTestMode = c.req.query('testmode') === 'unlimited'

    if (!isTestMode) {
      // Tier limit: check maxCtas
      const merchantResult = await db
        .select()
        .from(merchants)
        .where(eq(merchants.id, merchantId))
        .limit(1)

      if (merchantResult.length > 0) {
        const tierLimits = await getTierLimits(db)
        const tier = merchantResult[0]!.subscriptionTier as keyof typeof tierLimits
        const limits = tierLimits[tier] as Record<string, unknown> | undefined
        const maxCtas = (limits?.maxCtas as number) ?? 999

        const ctaCountResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(ctas)
          .where(eq(ctas.merchantId, merchantId))

        const ctaCount = ctaCountResult[0]?.count ?? 0
        if (ctaCount >= maxCtas) {
          return c.json(
            {
              success: false,
              error: {
                code: 'TIER_LIMIT',
                message: `Your plan allows ${maxCtas} CTA${maxCtas !== 1 ? 's' : ''}. Upgrade to add more.`,
              },
            },
            403,
          )
        }
      }
    }

    // Check if a CTA of this type already exists for this merchant
    const existing = await db
      .select()
      .from(ctas)
      .where(and(eq(ctas.merchantId, merchantId), eq(ctas.type, parsed.data.type)))
      .limit(1)

    if (existing.length > 0) {
      return c.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE',
            message: `A CTA of type "${parsed.data.type}" already exists for this merchant`,
          },
        },
        409,
      )
    }

    const result = await db
      .insert(ctas)
      .values({
        merchantId,
        type: parsed.data.type,
        enabled: parsed.data.enabled,
        weight: parsed.data.weight,
        config: parsed.data.config,
      })
      .returning()

    return c.json({ success: true, data: result[0] }, 201)
  } catch (err) {
    console.error('Error creating CTA:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create CTA' } },
      500,
    )
  }
})

// PATCH /:id — Update a CTA
ctasRouter.patch('/:id', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')
    const body = await c.req.json()

    const parsed = updateCtaSchema.safeParse(body)
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

    const existing = await db.select().from(ctas).where(eq(ctas.id, id)).limit(1)
    if (existing.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'CTA not found' } },
        404,
      )
    }

    const updates: Record<string, unknown> = {}
    if (parsed.data.enabled !== undefined) updates.enabled = parsed.data.enabled
    if (parsed.data.weight !== undefined) updates.weight = parsed.data.weight
    if (parsed.data.config !== undefined) updates.config = parsed.data.config

    if (Object.keys(updates).length === 0) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'No fields to update' } },
        400,
      )
    }

    const result = await db
      .update(ctas)
      .set(updates)
      .where(eq(ctas.id, id))
      .returning()

    return c.json({ success: true, data: result[0] })
  } catch (err) {
    console.error('Error updating CTA:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update CTA' } },
      500,
    )
  }
})

// DELETE /:id — Delete a CTA
ctasRouter.delete('/:id', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    const result = await db.delete(ctas).where(eq(ctas.id, id)).returning()

    if (result.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'CTA not found' } },
        404,
      )
    }

    return c.json({ success: true, data: { id, deleted: true } })
  } catch (err) {
    console.error('Error deleting CTA:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete CTA' } },
      500,
    )
  }
})
