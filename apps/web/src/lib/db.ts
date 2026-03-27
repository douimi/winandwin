import { createDb, type Database } from '@winandwin/db'

let _db: Database | null = null

export function getDb(): Database {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    _db = createDb(process.env.DATABASE_URL)
  }
  return _db
}
