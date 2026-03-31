import { relations } from 'drizzle-orm'
import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { gamePlays } from './game-plays'
import { merchants } from './merchants'

export const players = pgTable('players', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  merchantId: text('merchant_id')
    .notNull()
    .references(() => merchants.id, { onDelete: 'cascade' }),
  fingerprintId: text('fingerprint_id').notNull(),
  hardwareId: text('hardware_id'),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  totalPlays: integer('total_plays').notNull().default(0),
  totalWins: integer('total_wins').notNull().default(0),
  points: integer('points').notNull().default(0),
  suspiciousScore: integer('suspicious_score').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
})

export const playerRelations = relations(players, ({ one, many }) => ({
  merchant: one(merchants, { fields: [players.merchantId], references: [merchants.id] }),
  plays: many(gamePlays),
}))
