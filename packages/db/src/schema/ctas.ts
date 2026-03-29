import { relations } from 'drizzle-orm'
import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { merchants } from './merchants'

export const ctaTypeEnum = pgEnum('cta_type', [
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

export const ctas = pgTable('ctas', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  merchantId: text('merchant_id')
    .notNull()
    .references(() => merchants.id, { onDelete: 'cascade' }),
  type: ctaTypeEnum('type').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  weight: integer('weight').notNull().default(1),
  config: jsonb('config').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const ctaRelations = relations(ctas, ({ one }) => ({
  merchant: one(merchants, { fields: [ctas.merchantId], references: [merchants.id] }),
}))
