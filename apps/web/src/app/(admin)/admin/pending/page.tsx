'use client'

import { Card, CardContent } from '@winandwin/ui'
import { AlertTriangle, CheckCircle2, Loader2, MailOpen, UserCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  activateAdminUser,
  fetchAdminUsers,
  type AdminUserRow,
} from '@/lib/admin-api'
import { useAdmin } from '../../admin-lang-context'

export default function AdminPendingPage() {
  const { txt, lang } = useAdmin()
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function loadRows() {
    setLoading(true)
    setError(false)
    fetchAdminUsers('pending')
      .then(setRows)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRows()
  }, [])

  async function handleActivate(row: AdminUserRow) {
    setActivatingId(row.id)
    setFeedback(null)
    try {
      await activateAdminUser(row.id)
      // Optimistically remove from the pending list — the row is now
      // active and doesn't belong here anymore.
      setRows((prev) => prev.filter((r) => r.id !== row.id))
      setFeedback({
        type: 'success',
        message: `${row.name || row.email} — ${txt.pendingFeedbackActivated}`,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : txt.pendingFeedbackFailed,
      })
    } finally {
      setActivatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{txt.pendingPageTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? txt.commonLoading
              : `${rows.length} ${rows.length === 1 ? txt.pendingPageCountOne : txt.pendingPageCountMany}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              <AlertTriangle className="h-3 w-3" />
              {txt.commonApiOffline}
            </span>
          )}
          <button
            type="button"
            onClick={loadRows}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {txt.commonRefresh}
          </button>
        </div>
      </div>

      {feedback && (
        <Card className={`rounded-xl ${feedback.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${feedback.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {feedback.message}
              </p>
              <button type="button" onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
                {'✕'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {txt.commonName}
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {txt.commonEmail}
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {txt.pendingColBusiness}
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {txt.pendingColSignedUp}
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {txt.commonActions ?? 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/60">
                      <td className="px-4 py-3.5"><div className="h-4 w-32 animate-pulse rounded bg-muted" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 w-40 animate-pulse rounded bg-muted" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 w-24 animate-pulse rounded bg-muted" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 w-20 animate-pulse rounded bg-muted" /></td>
                      <td className="px-4 py-3.5"><div className="ml-auto h-8 w-24 animate-pulse rounded-md bg-muted" /></td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {txt.pendingEmptyTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">{txt.pendingEmptyBody}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const created = new Date(row.createdAt)
                    const createdLabel = created.toLocaleDateString(
                      lang === 'fr' ? 'fr-FR' : 'en-US',
                      { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
                    )
                    return (
                      <tr key={row.id} className="border-b border-border/60 transition-colors hover:bg-muted/30 last:border-0">
                        <td className="px-4 py-3.5 font-medium text-foreground">
                          {row.name || <span className="italic text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <a
                            href={`mailto:${row.email}?subject=${encodeURIComponent(txt.pendingMailSubject)}`}
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <MailOpen className="h-3.5 w-3.5" />
                            {row.email}
                          </a>
                        </td>
                        <td className="px-4 py-3.5">
                          {row.merchantName ? (
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{row.merchantName}</p>
                              {row.merchantCategory && (
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                  {row.merchantCategory}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="italic text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                          {createdLabel}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleActivate(row)}
                            disabled={activatingId === row.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:opacity-50"
                          >
                            {activatingId === row.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5" />
                            )}
                            {activatingId === row.id ? txt.commonProcessing : txt.pendingActivate}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
