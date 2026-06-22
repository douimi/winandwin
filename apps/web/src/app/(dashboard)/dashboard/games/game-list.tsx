'use client'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { Box, Disc, Gamepad2, type LucideIcon, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchGames, type GameWithStats } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

// Visual identity per game type. Lucide icons replace the emojis that were
// flagged by the UX checklist — the channel/type is still recognisable at a
// glance because the icon + label live together.
const GAME_TYPE_META: Record<string, { label: string; Icon: LucideIcon; tone: string }> = {
  wheel: { label: 'Wheel of Fortune', Icon: Disc, tone: 'bg-sky-50 text-sky-700' },
  slots: { label: 'Slot Machine', Icon: Sparkles, tone: 'bg-violet-50 text-violet-700' },
  mystery_box: { label: 'Mystery Box', Icon: Box, tone: 'bg-amber-50 text-amber-700' },
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  draft: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  paused: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  ended: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

export function GameList() {
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
          setError(err instanceof Error ? err.message : 'Failed to load games')
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
  }, [merchantId])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Loading games...</p>
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
          <p className="mt-3 text-lg font-medium">No games yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first game to start engaging customers.
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
      setError('Failed to update game status')
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {games.map((game) => {
        const meta = GAME_TYPE_META[game.type] || {
          label: game.type,
          Icon: Gamepad2,
          tone: 'bg-muted text-muted-foreground',
        }
        const Icon = meta.Icon
        const statusClass = STATUS_STYLES[game.status] || STATUS_STYLES.draft!

        return (
          <a key={game.id} href={`/dashboard/games/${game.id}`} className="block">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{game.name}</CardTitle>
                    <p className="truncate text-xs text-muted-foreground">{meta.label}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${statusClass}`}
                >
                  {game.status}
                </span>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-5 text-sm text-muted-foreground">
                    <div>
                      <span className="font-semibold tabular-nums text-foreground">
                        {game.totalPlays}
                      </span>{' '}
                      plays
                    </div>
                    <div>
                      <span className="font-semibold tabular-nums text-foreground">
                        {game.totalWins}
                      </span>{' '}
                      wins
                    </div>
                    <div>
                      <span className="font-semibold tabular-nums text-foreground">
                        {game.prizes}
                      </span>{' '}
                      prizes
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
                    {game.status === 'active'
                      ? 'Pause'
                      : game.status === 'paused'
                        ? 'Resume'
                        : 'Activate'}
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
