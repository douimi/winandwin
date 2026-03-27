import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { merchants } from './merchants'

export const couponStatusEnum = pgEnum('coupon_status', [
  'active',
  'redeemed',
  'expired',
  'revoked',
])

export const coupons = pgTable('coupons', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  merchantId: text('merchant_id')
    .notNull()
    .references(() => merchants.id, { onDelete: 'cascade' }),
  gameId: text('game_id').notNull(),
  prizeId: text('prize_id').notNull(),
  playerId: text('player_id').notNull(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  status: couponStatusEnum('status').notNull().default('active'),
  prizeName: varchar('prize_name', { length: 100 }).notNull(),
  prizeDescription: varchar('prize_description', { length: 500 }),
  validFrom: timestamp('valid_from', { withTimezone: true }).notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),
  redeemedAt: timestamp('redeemed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const couponRelations = relations(coupons, ({ one }) => ({
  merchant: one(merchants, { fields: [coupons.merchantId], references: [merchants.id] }),
}))
