import { requireSession } from '@/lib/session'
import { AdminLangProvider } from '../admin-lang-context'
import { AdminShell } from '../admin-shell'

export default async function AdminPagesLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()

  return (
    <AdminLangProvider>
      <AdminShell user={session.user}>
        {children}
      </AdminShell>
    </AdminLangProvider>
  )
}
