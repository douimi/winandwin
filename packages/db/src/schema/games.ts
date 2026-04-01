import { relations } from 'drizzle-orm'
import { jsonb, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { gamePlays } from './game-plays'
import { merchants } from './merchants'
import { prizes } from './prizes'

export const gameTypeEnum = pgEnum('game_type', ['wheel', 'slots', 'mystery_box'])

export const gameStatusEnum = pgEnum('game_status', ['draft', 'active', 'paused', 'ended'])

export const games = pgTable('games', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  merchantId: text('merchant_id')
    .notNull()
    .references(() => merchants.id, { onDelete: 'cascade' }),
  type: gameTypeEnum('type').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  status: gameStatusEnum('status').notNull().default('draft'),
  scheduling: jsonb('scheduling')
    .$type<{
      startDate?: string
      endDate?: string
      activeDays: number[]
      activeHoursStart?: string
      activeHoursEnd?: string
    }>()
    .notNull()
    .default({ activeDays: [0, 1, 2, 3, 4, 5, 6] }),
  frequencyLimit: jsonb('frequency_limit')
    .$type<{
      maxPlaysPerDay: number
      maxPlaysPerWeek?: number
      cooldownMinutes?: number
    }>()
    .notNull()
    .default({ maxPlaysPerDay: 1 }),
  branding: jsonb('branding')
    .$type<{
      primaryColor: string
      secondaryColor: string
      logoUrl?: string
      backgroundUrl?: string
    }>()
    .notNull()
    .default({ primaryColor: '#6366f1', secondaryColor: '#ec4899' }),
  globalWinRate: text('global_win_rate').notNull().default('30'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const gameRelations = relations(games, ({ one, many }) => ({
  merchant: one(merchants, { fields: [games.merchantId], references: [merchants.id] }),
  prizes: many(prizes),
  plays: many(gamePlays),
}))
