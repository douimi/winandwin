'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { useEffect, useState, useCallback } from 'react'
import { fetchPlayers, type PlayerData } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'

export default function PlayersPage() {
  const merchantId = useMerchantId()
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadData = useCallback(async () => {
    if (!merchantId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await fetchPlayers(merchantId, debouncedSearch || undefined)
      setPlayers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load players')
    } finally {
      setLoading(false)
    }
  }, [merchantId, debouncedSearch])

  useEffect(() => {
    loadData()
  }, [loadData])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

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
        <h1 className="text-2xl font-bold">Players</h1>
        <div className="text-sm text-muted-foreground">
          {!loading && `${players.length} player${players.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Players</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Loading players...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-4xl">{'\uD83D\uDC65'}</p>
              <p className="mt-2 text-lg font-medium">No players yet</p>
              <p className="text-sm text-muted-foreground">
                {search
                  ? 'No players match your search'
                  : 'Players will appear here when they play your game'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Total Plays</th>
                    <th className="pb-3 font-medium">Total Wins</th>
                    <th className="pb-3 font-medium">Last Seen</th>
                    <th className="pb-3 font-medium">First Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">
                        {player.name || <span className="text-muted-foreground">Anonymous</span>}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {player.email || '-'}
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
                      <td className="py-3 text-muted-foreground">
                        {formatDate(player.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
