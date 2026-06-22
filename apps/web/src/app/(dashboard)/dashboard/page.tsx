import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react'
import {
  fetchStatsOverview,
  fetchGames,
  fetchUsageStats,
  fetchMerchant,
  type StatsOverview,
  type GameWithStats,
  type UsageStats,
} from '@/lib/api'
import { requireSessionWithMerchant } from '@/lib/session'
import { AnimatedNumber, SetupProgressBar } from './dashboard-client'

export default async function DashboardPage() {
  const { merchantId } = await requireSessionWithMerchant()

  let stats: StatsOverview | null = null
  let games: GameWithStats[] = []
  let usage: UsageStats | null = null
  let apiOffline = false
  let merchantTier = 'free'

  if (merchantId) {
    try {
      const [statsData, gamesData, usageData, merchantData] = await Promise.all([
        fetchStatsOverview(merchantId).catch(() => null),
        fetchGames(merchantId).catch(() => [] as GameWithStats[]),
        fetchUsageStats(merchantId).catch(() => null),
        fetchMerchant(merchantId).catch(() => null),
      ])
      stats = statsData
      games = gamesData
      usage = usageData
      if (merchantData) merchantTier = merchantData.subscriptionTier
    } catch {
      apiOffline = true
    }
  }

  const activePlayersToday = stats?.activePlayersToday ?? 0
  const gamesPlayed = stats?.gamesPlayed ?? 0
  const actionsCompleted = stats?.actionsCompleted ?? 0
  const couponsRedeemed = stats?.couponsRedeemed ?? 0

  const hasNoGames = games.length === 0
  const hasActiveGame = games.some((g) => g.status === 'active')
  const hasPlays = gamesPlayed > 0

  // KPI cards — icon in a soft sky/slate tinted square + big tabular number + label.
  // Each gets a different accent for instant scanning, all drawn from the new
  // semantic palette so the dashboard stays calm.
  const kpis = [
    {
      title: 'Active Players Today',
      value: activePlayersToday,
      Icon: Users,
      iconClass: 'bg-sky-50 text-sky-700',
    },
    {
      title: 'Games Played',
      value: gamesPlayed,
      Icon: Gauge,
      iconClass: 'bg-violet-50 text-violet-700',
    },
    {
      title: 'Actions Completed',
      value: actionsCompleted,
      Icon: CheckCircle2,
      iconClass: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Coupons Redeemed',
      value: couponsRedeemed,
      Icon: Ticket,
      iconClass: 'bg-amber-50 text-amber-700',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        {apiOffline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            <AlertTriangle className="h-3 w-3" />
            API offline
          </span>
        )}
      </div>

      {merchantTier === 'free' && (
        <Card className="border-primary/30 bg-primary/[0.03]">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">Unlock more plays and features</p>
              <p className="text-sm text-muted-foreground">
                You&apos;re on the Free tier
                {usage?.monthlyLimit ? ` (${usage.monthlyLimit} plays/month)` : ''}. Upgrade for higher limits and advanced analytics.
              </p>
            </div>
            <a
              href="/dashboard/upgrade"
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              Upgrade
            </a>
          </CardContent>
        </Card>
      )}

      <SetupProgressBar hasGames={!hasNoGames} hasActiveGame={hasActiveGame} hasPlays={hasPlays} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.Icon
          return (
            <Card key={kpi.title} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-start gap-4 py-5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${kpi.iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {kpi.title}
                  </p>
                  <div className="mt-1 truncate text-3xl font-bold tabular-nums tracking-tight text-foreground">
                    <AnimatedNumber value={kpi.value} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Monthly usage */}
      {usage && (
        <Card
          className={
            usage.percentUsed > 90
              ? 'border-destructive/30 bg-destructive/[0.03]'
              : usage.percentUsed > 70
                ? 'border-amber-300/60 bg-amber-50/40'
                : ''
          }
        >
          <CardContent className="py-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Monthly Usage</span>
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                  {usage.tier}
                </span>
              </div>
              <span className="text-sm tabular-nums text-muted-foreground">
                {usage.playsThisMonth.toLocaleString()} /{' '}
                {usage.monthlyLimit ? usage.monthlyLimit.toLocaleString() : 'Unlimited'} plays
              </span>
            </div>
            {usage.monthlyLimit && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                    usage.percentUsed > 90
                      ? 'bg-destructive'
                      : usage.percentUsed > 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(usage.percentUsed, 100)}%` }}
                />
              </div>
            )}
            {usage.percentUsed > 70 && usage.monthlyLimit && (
              <p className="mt-2 text-xs text-muted-foreground">
                {usage.percentUsed >= 100
                  ? 'You have reached your monthly limit. '
                  : `You have used ${usage.percentUsed}% of your monthly limit. `}
                <a href="/dashboard/upgrade" className="font-medium text-primary hover:underline">
                  Upgrade your plan
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Start — only when there are no games */}
      {hasNoGames && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle>Quick Start Guide</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <QuickStartStep
                step={1}
                title="Create your first game"
                description="Set up a Wheel of Fortune, Slot Machine, or Mystery Box."
                done={false}
                href="/dashboard/games/new"
              />
              <QuickStartStep
                step={2}
                title="Activate your game"
                description="Once configured, activate it so customers can play."
                done={false}
              />
              <QuickStartStep
                step={3}
                title="Download QR code"
                description="Get your unique QR code from Settings."
                done={false}
                href="/dashboard/settings"
              />
              <QuickStartStep
                step={4}
                title="Place QR at your business"
                description="Print and place the QR code on table tents, posters, or receipts."
                done={false}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Has games but none active */}
      {!hasNoGames && !hasActiveGame && (
        <Card className="border-amber-300/60 bg-amber-50/40">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">No active game</p>
              <p className="text-sm text-muted-foreground">
                You have {games.length} game{games.length > 1 ? 's' : ''} but none are active.{' '}
                <a href="/dashboard/games" className="font-medium text-primary hover:underline">
                  Activate a game
                </a>{' '}
                to start engaging customers.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function QuickStartStep({
  step,
  title,
  description,
  done,
  href,
}: {
  step: number
  title: string
  description: string
  done: boolean
  href?: string
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          done ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary'
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : step}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-medium ${done ? 'text-muted-foreground line-through' : ''}`}>
          {href && !done ? (
            <a
              href={href}
              className="underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
