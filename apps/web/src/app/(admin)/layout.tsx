import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { users } from '@winandwin/db'
import { getSession } from '@/lib/session'
import { getDb } from '@/lib/db'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect('/sign-in')
  }

  // Check if user is admin
  const db = getDb()
  const userRow = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, session.user.id))
    .then((rows) => rows[0])

  if (!userRow?.isAdmin) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
