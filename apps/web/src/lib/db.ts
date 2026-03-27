import { createDb, type Database } from '@winandwin/db'

let _db: Database | null = null

export function getDb(): Database {
  if (!_db) {
    const url = process.env.DATABASE_URL
    if (!url) {
      // During build time, return a no-op DB that won't be used
      // (auth routes are force-dynamic so this code path only runs at build)
      return createDb('postgresql://build:build@localhost/build')
    }
    _db = createDb(url)
  }
  return _db
}
