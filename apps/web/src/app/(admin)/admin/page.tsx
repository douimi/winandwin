'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { fetchAdminStats, type AdminStats } from '@/lib/admin-api'

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setDisplay(Math.floor(progress * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, duration])
  return <>{display.toLocaleString()}</>
}

const KPI_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #a855f7)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
  'linear-gradient(135deg, #10b981, #14b8a6)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #3b82f6, #6366f1)',
  'linear-gradient(135deg, #8b5cf6, #d946ef)',
  'linear-gradient(135deg, #ef4444, #f97316)',
]

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
  { key: 'totalMerchants' as const, label: 'Merchants', icon: '\uD83C\uDFEA' },
  { key: 'totalPlayers' as const, label: 'Players', icon: '\uD83D\uDC65' },
  { key: 'gamesPlayedToday' as const, label: 'Games Today', icon: '\uD83C\uDFAE' },
  { key: 'totalCouponsRedeemed' as const, label: 'Coupons', icon: '\uD83C\uDF9F\uFE0F' },
  { key: 'gamesPlayedThisMonth' as const, label: 'Games This Month', icon: '\u25B6\uFE0F' },
  { key: 'newMerchantsThisWeek' as const, label: 'New This Week', icon: '\uD83D\uDCC8' },
  { key: 'disabledMerchants' as const, label: 'Disabled', icon: '\uD83D\uDEAB' },
]

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  contacted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  converted: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  rejected: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
}

const TIER_STYLES: Record<string, string> = {
  free: 'border-gray-300 text-gray-600 bg-white',
  starter: 'border-blue-300 text-blue-700 bg-white',
  pro: 'border-indigo-300 text-indigo-700 bg-white',
  enterprise: 'border-amber-300 text-amber-700 bg-white',
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  function loadData() {
    setLoading(true)
    setError(false)
    fetchAdminStats()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    fetch('/api/contact/list')
      .then((res) => res.json())
      .then((data) => {
        const all = data.contacts ?? []
        setContacts(all.slice(0, 5))
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadData()
  }, [])

  const [dateStr, setDateStr] = useState('')
  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
  }, [])

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="mt-1 text-sm text-gray-500">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="rounded-full border border-yellow-300 bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
              API offline
            </span>
          )}
          <button
            type="button"
            onClick={loadData}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiConfig.map((kpi, idx) => (
          <Card key={kpi.key} className="border border-gray-200 bg-white shadow-sm rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: KPI_GRADIENTS[idx] }}>
                  <span className="text-lg">{kpi.icon}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                  {loading ? (
                    <div className="h-9 w-24 animate-pulse rounded bg-gray-100" />
                  ) : (
                    <p className="text-3xl font-bold text-indigo-600">
                      <AnimatedNumber value={stats?.[kpi.key] ?? 0} />
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Three-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Merchants Table */}
        <Card className="border border-gray-200 bg-white shadow-sm rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Top Merchants</CardTitle>
              <a href="/admin/merchants" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
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
                      <div className="h-7 w-7 animate-pulse rounded-full bg-gray-100" />
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                    </div>
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : stats?.topMerchants && stats.topMerchants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 pr-4 font-medium text-gray-500">Rank</th>
                      <th className="pb-3 pr-4 font-medium text-gray-500">Name</th>
                      <th className="pb-3 text-right font-medium text-gray-500">Plays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topMerchants.map((m, i) => (
                      <tr key={m.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}>
                        <td className="py-3 pr-4">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <a
                            href={`/admin/merchants/${m.id}`}
                            className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                          >
                            {m.name}
                          </a>
                        </td>
                        <td className="py-3 text-right font-semibold text-gray-700">
                          {m.plays.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No merchant activity recorded yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Contacts */}
        <Card className="border border-gray-200 bg-white shadow-sm rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Recent Contacts</CardTitle>
              <a href="/admin/contacts" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                View all
              </a>
            </div>
          </CardHeader>
          <CardContent>
            {contacts.length > 0 ? (
              <div className="space-y-3">
                {contacts.map((c) => {
                  const statusStyle = STATUS_STYLES[c.status] ?? STATUS_STYLES['new']!
                  return (
                    <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5 transition-colors hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{c.business_name}</p>
                        <p className="truncate text-xs text-gray-500">
                          {c.contact_name} &middot; {c.email}
                        </p>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {c.status}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No contact requests yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Log */}
      <Card className="border border-gray-200 bg-white shadow-sm rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 pr-4 font-medium text-gray-500">Merchant</th>
                    <th className="pb-3 pr-4 font-medium text-gray-500">Result</th>
                    <th className="pb-3 text-right font-medium text-gray-500">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivity.map((a, i) => (
                    <tr key={a.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50" style={{ animation: 'fadeSlideIn 0.4s ease-out both', animationDelay: `${i * 0.1}s` }}>
                      <td className="py-2.5 pr-4">
                        <a
                          href={`/admin/merchants/${a.merchantId}`}
                          className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                        >
                          {a.merchantName}
                        </a>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          a.result === 'win'
                            ? 'border-green-300 text-green-600 bg-green-50'
                            : 'border-gray-200 text-gray-500 bg-gray-50'
                        }`}>
                          {a.result}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-xs text-gray-400">
                        {new Date(a.playedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
