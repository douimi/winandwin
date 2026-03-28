'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { fetchAdminStats, type AdminStats } from '@/lib/admin-api'

interface ContactRequest {
  id: string
  business_name: string
  contact_name: string
  email: string
  status: string
  created_at: string
  business_type: string | null
}

const kpiConfig = [
  { key: 'totalMerchants' as const, label: 'Total Merchants', icon: '\uD83C\uDFEA', gradient: 'from-indigo-600 to-indigo-500' },
  { key: 'totalPlayers' as const, label: 'Total Players', icon: '\uD83D\uDC65', gradient: 'from-purple-600 to-purple-500' },
  { key: 'gamesPlayedToday' as const, label: 'Games Played Today', icon: '\uD83C\uDFAE', gradient: 'from-pink-600 to-pink-500' },
  { key: 'totalCouponsRedeemed' as const, label: 'Coupons Redeemed', icon: '\uD83C\uDF9F\uFE0F', gradient: 'from-amber-600 to-amber-500' },
  { key: 'gamesPlayedThisMonth' as const, label: 'Active Games', icon: '\u25B6\uFE0F', gradient: 'from-emerald-600 to-emerald-500' },
  { key: 'newMerchantsThisWeek' as const, label: 'New This Week', icon: '\uD83D\uDCC8', gradient: 'from-blue-600 to-blue-500' },
]

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-emerald-900/30', text: 'text-emerald-400' },
  contacted: { bg: 'bg-blue-900/30', text: 'text-blue-400' },
  converted: { bg: 'bg-purple-900/30', text: 'text-purple-400' },
  rejected: { bg: 'bg-slate-800', text: 'text-slate-400' },
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    // Load recent contacts
    fetch('/api/contact/list')
      .then((res) => res.json())
      .then((data) => {
        const all = data.contacts ?? []
        setContacts(all.slice(0, 5))
      })
      .catch(() => {
        // Non-critical
      })
  }, [])

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Platform Overview</h1>
          <p className="mt-1 text-sm text-slate-500">{dateStr}</p>
        </div>
        {error && (
          <span className="rounded-full bg-yellow-900/50 px-2.5 py-0.5 text-xs font-medium text-yellow-300">
            API offline
          </span>
        )}
      </div>

      {/* KPI Cards with gradients */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiConfig.map((kpi) => (
          <div
            key={kpi.key}
            className={`rounded-2xl bg-gradient-to-br ${kpi.gradient} p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-white/70">{kpi.label}</p>
                {loading ? (
                  <div className="h-9 w-24 animate-pulse rounded bg-white/20" />
                ) : (
                  <p className="text-3xl font-bold text-white">
                    {(stats?.[kpi.key] ?? 0).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <span className="text-2xl">{kpi.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout: Top Merchants + Recent Contacts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Merchants Table */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-100">Top Merchants</CardTitle>
              <a href="/admin/merchants" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                View all
              </a>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 animate-pulse rounded-full bg-slate-800" />
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
                    </div>
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : stats?.topMerchants && stats.topMerchants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left">
                      <th className="pb-3 pr-4 font-medium text-slate-400">Rank</th>
                      <th className="pb-3 pr-4 font-medium text-slate-400">Name</th>
                      <th className="pb-3 text-right font-medium text-slate-400">Plays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topMerchants.map((m, i) => (
                      <tr key={m.id} className={`border-b border-slate-800/50 transition-colors hover:bg-slate-800/30 ${i % 2 === 1 ? 'bg-slate-800/10' : ''}`}>
                        <td className="py-3 pr-4">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-sm font-bold text-indigo-300">
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <a
                            href={`/admin/merchants/${m.id}`}
                            className="font-medium text-slate-200 hover:text-indigo-300 transition-colors"
                          >
                            {m.name}
                          </a>
                        </td>
                        <td className="py-3 text-right font-semibold text-slate-300">
                          {m.plays.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No merchant activity recorded yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Contacts */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-100">Recent Contacts</CardTitle>
              <a href="/admin/contacts" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                View all
              </a>
            </div>
          </CardHeader>
          <CardContent>
            {contacts.length > 0 ? (
              <div className="space-y-3">
                {contacts.map((c) => {
                  const statusStyle = (STATUS_STYLES[c.status] ?? STATUS_STYLES['new'])!
                  return (
                    <div key={c.id} className="flex items-center justify-between rounded-lg bg-slate-800/30 px-3 py-2.5 transition-colors hover:bg-slate-800/50">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">{c.business_name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {c.contact_name} &middot; {c.email}
                        </p>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusStyle.bg} ${statusStyle.text}`}>
                          {c.status}
                        </span>
                        <span className="text-[10px] text-slate-600 whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No contact requests yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
