import { type Database } from '@winandwin/db'

let _db: Database | null = null

// Use dynamic key access to prevent webpack from replacing process.env.DATABASE_URL
// with undefined at compile time
const ENV_KEY = 'DATABASE_URL'

export function getDb(): Database {
  if (!_db) {
    const url = process.env[ENV_KEY]
    if (!url) {
      // Build time — return a proxy that throws only if actually called
      return new Proxy({} as Database, {
        get(_, prop) {
          if (prop === 'then') return undefined
          return () => {
            throw new Error('Database not available at build time')
          }
        },
      })
    }
    const { createDb } = require('@winandwin/db') as typeof import('@winandwin/db')
    _db = createDb(url)
  }
  return _db
}
