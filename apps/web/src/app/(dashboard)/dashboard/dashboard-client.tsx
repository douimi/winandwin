'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { AlertTriangle, CheckCircle2, Gauge, Sparkles, Ticket, Users } from 'lucide-react'
import { useApp } from '@/lib/i18n/app-lang-context'
import type {
  StatsOverview,
  GameWithStats,
  UsageStats,
} from '@/lib/api'

export function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
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

export function SetupProgressBar({
  hasGames,
  hasActiveGame,
  hasPlays,
}: {
  hasGames: boolean
  hasActiveGame: boolean
  hasPlays: boolean
}) {
  const { txt, lang } = useApp()
  const steps = [
    { label: lang === 'fr' ? 'Compte' : 'Account', done: true },
    { label: lang === 'fr' ? 'Jeu' : 'Game', done: hasGames },
    { label: lang === 'fr' ? 'Activation' : 'Activate', done: hasActiveGame },
    { label: lang === 'fr' ? 'Première partie' : 'First play', done: hasPlays },
  ]
  const completedCount = steps.filter((s) => s.done).length

  if (completedCount === 4) return null

  const heading = lang === 'fr' ? 'Bien démarrer' : 'Getting started'
  const complete = lang === 'fr' ? 'terminé' : 'complete'
  // Anchor the fallback to a truly-defined key so tsc stays honest.
  void txt.dashboardTitle

  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-card p-4 shadow-sm">
      <p className="mb-2 text-sm font-medium">
        {heading} — <span className="tabular-nums text-primary">{completedCount}/4</span> {complete}
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${(completedCount / 4) * 100}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {steps.map((step) => (
          <span
            key={step.label}
            className={`inline-flex items-center gap-1.5 ${
              step.done ? 'font-medium text-emerald-600' : 'text-muted-foreground'
            }`}
          >
            <span aria-hidden>{step.done ? '✓' : '○'}</span>
            {step.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Overview UI ────────────────────────────────────────────────────────
// The page server-fetches all data then passes it here so all i18n / UI
// concerns live in a single client component that reads the language
// context. Everything visible must go through useApp().

export function DashboardOverview({
  stats,
  games,
  usage,
  apiOffline,
  merchantTier,
}: {
  stats: StatsOverview | null
  games: GameWithStats[]
  usage: UsageStats | null
  apiOffline: boolean
  merchantTier: string
}) {
  const { txt, lang } = useApp()
  const activePlayersToday = stats?.activePlayersToday ?? 0
  const gamesPlayed = stats?.gamesPlayed ?? 0
  const actionsCompleted = stats?.actionsCompleted ?? 0
  const couponsRedeemed = stats?.couponsRedeemed ?? 0

  const hasNoGames = games.length === 0
  const hasActiveGame = games.some((g) => g.status === 'active')
  const hasPlays = gamesPlayed > 0
  const numberLocale = lang === 'fr' ? 'fr-FR' : 'en-US'

  const kpis = [
    {
      title: txt.dashboardKpiActivePlayers,
      value: activePlayersToday,
      Icon: Users,
      iconClass: 'bg-sky-50 text-sky-700',
    },
    {
      title: txt.dashboardKpiGamesPlayed,
      value: gamesPlayed,
      Icon: Gauge,
      iconClass: 'bg-violet-50 text-violet-700',
    },
    {
      title: txt.dashboardKpiActionsCompleted,
      value: actionsCompleted,
      Icon: CheckCircle2,
      iconClass: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: txt.dashboardKpiCouponsRedeemed,
      value: couponsRedeemed,
      Icon: Ticket,
      iconClass: 'bg-amber-50 text-amber-700',
    },
  ]

  const upgradeNote =
    lang === 'fr'
      ? `Vous êtes sur le plan Gratuit${usage?.monthlyLimit ? ` (${usage.monthlyLimit} parties/mois)` : ''}. Passez à un plan supérieur pour plus de parties et de fonctionnalités avancées.`
      : `You're on the Free tier${usage?.monthlyLimit ? ` (${usage.monthlyLimit} plays/month)` : ''}. Upgrade for higher limits and advanced analytics.`

  const upgradeHeadline =
    lang === 'fr' ? 'Débloquez plus de parties et de fonctionnalités' : 'Unlock more plays and features'
  const upgradeButton = lang === 'fr' ? 'Passer à un plan supérieur' : 'Upgrade'

  const usagePercentText =
    usage && usage.monthlyLimit
      ? usage.percentUsed >= 100
        ? lang === 'fr'
          ? 'Vous avez atteint votre plafond mensuel. '
          : 'You have reached your monthly limit. '
        : lang === 'fr'
          ? `Vous avez utilisé ${usage.percentUsed}% de votre plafond mensuel. `
          : `You have used ${usage.percentUsed}% of your monthly limit. `
      : ''
  const upgradePlanLink = lang === 'fr' ? 'Passer à un plan supérieur' : 'Upgrade your plan'

  const noActiveGameTitle = lang === 'fr' ? 'Aucun jeu actif' : 'No active game'
  const noActiveGameBodyPrefix =
    lang === 'fr'
      ? `Vous avez ${games.length} jeu${games.length > 1 ? 'x' : ''}, mais aucun n'est actif. `
      : `You have ${games.length} game${games.length > 1 ? 's' : ''} but none are active. `
  const activateLinkLabel = lang === 'fr' ? 'Activer un jeu' : 'Activate a game'
  const noActiveGameBodySuffix =
    lang === 'fr' ? ' pour commencer à engager vos clients.' : ' to start engaging customers.'

  const quickStartTitle = lang === 'fr' ? 'Guide de démarrage rapide' : 'Quick Start Guide'
  const quickStartSteps = getQuickStartSteps(lang)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{txt.dashboardTitle}</h1>
        {apiOffline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            <AlertTriangle className="h-3 w-3" />
            {txt.dashboardApiOffline}
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
              <p className="font-medium text-foreground">{upgradeHeadline}</p>
              <p className="text-sm text-muted-foreground">{upgradeNote}</p>
            </div>
            <a
              href="/dashboard/upgrade"
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              {upgradeButton}
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
                <span className="text-sm font-medium">{txt.dashboardUsageTitle}</span>
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                  {usage.tier}
                </span>
              </div>
              <span className="text-sm tabular-nums text-muted-foreground">
                {usage.playsThisMonth.toLocaleString(numberLocale)} /{' '}
                {usage.monthlyLimit ? usage.monthlyLimit.toLocaleString(numberLocale) : txt.dashboardUsageUnlimited} {txt.dashboardUsagePlays}
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
                {usagePercentText}
                <a href="/dashboard/upgrade" className="font-medium text-primary hover:underline">
                  {upgradePlanLink}
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {hasNoGames && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle>{quickStartTitle}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quickStartSteps.map((s, i) => (
                <QuickStartStep
                  key={i}
                  step={i + 1}
                  title={s.title}
                  description={s.description}
                  done={false}
                  href={s.href}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!hasNoGames && !hasActiveGame && (
        <Card className="border-amber-300/60 bg-amber-50/40">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">{noActiveGameTitle}</p>
              <p className="text-sm text-muted-foreground">
                {noActiveGameBodyPrefix}
                <a href="/dashboard/games" className="font-medium text-primary hover:underline">
                  {activateLinkLabel}
                </a>
                {noActiveGameBodySuffix}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getQuickStartSteps(lang: 'fr' | 'en') {
  if (lang === 'fr') {
    return [
      {
        title: 'Créer votre premier jeu',
        description: 'Configurez une Roue de la Fortune, une Machine à Sous ou une Boîte Mystère.',
        href: '/dashboard/games/new',
      },
      {
        title: 'Activer votre jeu',
        description: 'Une fois configuré, activez-le pour que vos clients puissent jouer.',
      },
      {
        title: 'Télécharger le QR code',
        description: 'Récupérez votre QR code unique depuis Paramètres.',
        href: '/dashboard/settings',
      },
      {
        title: 'Placer le QR chez vous',
        description: 'Imprimez et placez le QR code sur vos tables, affiches ou tickets.',
      },
    ]
  }
  return [
    {
      title: 'Create your first game',
      description: 'Set up a Wheel of Fortune, Slot Machine, or Mystery Box.',
      href: '/dashboard/games/new',
    },
    {
      title: 'Activate your game',
      description: 'Once configured, activate it so customers can play.',
    },
    {
      title: 'Download QR code',
      description: 'Get your unique QR code from Settings.',
      href: '/dashboard/settings',
    },
    {
      title: 'Place QR at your business',
      description: 'Print and place the QR code on table tents, posters, or receipts.',
    },
  ]
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
