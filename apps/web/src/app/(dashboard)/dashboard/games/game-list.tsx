'use client'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { useEffect, useState } from 'react'
import { fetchGames, type GameWithStats } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

const GAME_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  wheel: { label: 'Wheel of Fortune', icon: '🎡' },
  slots: { label: 'Slot Machine', icon: '🎰' },
  mystery_box: { label: 'Mystery Box', icon: '📦' },
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-800' },
  paused: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  ended: { bg: 'bg-red-100', text: 'text-red-800' },
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
          <p className="text-4xl">🎮</p>
          <p className="mt-2 text-lg font-medium">No games yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first game to start engaging customers
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
        const gameType = GAME_TYPE_LABELS[game.type] || { label: game.type, icon: '🎲' }
        const statusStyle = STATUS_STYLES[game.status] || STATUS_STYLES.draft!

        return (
          <a key={game.id} href={`/dashboard/games/${game.id}`} className="block">
          <Card className="transition-shadow hover:shadow-md cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">
                {gameType.icon} {game.name}
              </CardTitle>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
              >
                {game.status}
              </span>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground">{game.totalPlays}</span> plays
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{game.totalWins}</span> wins
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{game.prizes}</span> prizes
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={game.status === 'active' ? 'outline' : 'default'}
                  onClick={(e) => { e.preventDefault(); toggleStatus(game.id, game.status) }}
                >
                  {game.status === 'active' ? 'Pause' : game.status === 'paused' ? 'Resume' : 'Activate'}
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
