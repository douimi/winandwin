import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

const VALID_STATUSES = ['new', 'contacted', 'converted', 'rejected'] as const

export async function PATCH(request: NextRequest) {
  let body: { id: string; status: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.id || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  if (!body.status || !(VALID_STATUSES as readonly string[]).includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  try {
    const db = getDb()
    await db.execute(
      sql`UPDATE contact_requests SET status = ${body.status} WHERE id = ${body.id}`
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to update contact status:', err)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
