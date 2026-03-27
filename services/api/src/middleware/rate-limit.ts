import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../types'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store with TTL cleanup (per-isolate in Cloudflare Workers)
const store = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
let lastCleanup = Date.now()
function cleanupStore() {
  const now = Date.now()
  // Run cleanup at most every 60 seconds
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}

function checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
  cleanupStore()

  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }

  entry.count++
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}

function getClientIP(c: { req: { header: (name: string) => string | undefined } }): string {
  return (
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown'
  )
}

const ONE_MINUTE = 60_000

/**
 * Rate limiting for player-facing routes: 30 requests/min per IP
 */
export const playerRateLimit = createMiddleware<AppEnv>(async (c, next) => {
  const ip = getClientIP(c)
  const key = `player:${ip}`
  const { allowed, remaining, resetAt } = checkRateLimit(key, 30, ONE_MINUTE)

  c.header('X-RateLimit-Limit', '30')
  c.header('X-RateLimit-Remaining', String(remaining))
  c.header('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)))

  if (!allowed) {
    return c.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please wait a moment before trying again.',
        },
      },
      429,
    )
  }

  await next()
})

/**
 * Rate limiting for merchant API routes: 60 requests/min per IP
 */
export const merchantRateLimit = createMiddleware<AppEnv>(async (c, next) => {
  const ip = getClientIP(c)
  const key = `merchant:${ip}`
  const { allowed, remaining, resetAt } = checkRateLimit(key, 60, ONE_MINUTE)

  c.header('X-RateLimit-Limit', '60')
  c.header('X-RateLimit-Remaining', String(remaining))
  c.header('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)))

  if (!allowed) {
    return c.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please slow down and try again shortly.',
        },
      },
      429,
    )
  }

  await next()
})

/**
 * Rate limiting for admin routes: 120 requests/min per IP
 */
export const adminRateLimit = createMiddleware<AppEnv>(async (c, next) => {
  const ip = getClientIP(c)
  const key = `admin:${ip}`
  const { allowed, remaining, resetAt } = checkRateLimit(key, 120, ONE_MINUTE)

  c.header('X-RateLimit-Limit', '120')
  c.header('X-RateLimit-Remaining', String(remaining))
  c.header('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)))

  if (!allowed) {
    return c.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please slow down and try again shortly.',
        },
      },
      429,
    )
  }

  await next()
})
