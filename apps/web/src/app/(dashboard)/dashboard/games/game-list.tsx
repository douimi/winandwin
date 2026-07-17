'use client'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { Box, Disc, Gamepad2, type LucideIcon, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchGames, type GameWithStats } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'
import { useApp } from '@/lib/i18n/app-lang-context'
import type { AppText } from '@/lib/i18n/app-text'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

// Visual identity per game type. Labels live in the app text bundle so the
// tile subtitles switch on FR/EN.
const GAME_TYPE_META: Record<string, { labelKey: keyof AppText; Icon: LucideIcon; tone: string }> = {
  wheel: { labelKey: 'gamesTypeWheel', Icon: Disc, tone: 'bg-sky-50 text-sky-700' },
  slots: { labelKey: 'gamesTypeSlots', Icon: Sparkles, tone: 'bg-violet-50 text-violet-700' },
  mystery_box: { labelKey: 'gamesTypeMystery', Icon: Box, tone: 'bg-amber-50 text-amber-700' },
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  draft: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  paused: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  ended: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

export function GameList() {
  const { txt, lang } = useApp()
  const merchantId = useMerchantId()
  const [games, setGames] = useState<GameWithStats[]>([])
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
        const data = await fetchGames(merchantId)
        if (!cancelled) {
          setGames(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : txt.commonError)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [merchantId, txt])

  const statusLabels: Record<string, string> = {
    active: txt.gamesStatusActive,
    draft: txt.gamesStatusDraft,
    paused: txt.gamesStatusPaused,
    ended: txt.gamesStatusEnded,
  }

  const actionLabels = {
    pause: lang === 'fr' ? 'Mettre en pause' : 'Pause',
    resume: lang === 'fr' ? 'Reprendre' : 'Resume',
    activate: lang === 'fr' ? 'Activer' : 'Activate',
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">{txt.commonLoading}</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (games.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <p className="mt-3 text-lg font-medium">{txt.gamesEmptyTitle}</p>
          <p className="text-sm text-muted-foreground">
            {txt.gamesEmptyBody}
          </p>
        </CardContent>
      </Card>
    )
  }

  async function toggleStatus(gameId: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    try {
      await fetch(`${API_BASE}/api/v1/games/${gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      setGames((prev) =>
        prev.map((g) => (g.id === gameId ? { ...g, status: newStatus } : g)),
      )
    } catch {
      setError(txt.commonError)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {games.map((game) => {
        const meta = GAME_TYPE_META[game.type]
        const Icon = meta?.Icon ?? Gamepad2
        const tone = meta?.tone ?? 'bg-muted text-muted-foreground'
        const subtitle = meta ? txt[meta.labelKey] : game.type
        const statusClass = STATUS_STYLES[game.status] || STATUS_STYLES.draft!
        const statusLabel = statusLabels[game.status] ?? game.status
        const actionLabel =
          game.status === 'active'
            ? actionLabels.pause
            : game.status === 'paused'
              ? actionLabels.resume
              : actionLabels.activate

        return (
          <a key={game.id} href={`/dashboard/games/${game.id}`} className="block">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{game.name}</CardTitle>
                    <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass}`}
                >
                  {statusLabel}
                </span>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-5 text-sm text-muted-foreground">
                    <div>
                      <span className="font-semibold tabular-nums text-foreground">
                        {game.totalPlays}
                      </span>{' '}
                      {txt.gamesColPlays.toLowerCase()}
                    </div>
                    <div>
                      <span className="font-semibold tabular-nums text-foreground">
                        {game.totalWins}
                      </span>{' '}
                      {txt.gamesColWins.toLowerCase()}
                    </div>
                    <div>
                      <span className="font-semibold tabular-nums text-foreground">
                        {game.prizes}
                      </span>{' '}
                      {txt.gamesColPrizes.toLowerCase()}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={game.status === 'active' ? 'outline' : 'default'}
                    onClick={(e) => {
                      e.preventDefault()
                      toggleStatus(game.id, game.status)
                    }}
                  >
                    {actionLabel}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </a>
        )
      })}
    </div>
  )
}
