'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import {
  AlertTriangle,
  Ban,
  Calendar,
  Gauge,
  Store,
  Ticket,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'
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

interface ContactRequest {
  id: string
  business_name: string
  contact_name: string
  email: string
  status: string
  created_at: string
  business_type: string | null
}

interface KpiDef {
  key: keyof AdminStats
  label: string
  Icon: LucideIcon
  iconClass: string
}

// Soft tonal squares per KPI, in the same vocabulary as the merchant
// dashboard root. No gradients, no inline clamp() — uses tokens only.
const kpiConfig: KpiDef[] = [
  { key: 'totalMerchants', label: 'Merchants', Icon: Store, iconClass: 'bg-sky-50 text-sky-700' },
  { key: 'totalPlayers', label: 'Players', Icon: Users, iconClass: 'bg-violet-50 text-violet-700' },
  { key: 'gamesPlayedToday', label: 'Games Today', Icon: Gauge, iconClass: 'bg-emerald-50 text-emerald-700' },
  { key: 'totalCouponsRedeemed', label: 'Coupons', Icon: Ticket, iconClass: 'bg-amber-50 text-amber-700' },
  { key: 'gamesPlayedThisMonth', label: 'Games This Month', Icon: Calendar, iconClass: 'bg-blue-50 text-blue-700' },
  { key: 'newMerchantsThisWeek', label: 'New This Week', Icon: TrendingUp, iconClass: 'bg-rose-50 text-rose-700' },
  { key: 'disabledMerchants', label: 'Disabled', Icon: Ban, iconClass: 'bg-slate-100 text-slate-600' },
]

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  contacted: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  converted: 'bg-primary/10 text-primary ring-1 ring-primary/20',
  rejected: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
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
    setDateStr(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    )
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              <AlertTriangle className="h-3 w-3" />
              API offline
            </span>
          )}
          <button
            type="button"
            onClick={loadData}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiConfig.map((kpi) => {
          const Icon = kpi.Icon
          return (
            <Card key={kpi.key} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-start gap-4 py-5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${kpi.iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {kpi.label}
                  </p>
                  {loading ? (
                    <div className="mt-2 h-8 w-24 animate-pulse rounded bg-muted" />
                  ) : (
                    <div className="mt-1 truncate text-3xl font-bold tabular-nums tracking-tight text-foreground">
                      <AnimatedNumber value={Number(stats?.[kpi.key] ?? 0)} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Two-column section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Merchants */}
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Top Merchants</CardTitle>
              <a
                href="/admin/merchants"
                className="text-xs font-medium text-primary transition-colors hover:underline"
              >
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
                      <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : stats?.topMerchants && stats.topMerchants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">Rank</th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">Name</th>
                      <th className="pb-3 text-right font-medium text-muted-foreground">Plays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topMerchants.map((m, i) => (
                      <tr key={m.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30">
                        <td className="py-3 pr-4">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <a
                            href={`/admin/merchants/${m.id}`}
                            className="font-medium text-foreground transition-colors hover:text-primary"
                          >
                            {m.name}
                          </a>
                        </td>
                        <td className="py-3 text-right font-semibold tabular-nums">
                          {m.plays.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No merchant activity recorded yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Contacts */}
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Contacts</CardTitle>
              <a
                href="/admin/contacts"
                className="text-xs font-medium text-primary transition-colors hover:underline"
              >
                View all
              </a>
            </div>
          </CardHeader>
          <CardContent>
            {contacts.length > 0 ? (
              <div className="space-y-2">
                {contacts.map((c) => {
                  const statusClass = STATUS_STYLES[c.status] ?? STATUS_STYLES['new']!
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:bg-muted/30"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{c.business_name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.contact_name} &middot; {c.email}
                        </p>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusClass}`}
                        >
                          {c.status}
                        </span>
                        <span className="whitespace-nowrap text-[10px] text-muted-foreground/70">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No contact requests yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Merchant</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Result</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivity.map((a) => (
                    <tr key={a.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30">
                      <td className="py-2.5 pr-4">
                        <a
                          href={`/admin/merchants/${a.merchantId}`}
                          className="font-medium text-foreground transition-colors hover:text-primary"
                        >
                          {a.merchantName}
                        </a>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            a.result === 'win'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                          }`}
                        >
                          {a.result}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-xs text-muted-foreground">
                        {new Date(a.playedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
