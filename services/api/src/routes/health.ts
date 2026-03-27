import { Hono } from 'hono'
import { createDb } from '../lib/db'
import type { AppEnv } from '../types.js'
import { sql } from 'drizzle-orm'

export const healthRouter = new Hono<AppEnv>()

// Basic liveness check — always returns ok if the worker is running
healthRouter.get('/', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  })
})

// Readiness check — verifies DB connectivity
healthRouter.get('/ready', async (c) => {
  const timestamp = new Date().toISOString()

  try {
    const db = createDb(c.env.DATABASE_URL)
    const start = Date.now()
    await db.execute(sql`SELECT 1`)
    const dbLatencyMs = Date.now() - start

    return c.json({
      status: 'ok',
      timestamp,
      environment: c.env.ENVIRONMENT,
      checks: {
        database: { status: 'ok', latencyMs: dbLatencyMs },
      },
    })
  } catch (err) {
    console.error('Health check failed — DB unreachable:', err)
    return c.json(
      {
        status: 'degraded',
        timestamp,
        environment: c.env.ENVIRONMENT,
        checks: {
          database: {
            status: 'error',
            message: 'Database connection failed',
          },
        },
      },
      503,
    )
  }
})
