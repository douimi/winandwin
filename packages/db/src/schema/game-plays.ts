import { relations } from 'drizzle-orm'
import { jsonb, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { games } from './games'
import { players } from './players'

export const playResultEnum = pgEnum('play_result', ['win', 'lose'])

export const gamePlays = pgTable('game_plays', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  gameId: text('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  merchantId: text('merchant_id').notNull(),
  playerId: text('player_id')
    .notNull()
    .references(() => players.id, { onDelete: 'cascade' }),
  result: playResultEnum('result').notNull(),
  prizeId: text('prize_id'),
  couponId: text('coupon_id'),
  completedActions: jsonb('completed_actions').$type<string[]>().notNull().default([]),
  playedAt: timestamp('played_at', { withTimezone: true }).notNull().defaultNow(),
})

export const gamePlayRelations = relations(gamePlays, ({ one }) => ({
  game: one(games, { fields: [gamePlays.gameId], references: [games.id] }),
  player: one(players, { fields: [gamePlays.playerId], references: [players.id] }),
}))
