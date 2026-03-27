import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../types'

/**
 * Security headers middleware.
 * Applied to all responses to harden the API against common web vulnerabilities.
 */
export const securityHeaders = createMiddleware<AppEnv>(async (c, next) => {
  await next()

  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
})
