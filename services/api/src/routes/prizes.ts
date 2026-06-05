import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { prizes } from '@winandwin/db/schema'
import { updatePrizeSchema } from '@winandwin/shared/validators'
import type { AppEnv } from '../types'

export const prizesRouter = new Hono<AppEnv>()

// PATCH /:id — Update prize fields
prizesRouter.patch('/:id', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')
    const body = await c.req.json()

    const parsed = updatePrizeSchema.safeParse(body)
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

    const existing = await db.select().from(prizes).where(eq(prizes.id, id)).limit(1)
    if (existing.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Prize not found' } },
        404,
      )
    }

    // Only set the fields the caller supplied — undefined keys are skipped,
    // null is forwarded so the UI can clear nullable columns (maxTotal/maxPerDay/etc).
    const updates: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v !== undefined) updates[k] = v
    }

    if (Object.keys(updates).length === 0) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'No fields to update' } },
        400,
      )
    }

    const result = await db
      .update(prizes)
      .set(updates)
      .where(eq(prizes.id, id))
      .returning()

    return c.json({ success: true, data: result[0] })
  } catch (err) {
    console.error('Error updating prize:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update prize' } },
      500,
    )
  }
})

// DELETE /:id — Hard delete a prize. Existing coupons retain their snapshotted
// prizeName/description/redemptionConditions, so customer-facing wins survive deletion.
prizesRouter.delete('/:id', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    const result = await db.delete(prizes).where(eq(prizes.id, id)).returning({ id: prizes.id })

    if (result.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Prize not found' } },
        404,
      )
    }

    return c.json({ success: true, data: { id, deleted: true } })
  } catch (err) {
    console.error('Error deleting prize:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete prize' } },
      500,
    )
  }
})

// POST /:id/reset — Reset the totalWon counter so a maxed-out prize is winnable again.
// Past coupons keep their original snapshot; this only affects future plays.
prizesRouter.post('/:id/reset', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    const result = await db
      .update(prizes)
      .set({ totalWon: 0 })
      .where(eq(prizes.id, id))
      .returning()

    if (result.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Prize not found' } },
        404,
      )
    }

    return c.json({ success: true, data: result[0] })
  } catch (err) {
    console.error('Error resetting prize:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reset prize' } },
      500,
    )
  }
})
