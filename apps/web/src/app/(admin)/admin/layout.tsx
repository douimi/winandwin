import { requireSession } from '@/lib/session'
import { AdminShell } from '../admin-shell'

export default async function AdminPagesLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()

  return (
    <AdminShell user={session.user}>
      {children}
    </AdminShell>
  )
}
