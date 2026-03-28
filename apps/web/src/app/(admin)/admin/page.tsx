'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { fetchAdminStats, type AdminStats } from '@/lib/admin-api'

const kpiConfig = [
  { key: 'totalMerchants' as const, label: 'Total Merchants', icon: '\uD83C\uDFEA', bg: 'bg-blue-500/10', color: 'text-blue-400' },
  { key: 'totalPlayers' as const, label: 'Total Players', icon: '\uD83D\uDC65', bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
  { key: 'gamesPlayedToday' as const, label: 'Games Played Today', icon: '\uD83C\uDFAE', bg: 'bg-purple-500/10', color: 'text-purple-400' },
  { key: 'totalCouponsRedeemed' as const, label: 'Coupons Redeemed', icon: '\uD83C\uDF9F\uFE0F', bg: 'bg-amber-500/10', color: 'text-amber-400' },
  { key: 'gamesPlayedThisMonth' as const, label: 'Active Games', icon: '\u25B6\uFE0F', bg: 'bg-rose-500/10', color: 'text-rose-400' },
  { key: 'newMerchantsThisWeek' as const, label: 'New This Week', icon: '\uD83D\uDCC8', bg: 'bg-indigo-500/10', color: 'text-indigo-400' },
]

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-100">Platform Overview</h1>
        {error && (
          <span className="rounded-full bg-yellow-900/50 px-2.5 py-0.5 text-xs font-medium text-yellow-300">
            API offline
          </span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiConfig.map((kpi) => (
          <Card key={kpi.key} className="border-slate-800 bg-slate-900">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-400">{kpi.label}</p>
                  {loading ? (
                    <div className="h-9 w-24 animate-pulse rounded bg-slate-800" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-50">
                      {(stats?.[kpi.key] ?? 0).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bg}`}>
                  <span className={`text-lg ${kpi.color}`}>{kpi.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Merchants Table */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-100">Top Merchants</CardTitle>
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
                    <th className="pb-3 text-right font-medium text-slate-400">Plays This Month</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topMerchants.map((m, i) => (
                    <tr key={m.id} className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/30">
                      <td className="py-3 pr-4">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-bold text-indigo-300">
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
    </div>
  )
}
