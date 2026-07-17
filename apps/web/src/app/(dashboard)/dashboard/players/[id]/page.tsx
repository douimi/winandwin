'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Clock,
  Gauge,
  Mail,
  Phone,
  Ticket,
  Trophy,
  User,
  XCircle,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { fetchPlayerDetail, type PlayerCoupon, type PlayerDetail, type PlayerGamePlay } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'
import { useApp } from '@/lib/i18n/app-lang-context'

const COUPON_STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  redeemed: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  expired: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  revoked: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

function formatDate(iso: string | null, lang: 'fr' | 'en' = 'fr') {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(iso: string, lang: 'fr' | 'en' = 'fr') {
  return new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PlayerDetailPage() {
  const { txt, lang } = useApp()
  const params = useParams()
  const merchantId = useMerchantId()
  const playerId = params.id as string

  const [detail, setDetail] = useState<PlayerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!merchantId || !playerId) {
      setLoading(false)
      return
    }
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const data = await fetchPlayerDetail(merchantId!, playerId)
        if (!cancelled) setDetail(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : txt.commonError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [merchantId, playerId])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <BackLink label={txt.playersDetailBack} />
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">{txt.commonLoading}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <BackLink label={txt.playersDetailBack} />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-8 w-8 text-destructive" />
            <p className="mt-3 text-sm text-destructive">
              {error || (lang === 'fr' ? 'Joueur introuvable' : 'Player not found')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { player, plays, coupons } = detail
  const winCount = plays.filter((p) => p.result === 'win').length
  const lossCount = plays.filter((p) => p.result === 'lose').length
  const displayName = player.name || txt.playersAnonymous
  const initial = (player.name || player.email || '?').charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BackLink label={txt.playersDetailBack} />

      {/* Identity + top-line stats */}
      <Card>
        <CardContent className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
              {initial}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {displayName}
              </h1>
              <div className="mt-1 flex flex-col gap-0.5 text-sm text-muted-foreground">
                {player.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {player.email}
                  </span>
                )}
                {player.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {player.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {txt.playersColJoined} {formatDate(player.createdAt, lang)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {txt.playersColLastSeen} {formatDateTime(player.lastSeenAt, lang)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat Icon={Gauge} label={txt.playersColPlays} value={player.totalPlays} tone="sky" />
            <MiniStat
              Icon={Trophy}
              label={txt.playersColWins}
              value={player.totalWins}
              tone="emerald"
            />
            <MiniStat
              Icon={BadgeCheck}
              label={txt.playersDetailWinRate}
              value={`${player.winRate}%`}
              tone="violet"
            />
            <MiniStat Icon={User} label={txt.playersColPoints} value={player.points} tone="amber" />
          </div>
        </CardContent>
      </Card>

      {/* Coupons — highlighted because it's what merchants care about most */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            {txt.playersDetailCouponsTitle} ({coupons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Ticket className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                This player hasn&apos;t won any coupons yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {coupons.map((c) => (
                <CouponRow key={c.id} coupon={c} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Game history */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              Game history ({plays.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-emerald-600 tabular-nums">{winCount}</span> wins ·{' '}
              <span className="font-medium tabular-nums">{lossCount}</span> losses
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {plays.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Gauge className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                No games played yet.
              </p>
            </div>
          ) : (
            <ol className="relative space-y-3 border-l border-border pl-6">
              {plays.map((play) => (
                <PlayRow key={play.id} play={play} />
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────

function BackLink({ label }: { label: string }) {
  return (
    <a
      href="/dashboard/players"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </a>
  )
}

interface MiniStatProps {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  tone: 'sky' | 'emerald' | 'violet' | 'amber'
}

const TONE_CLASSES: Record<MiniStatProps['tone'], string> = {
  sky: 'bg-sky-50 text-sky-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  violet: 'bg-violet-50 text-violet-700',
  amber: 'bg-amber-50 text-amber-700',
}

function MiniStat({ Icon, label, value, tone }: MiniStatProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-xs">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-bold tabular-nums leading-none text-foreground">
          {value}
        </p>
      </div>
    </div>
  )
}

function CouponRow({ coupon }: { coupon: PlayerCoupon }) {
  const badgeClass = COUPON_STATUS_BADGE[coupon.status] ?? COUPON_STATUS_BADGE.expired!
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-sm font-semibold">
            {coupon.code}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${badgeClass}`}
          >
            {coupon.status}
          </span>
        </div>
        <p className="mt-1 text-sm font-medium">{coupon.prizeName}</p>
        {coupon.prizeDescription && (
          <p className="mt-0.5 text-xs text-muted-foreground">{coupon.prizeDescription}</p>
        )}
        {coupon.redemptionConditions.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Conditions: {coupon.redemptionConditions.join(' · ')}
          </p>
        )}
      </div>
      <div className="shrink-0 text-right text-xs text-muted-foreground">
        <p>
          <span className="text-muted-foreground/70">Valid:</span>{' '}
          {formatDate(coupon.validFrom)} → {formatDate(coupon.validUntil)}
        </p>
        {coupon.redeemedAt && (
          <p className="mt-0.5">
            <span className="text-muted-foreground/70">Redeemed:</span>{' '}
            {formatDateTime(coupon.redeemedAt)}
          </p>
        )}
        <p className="mt-0.5">
          <span className="text-muted-foreground/70">Issued:</span>{' '}
          {formatDate(coupon.createdAt)}
        </p>
      </div>
    </li>
  )
}

function PlayRow({ play }: { play: PlayerGamePlay }) {
  const isWin = play.result === 'win'
  return (
    <li className="relative">
      <span
        className={`absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background ${
          isWin ? 'bg-emerald-500' : 'bg-muted-foreground/40'
        }`}
      />
      <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{play.gameName}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              {play.gameType.replace(/_/g, ' ')}
            </span>
            {isWin ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <Trophy className="h-3 w-3" />
                Win
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                No win
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{formatDateTime(play.playedAt)}</span>
        </div>
        {isWin && play.prizeName && (
          <p className="mt-1.5 flex items-center gap-1 text-sm text-emerald-700">
            {play.prizeEmoji && <span>{play.prizeEmoji}</span>}
            Prize: <span className="font-medium">{play.prizeName}</span>
          </p>
        )}
        {play.completedActions.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Actions: {play.completedActions.map((a) => a.replace(/_/g, ' ')).join(' · ')}
          </p>
        )}
      </div>
    </li>
  )
}
