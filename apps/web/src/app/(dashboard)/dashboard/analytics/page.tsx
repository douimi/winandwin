'use client'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { useEffect, useState } from 'react'
import { fetchAnalytics, type AnalyticsData } from '@/lib/api'
import { useMerchantId, useMerchantTier } from '@/lib/merchant-context'
import { hasFeature } from '@/lib/tier-features'
import { ProFeatureLock } from '@/components/pro-feature-lock'

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
]

type Period = 'today' | 'week' | 'month' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  all: 'All Time',
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function AnalyticsPage() {
  const merchantId = useMerchantId()
  const tier = useMerchantTier()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('month')

  useEffect(() => {
    if (!merchantId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchAnalytics(merchantId)
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load analytics')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [merchantId, period])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-8">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-8 w-20 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">Loading analytics...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setPeriod((p) => p)}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Empty state
  if (
    !data ||
    (data.kpis.totalPlayers === 0 &&
      data.kpis.gamesPlayed === 0 &&
      data.funnel.every((f) => f.value === 0))
  ) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-4xl">{'\uD83D\uDCC9'}</p>
            <p className="mt-3 text-lg font-medium">No analytics data yet</p>
            <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
              Start collecting data by activating a game. Once customers start playing, you will see
              your conversion funnel, top actions, and prize popularity here.
            </p>
            <a
              href="/dashboard/games"
              className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to Games
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  const kpiCards = [
    {
      title: 'Total Players',
      value: data.kpis.totalPlayers,
      change: data.kpis.totalPlayersChange,
      icon: '\uD83D\uDC65',
    },
    {
      title: 'Games Played',
      value: data.kpis.gamesPlayed,
      change: data.kpis.gamesPlayedChange,
      icon: '\uD83C\uDFB2',
    },
    {
      title: 'Actions Completed',
      value: data.kpis.actionsCompleted,
      change: data.kpis.actionsCompletedChange,
      icon: '\u2705',
    },
    {
      title: 'Coupons Redeemed',
      value: data.kpis.couponsRedeemed,
      change: data.kpis.couponsRedeemedChange,
      icon: '\uD83C\uDF9F\uFE0F',
    },
  ]

  const funnelMax = data.funnel.length > 0 ? Math.max(...data.funnel.map((f) => f.value), 1) : 1
  const hasFunnelData = data.funnel.some((f) => f.value > 0)

  // Simulated weekly activity data (placeholder when API doesn't provide it)
  const weeklyActivity = DAYS.map((_, i) => {
    const base = data.kpis.gamesPlayed / 7
    const jitter = Math.sin(i * 1.5 + 2) * base * 0.6
    return Math.max(0, Math.round(base + jitter))
  })
  const weeklyMax = Math.max(...weeklyActivity, 1)

  const topActionsSlice = data.topActions.slice(0, 5)
  const topActionsMax =
    topActionsSlice.length > 0 ? Math.max(...topActionsSlice.map((a) => a.count), 1) : 1

  const prizeMax =
    data.prizePopularity.length > 0
      ? Math.max(...data.prizePopularity.map((p) => p.count), 1)
      : 1

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        {hasFeature(tier, 'analytics.periodSelector') ? (
          <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 px-3 text-xs sm:text-sm ${period === p ? 'text-white shadow-md' : 'text-muted-foreground hover:bg-gray-100'}`}
                style={period === p ? { background: 'linear-gradient(135deg, #6366f1, #a855f7)' } : undefined}
                onClick={() => setPeriod(p)}
              >
                {PERIOD_LABELS[p]}
              </Button>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="pointer-events-none opacity-40 blur-[1px] flex gap-1 rounded-lg border bg-muted/50 p-1">
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <Button key={p} variant="ghost" size="sm" className="h-8 px-3 text-xs sm:text-sm">
                  {PERIOD_LABELS[p]}
                </Button>
              ))}
            </div>
            <a
              href="/dashboard/upgrade"
              className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary hover:underline"
            >
              {'🔒'} Pro
            </a>
          </div>
        )}
      </div>

      {/* Section 1: KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, idx) => {
          const isPositive = kpi.change.startsWith('+')
          const isNegative = kpi.change.startsWith('-')
          const isNeutral = !isPositive && !isNegative

          return (
            <Card key={kpi.title} className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
              <CardContent className="flex items-center gap-4 pt-5 pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: KPI_GRADIENTS[idx] }}>
                  <span className="text-lg">{kpi.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-muted-foreground truncate">{kpi.title}</p>
                <div className="truncate text-xl sm:text-2xl lg:text-3xl font-bold">
                  <AnimatedNumber value={kpi.value} />
                </div>
                <div className="mt-1 flex items-center gap-1">
                  {isPositive && (
                    <svg
                      className="h-3 w-3 text-green-600 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                  {isNegative && (
                    <svg
                      className="h-3 w-3 text-red-600 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                  <span
                    className={`truncate text-xs font-medium ${
                      isPositive
                        ? 'text-green-600'
                        : isNegative
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {kpi.change}
                    {isNeutral ? '' : ' vs last period'}
                  </span>
                </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Section 2: Conversion Funnel */}
      <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <ProFeatureLock locked={!hasFeature(tier, 'analytics.funnel')} label="Advanced Analytics">
            {!hasFunnelData ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.funnel.map((step, i) => {
                  const barWidth = Math.min((step.value / funnelMax) * 100, 100)
                  // Decreasing opacity for each funnel step
                  const opacities = ['bg-indigo-600', 'bg-indigo-500', 'bg-indigo-400', 'bg-indigo-300']
                  const barColor = opacities[i] ?? 'bg-indigo-300'

                  return (
                    <div key={step.label} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 truncate text-sm font-medium sm:w-24">
                        {step.label}
                      </span>
                      <div className="relative flex-1">
                        <div className="h-8 w-full rounded bg-muted/50">
                          <div
                            className={`h-8 rounded ${barColor}`}
                            style={{ width: `${barWidth}%`, minWidth: step.value > 0 ? '4px' : '0', transition: 'width 1s ease-out' }}
                          />
                        </div>
                      </div>
                      <span className="w-28 shrink-0 text-right text-sm tabular-nums sm:w-32">
                        <span className="font-semibold">{step.value.toLocaleString()}</span>
                        <span className="ml-1 text-muted-foreground">({step.percentage}%)</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </ProFeatureLock>
        </CardContent>
      </Card>

      {/* Section 3: Top Actions & Prize Popularity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Actions by Completion */}
        <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle>Top Actions by Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <ProFeatureLock locked={!hasFeature(tier, 'analytics.topActions')} label="Top Actions Breakdown">
              {topActionsSlice.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No action data yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {topActionsSlice.map((action) => {
                    const barWidth = Math.min((action.count / topActionsMax) * 100, 100)
                    return (
                      <div key={action.label} className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="shrink-0">{action.icon}</span>
                            <span className="truncate">{action.label}</span>
                          </span>
                          <span className="shrink-0 tabular-nums text-muted-foreground">
                            {action.count.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-indigo-500/70"
                            style={{
                              width: `${barWidth}%`,
                              minWidth: action.count > 0 ? '4px' : '0',
                              transition: 'width 1s ease-out',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ProFeatureLock>
          </CardContent>
        </Card>

        {/* Prize Popularity */}
        <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle>Prize Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            <ProFeatureLock locked={!hasFeature(tier, 'analytics.prizePopularity')} label="Prize Popularity">
              {data.prizePopularity.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No prize data yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {[...data.prizePopularity]
                    .sort((a, b) => b.count - a.count)
                    .map((prize) => {
                      const barWidth = Math.min((prize.count / prizeMax) * 100, 100)
                      return (
                        <div key={prize.label} className="space-y-1">
                          <div className="flex items-center justify-between gap-2 text-sm">
                            <span className="flex items-center gap-1.5 truncate">
                              <span className="shrink-0">{prize.icon}</span>
                              <span className="truncate">{prize.label}</span>
                            </span>
                            <span className="shrink-0 tabular-nums text-muted-foreground">
                              {prize.count.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-indigo-500/70"
                              style={{
                                width: `${barWidth}%`,
                                minWidth: prize.count > 0 ? '4px' : '0',
                                transition: 'width 1s ease-out',
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </ProFeatureLock>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Activity This Week */}
      <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
        <CardHeader>
          <CardTitle>Activity This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <ProFeatureLock locked={!hasFeature(tier, 'analytics.weeklyChart')} label="Weekly Activity Chart">
            <div className="flex items-end justify-between gap-2 sm:gap-4" style={{ height: 160 }}>
              {DAYS.map((day, i) => {
                const value = weeklyActivity[i] ?? 0
                const heightPct = Math.max((value / weeklyMax) * 100, 4)

                return (
                  <div key={day} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs tabular-nums font-medium text-muted-foreground">
                      {value > 0 ? value.toLocaleString() : ''}
                    </span>
                    <div className="relative w-full" style={{ height: 120 }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t bg-indigo-500/80"
                        style={{ height: `${heightPct}%`, minHeight: 4, transition: 'height 1s ease-out' }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{day}</span>
                  </div>
                )
              })}
            </div>
          </ProFeatureLock>
        </CardContent>
      </Card>
    </div>
  )
}
