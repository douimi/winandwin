'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { useEffect, useState } from 'react'
import { fetchAnalytics, type AnalyticsData } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'

export default function AnalyticsPage() {
  const merchantId = useMerchantId()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!merchantId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
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
  }, [merchantId])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
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
            <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="text-lg">{kpi.icon}</span>
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpi.value.toLocaleString()}</div>
              <p
                className={`mt-1 text-xs ${kpi.change.startsWith('+') ? 'text-green-600' : kpi.change.startsWith('-') ? 'text-red-600' : 'text-muted-foreground'}`}
              >
                {kpi.change} vs last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.funnel.map((step) => (
              <FunnelStep
                key={step.label}
                label={step.label}
                value={step.value}
                percentage={step.percentage}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Actions & Prize Popularity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Actions by Completion</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topActions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No action data yet.
              </p>
            ) : (
              <div className="space-y-4">
                {data.topActions.map((action) => (
                  <ActionBar
                    key={action.label}
                    label={action.label}
                    icon={action.icon}
                    percentage={action.percentage}
                    count={action.count}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prize Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.prizePopularity.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No prize data yet.
              </p>
            ) : (
              <div className="space-y-4">
                {data.prizePopularity.map((prize) => (
                  <ActionBar
                    key={prize.label}
                    label={prize.label}
                    icon={prize.icon}
                    percentage={prize.percentage}
                    count={prize.count}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FunnelStep({
  label,
  value,
  percentage,
}: {
  label: string
  value: number
  percentage: number
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">
          {value.toLocaleString()} ({percentage}%)
        </span>
      </div>
      <div className="h-3 rounded-full bg-muted">
        <div
          className="h-3 rounded-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function ActionBar({
  label,
  icon,
  percentage,
  count,
}: {
  label: string
  icon: string
  percentage: number
  count: number
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span>
          {icon} {label}
        </span>
        <span className="text-muted-foreground">{count.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary/70 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
