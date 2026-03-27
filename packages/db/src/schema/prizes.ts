import { relations } from 'drizzle-orm'
import { integer, pgTable, real, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { games } from './games'

export const prizes = pgTable('prizes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  gameId: text('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }),
  emoji: varchar('emoji', { length: 10 }),
  winRate: real('win_rate').notNull(),
  maxTotal: integer('max_total'),
  maxPerDay: integer('max_per_day'),
  totalWon: integer('total_won').notNull().default(0),
  couponValidityDays: integer('coupon_validity_days').notNull().default(7),
  couponActivationDelayHours: integer('coupon_activation_delay_hours').notNull().default(24),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const prizeRelations = relations(prizes, ({ one }) => ({
  game: one(games, { fields: [prizes.gameId], references: [games.id] }),
}))
