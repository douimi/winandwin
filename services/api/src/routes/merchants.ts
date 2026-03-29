import { Hono } from 'hono'
import { eq, count } from 'drizzle-orm'
import { merchants, users } from '@winandwin/db/schema'
import { createMerchantSchema, paginationSchema, merchantCategorySchema } from '@winandwin/shared/validators'
import { z } from 'zod'
import type { AppEnv } from '../types'

const updateMerchantSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: merchantCategorySchema.optional(),
  timezone: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  validationPin: z.string().min(4).max(6).regex(/^\d+$/).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  backgroundUrl: z.string().url().or(z.literal('')).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  atmosphere: z.enum(['joyful', 'premium', 'warm', 'kids', 'custom']).optional(),
  customColor1: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  customColor2: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  customColor3: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  address: z
    .object({
      street: z.string().max(200),
      city: z.string().max(100),
      postalCode: z.string().max(20),
      country: z.string().length(2),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
    })
    .optional(),
})

export const merchantsRouter = new Hono<AppEnv>()

// GET / — List merchants with pagination
merchantsRouter.get('/', async (c) => {
  try {
    const db = c.get('db')
    const query = c.req.query()
    const { page, pageSize } = paginationSchema.parse(query)

    const offset = (page - 1) * pageSize

    const [merchantList, totalResult] = await Promise.all([
      db.select().from(merchants).limit(pageSize).offset(offset),
      db.select({ total: count() }).from(merchants),
    ])

    const total = totalResult[0]?.total ?? 0

    return c.json({
      success: true,
      data: merchantList,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (err) {
    console.error('Error listing merchants:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list merchants' } },
      500,
    )
  }
})

// GET /:id — Get single merchant by ID
merchantsRouter.get('/:id', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')

    const merchant = await db.select().from(merchants).where(eq(merchants.id, id)).limit(1)

    if (merchant.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } },
        404,
      )
    }

    return c.json({ success: true, data: merchant[0] })
  } catch (err) {
    console.error('Error getting merchant:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get merchant' } },
      500,
    )
  }
})

// POST / — Create a merchant (and optionally link to user)
merchantsRouter.post('/', async (c) => {
  try {
    const db = c.get('db')
    const body = await c.req.json()

    const parsed = createMerchantSchema.safeParse(body)
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

    const { name, category, email, userId, address, phone } = parsed.data

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Ensure slug is unique by appending random suffix
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`

    const defaultAddress = address || {
      street: '',
      city: '',
      postalCode: '',
      country: 'FR',
    }

    const result = await db
      .insert(merchants)
      .values({
        name,
        slug,
        category,
        email,
        phone,
        address: defaultAddress,
      })
      .returning()

    const merchant = result[0]!

    // If userId provided, link user to this merchant
    if (userId) {
      await db
        .update(users)
        .set({ merchantId: merchant.id })
        .where(eq(users.id, userId))
    }

    return c.json({ success: true, data: merchant }, 201)
  } catch (err) {
    console.error('Error creating merchant:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create merchant' } },
      500,
    )
  }
})

// PATCH /:id — Update merchant fields
merchantsRouter.patch('/:id', async (c) => {
  try {
    const db = c.get('db')
    const id = c.req.param('id')
    const body = await c.req.json()

    const parsed = updateMerchantSchema.safeParse(body)
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

    // Check merchant exists
    const existing = await db.select().from(merchants).where(eq(merchants.id, id)).limit(1)
    if (existing.length === 0) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } },
        404,
      )
    }

    const updates: Record<string, unknown> = {}
    if (parsed.data.name !== undefined) updates.name = parsed.data.name
    if (parsed.data.category !== undefined) updates.category = parsed.data.category
    if (parsed.data.timezone !== undefined) updates.timezone = parsed.data.timezone
    if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone
    if (parsed.data.validationPin !== undefined) updates.validationPin = parsed.data.validationPin
    if (parsed.data.primaryColor !== undefined) updates.primaryColor = parsed.data.primaryColor
    if (parsed.data.secondaryColor !== undefined) updates.secondaryColor = parsed.data.secondaryColor
    if (parsed.data.backgroundUrl !== undefined) updates.backgroundUrl = parsed.data.backgroundUrl || null
    if (parsed.data.description !== undefined) updates.description = parsed.data.description || null
    if (parsed.data.logoUrl !== undefined) updates.logoUrl = parsed.data.logoUrl || null
    if (parsed.data.address !== undefined) updates.address = parsed.data.address
    if (parsed.data.atmosphere !== undefined) updates.atmosphere = parsed.data.atmosphere
    if (parsed.data.customColor1 !== undefined) updates.customColor1 = parsed.data.customColor1
    if (parsed.data.customColor2 !== undefined) updates.customColor2 = parsed.data.customColor2
    if (parsed.data.customColor3 !== undefined) updates.customColor3 = parsed.data.customColor3

    if (Object.keys(updates).length === 0) {
      return c.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'No fields to update' } },
        400,
      )
    }

    const result = await db
      .update(merchants)
      .set(updates)
      .where(eq(merchants.id, id))
      .returning()

    return c.json({ success: true, data: result[0] })
  } catch (err) {
    console.error('Error updating merchant:', err)
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update merchant' } },
      500,
    )
  }
})
