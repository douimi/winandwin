import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = getDb()
    const rows = await db.execute(
      sql`SELECT id, business_name, contact_name, email, phone, business_type, message, status, created_at
          FROM contact_requests
          ORDER BY created_at DESC
          LIMIT 200`
    )

    // neon-http execute returns NeonHttpQueryResult which is the rows array
    const results = Array.isArray(rows) ? rows : (rows as { rows?: unknown[] }).rows ?? []
    return NextResponse.json({ contacts: results })
  } catch (err) {
    console.error('Failed to fetch contacts:', err)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}
