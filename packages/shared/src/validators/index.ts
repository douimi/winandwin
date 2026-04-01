import { z } from 'zod'

// ============================================================
// Zod Validators — Win & Win MVP
// ============================================================

// --- Common ---

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

// --- Merchant ---

export const merchantCategorySchema = z.enum([
  'restaurant',
  'cafe',
  'bar',
  'retail',
  'salon',
  'gym',
  'entertainment',
  'hotel',
  'other',
])

export const addressSchema = z.object({
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().length(2), // ISO 3166-1 alpha-2
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
})

export const createMerchantSchema = z.object({
  name: z.string().min(1).max(100),
  category: merchantCategorySchema,
  email: z.string().email(),
  userId: z.string().optional(),
  address: addressSchema.optional(),
  phone: z.string().max(20).optional(),
})

// --- Game ---

export const gameTypeSchema = z.enum(['wheel', 'slots', 'mystery_box'])

export const prizeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  emoji: z.string().max(10).optional(),
  winRate: z.number().min(0.1).max(100),
  maxTotal: z.number().int().min(1).optional(),
  maxPerDay: z.number().int().min(1).optional(),
  couponValidityDays: z.number().int().min(1).max(365).default(7),
  couponActivationDelayHours: z.number().int().min(0).max(72).default(24),
})

export const gameScheduleSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  activeDays: z.array(z.number().int().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
  activeHoursStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  activeHoursEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
})

export const frequencyLimitSchema = z.object({
  maxPlaysPerDay: z.number().int().min(1).max(100).default(1),
  maxPlaysPerWeek: z.number().int().min(1).optional(),
  cooldownMinutes: z.number().int().min(0).optional(),
})

export const gameBrandingSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default('#6366f1'),
  secondaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default('#ec4899'),
  logoUrl: z.string().url().optional(),
  backgroundUrl: z.string().url().optional(),
})

export const createGameSchema = z.object({
  type: gameTypeSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  config: z.object({
    prizes: z.array(prizeSchema).min(1).max(20),
    globalWinRate: z.number().min(1).max(100).default(30),
    scheduling: gameScheduleSchema.default({}),
    frequencyLimit: frequencyLimitSchema.default({}),
    branding: gameBrandingSchema.default({}),
  }),
})

// --- CTA ---

export const ctaTypeSchema = z.enum([
  'google_review',
  'instagram_follow',
  'email_collect',
  'visit_stamp',
  'receipt_photo',
  'tripadvisor_review',
  'facebook_like',
  'tiktok_follow',
  'book_appointment',
  'whatsapp_join',
  'refer_friend',
  'survey_feedback',
])

export const createCtaSchema = z.object({
  type: ctaTypeSchema,
  enabled: z.boolean().default(true),
  weight: z.number().int().min(1).max(10).default(1),
  config: z.record(z.unknown()).default({}),
})

// --- Player Game Play ---

export const startGamePlaySchema = z.object({
  gameId: z.string().uuid(),
  fingerprintId: z.string().min(1),
  completedActions: z.array(ctaTypeSchema).min(1),
})

// --- Auth ---

export const signUpSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  merchantName: z.string().min(1).max(100),
  category: merchantCategorySchema,
})

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// --- Type exports from validators ---

export type CreateMerchantInput = z.infer<typeof createMerchantSchema>
export type CreateGameInput = z.infer<typeof createGameSchema>
export type CreateCtaInput = z.infer<typeof createCtaSchema>
export type StartGamePlayInput = z.infer<typeof startGamePlaySchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
