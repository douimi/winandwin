import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { fetchStatsOverview, fetchGames, fetchUsageStats, type StatsOverview, type GameWithStats, type UsageStats } from '@/lib/api'
import { requireSessionWithMerchant } from '@/lib/session'

export default async function DashboardPage() {
  const { merchantId } = await requireSessionWithMerchant()

  let stats: StatsOverview | null = null
  let games: GameWithStats[] = []
  let usage: UsageStats | null = null
  let apiOffline = false

  if (merchantId) {
    try {
      const [statsData, gamesData, usageData] = await Promise.all([
        fetchStatsOverview(merchantId).catch(() => null),
        fetchGames(merchantId).catch(() => [] as GameWithStats[]),
        fetchUsageStats(merchantId).catch(() => null),
      ])
      stats = statsData
      games = gamesData
      usage = usageData
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

  const kpis = [
    {
      title: 'Active Players Today',
      value: activePlayersToday,
      icon: '\uD83D\uDC65',
    },
    {
      title: 'Games Played',
      value: gamesPlayed,
      icon: '\uD83C\uDFB2',
    },
    {
      title: 'Actions Completed',
      value: actionsCompleted,
      icon: '\u2705',
    },
    {
      title: 'Coupons Redeemed',
      value: couponsRedeemed,
      icon: '\uD83C\uDF9F\uFE0F',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Overview</h1>
        {apiOffline && (
          <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            API offline
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="text-lg">{kpi.icon}</span>
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpi.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage bar */}
      {usage && (
        <Card className={
          usage.percentUsed > 90
            ? 'border-red-300 bg-red-50'
            : usage.percentUsed > 70
              ? 'border-yellow-300 bg-yellow-50'
              : ''
        }>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Monthly Usage</span>
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                  {usage.tier}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {usage.playsThisMonth.toLocaleString()} / {usage.monthlyLimit ? usage.monthlyLimit.toLocaleString() : 'Unlimited'} plays
              </span>
            </div>
            {usage.monthlyLimit && (
              <div className="h-2.5 w-full rounded-full bg-muted">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    usage.percentUsed > 90
                      ? 'bg-red-500'
                      : usage.percentUsed > 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
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
                <a href="/dashboard/settings" className="font-medium text-primary underline">
                  Upgrade your plan
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Start guide — only shown when no games exist */}
      {hasNoGames && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {'\uD83D\uDE80'} Quick Start Guide
            </CardTitle>
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

      {/* If they have games but none active, nudge them */}
      {!hasNoGames && !hasActiveGame && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="flex items-center gap-3 py-4">
            <span className="text-2xl">{'\u26A0\uFE0F'}</span>
            <div>
              <p className="font-medium text-yellow-900">No active game</p>
              <p className="text-sm text-yellow-800">
                You have {games.length} game{games.length > 1 ? 's' : ''} but none are active.{' '}
                <a href="/dashboard/games" className="underline font-medium">
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
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          done
            ? 'bg-green-500 text-white'
            : 'bg-primary/10 text-primary'
        }`}
      >
        {done ? '\u2713' : step}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-medium ${done ? 'line-through text-muted-foreground' : ''}`}>
          {href && !done ? (
            <a href={href} className="underline decoration-primary/30 hover:decoration-primary">
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
