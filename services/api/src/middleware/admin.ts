import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../types'

export const adminAuthMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const adminKey = c.req.header('x-admin-key')
  const expectedKey = c.env.ADMIN_API_KEY

  if (!expectedKey) {
    return c.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Admin API key not configured' } },
      500,
    )
  }

  if (!adminKey || adminKey !== expectedKey) {
    return c.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Invalid admin API key' } },
      403,
    )
  }

  await next()
})
