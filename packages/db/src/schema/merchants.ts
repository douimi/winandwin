import { relations } from 'drizzle-orm'
import { jsonb, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { coupons } from './coupons'
import { ctas } from './ctas'
import { games } from './games'
import { players } from './players'

export const merchantCategoryEnum = pgEnum('merchant_category', [
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

export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'free',
  'starter',
  'pro',
  'enterprise',
])

export const merchants = pgTable('merchants', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  category: merchantCategoryEnum('category').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  logoUrl: text('logo_url'),
  address: jsonb('address')
    .notNull()
    .$type<{
      street: string
      city: string
      postalCode: string
      country: string
      latitude?: number
      longitude?: number
    }>(),
  timezone: varchar('timezone', { length: 50 }).notNull().default('Europe/Paris'),
  subscriptionTier: subscriptionTierEnum('subscription_tier').notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  primaryColor: varchar('primary_color', { length: 7 }).default('#6366f1'),
  secondaryColor: varchar('secondary_color', { length: 7 }).default('#ec4899'),
  backgroundUrl: text('background_url'),
  description: text('description'),
  validationPin: varchar('validation_pin', { length: 6 }).notNull().default('0000'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const merchantRelations = relations(merchants, ({ many }) => ({
  games: many(games),
  ctas: many(ctas),
  coupons: many(coupons),
  players: many(players),
}))
