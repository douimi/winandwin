import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { dbMiddleware } from './middleware/db'
import { playerRateLimit, merchantRateLimit, adminRateLimit } from './middleware/rate-limit'
import { securityHeaders } from './middleware/security'
import { couponsRouter } from './routes/coupons'
import { ctasRouter } from './routes/ctas'
import { gamesRouter } from './routes/games'
import { healthRouter } from './routes/health'
import { merchantsRouter } from './routes/merchants'
import { playRouter } from './routes/play'
import { playersRouter } from './routes/players'
import { statsRouter } from './routes/stats'
import { adminRouter } from './routes/admin'
import { adminAuthMiddleware } from './middleware/admin'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

// Request ID generation for traceability
app.use('*', async (c, next) => {
  const requestId = crypto.randomUUID()
  c.set('requestId', requestId)
  c.header('X-Request-Id', requestId)
  await next()
})

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', securityHeaders)

// CORS — environment-aware
app.use(
  '*',
  async (c, next) => {
    // Always include localhost for dev + any configured origins for production
    const configuredOrigins = (c.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean)
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      ...configuredOrigins,
    ]

    const corsMiddleware = cors({
      origin: allowedOrigins,
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
      credentials: true,
    })

    return corsMiddleware(c, next)
  },
)

// DB middleware for all API routes
app.use('/api/*', dbMiddleware)

// Rate limiting per route category
app.use('/api/v1/play/*', playerRateLimit)
app.use('/api/v1/merchants/*', merchantRateLimit)
app.use('/api/v1/games/*', merchantRateLimit)
app.use('/api/v1/coupons/*', merchantRateLimit)
app.use('/api/v1/ctas/*', merchantRateLimit)
app.use('/api/v1/players/*', merchantRateLimit)
app.use('/api/v1/stats/*', merchantRateLimit)
app.use('/api/v1/admin/*', adminRateLimit)

// Routes
app.route('/health', healthRouter)
app.route('/api/v1/merchants', merchantsRouter)
app.route('/api/v1/games', gamesRouter)
app.route('/api/v1/play', playRouter)
app.route('/api/v1/coupons', couponsRouter)
app.route('/api/v1/ctas', ctasRouter)
app.route('/api/v1/players', playersRouter)
app.route('/api/v1/stats', statsRouter)
app.use('/api/v1/admin/*', adminAuthMiddleware)
app.route('/api/v1/admin', adminRouter)

// 404
app.notFound((c) => {
  return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404)
})

// Global error handler — production-safe
app.onError((err, c) => {
  const requestId = c.get('requestId')
  const isProduction = c.env.ENVIRONMENT === 'production'

  // Always log the full error for debugging
  console.error(`[${requestId}] Unhandled error:`, err.message, err.stack)

  // In production, never expose internal details
  if (isProduction) {
    return c.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again later.',
          requestId,
        },
      },
      500,
    )
  }

  // In development, include the error message (but not the full stack)
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'An unexpected error occurred',
        requestId,
      },
    },
    500,
  )
})

export default app
