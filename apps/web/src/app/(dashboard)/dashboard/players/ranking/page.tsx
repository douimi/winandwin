'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { useEffect, useState, useCallback } from 'react'
import { fetchPlayerRanking, type PlayerRanking } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'

function getRankDisplay(rank: number): string {
  if (rank === 1) return '\uD83E\uDD47'
  if (rank === 2) return '\uD83E\uDD48'
  if (rank === 3) return '\uD83E\uDD49'
  return `#${rank}`
}

export default function RankingPage() {
  const merchantId = useMerchantId()
  const [ranking, setRanking] = useState<PlayerRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!merchantId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await fetchPlayerRanking(merchantId)
      setRanking(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ranking')
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  useEffect(() => {
    loadData()
  }, [loadData])

  function formatDateTime(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Player Ranking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Leaderboard based on player points
          </p>
        </div>
        <a
          href="/dashboard/players"
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          {'\u2190'} All Players
        </a>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Loading ranking...</p>
            </div>
          ) : ranking.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-4xl">{'\uD83C\uDFC6'}</p>
              <p className="mt-2 text-lg font-medium">No rankings yet</p>
              <p className="text-sm text-muted-foreground">
                Players will appear here when they earn points
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium w-16">Rank</th>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Points</th>
                    <th className="pb-3 font-medium">Plays</th>
                    <th className="pb-3 font-medium">Wins</th>
                    <th className="pb-3 font-medium">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((player) => {
                    const isTopThree = player.rank <= 3
                    return (
                      <tr
                        key={player.id}
                        className={`border-b last:border-0 ${isTopThree ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}`}
                      >
                        <td className="py-3">
                          <span className={`${isTopThree ? 'text-xl' : 'text-sm text-muted-foreground'}`}>
                            {getRankDisplay(player.rank)}
                          </span>
                        </td>
                        <td className="py-3 font-medium">
                          {player.name || <span className="text-muted-foreground">Anonymous</span>}
                        </td>
                        <td className="py-3">
                          <span className="font-semibold text-primary">{player.points}</span>
                        </td>
                        <td className="py-3">{player.totalPlays}</td>
                        <td className="py-3">
                          <span className={player.totalWins > 0 ? 'text-green-600 font-medium' : ''}>
                            {player.totalWins}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {formatDateTime(player.lastSeenAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
