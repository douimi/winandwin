import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../types'
import { createDb } from '../lib/db'

export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const db = createDb(c.env.DATABASE_URL)
  c.set('db', db)
  await next()
})
