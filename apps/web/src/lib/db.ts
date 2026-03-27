import { type Database } from '@winandwin/db'

let _db: Database | null = null

export function getDb(): Database {
  if (!_db) {
    const url = process.env.DATABASE_URL
    if (!url) {
      // Build time — return a proxy that throws only if actually called
      return new Proxy({} as Database, {
        get(_, prop) {
          if (prop === 'then') return undefined // not a promise
          return () => {
            throw new Error('Database not available at build time')
          }
        },
      })
    }
    // Lazy require to avoid neon() validation at import time
    const { createDb } = require('@winandwin/db') as typeof import('@winandwin/db')
    _db = createDb(url)
  }
  return _db
}
