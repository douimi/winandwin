'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { fetchPlayers, type PlayerData } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'

type SortField = 'name' | 'totalPlays' | 'totalWins' | 'points' | 'lastSeenAt' | 'createdAt'
type SortDir = 'asc' | 'desc'

export default function PlayersPage() {
  const merchantId = useMerchantId()
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('totalWins')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadData = useCallback(async () => {
    if (!merchantId) { setLoading(false); return }
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

  useEffect(() => { loadData() }, [loadData])

  const sorted = useMemo(() => {
    const copy = [...players]
    copy.sort((a, b) => {
      let aVal: string | number = 0
      let bVal: string | number = 0
      switch (sortField) {
        case 'name': aVal = (a.name || '').toLowerCase(); bVal = (b.name || '').toLowerCase(); break
        case 'totalPlays': aVal = a.totalPlays; bVal = b.totalPlays; break
        case 'totalWins': aVal = a.totalWins; bVal = b.totalWins; break
        case 'points': aVal = (a as unknown as Record<string, unknown>).points as number || 0; bVal = (b as unknown as Record<string, unknown>).points as number || 0; break
        case 'lastSeenAt': aVal = new Date(a.lastSeenAt).getTime(); bVal = new Date(b.lastSeenAt).getTime(); break
        case 'createdAt': aVal = new Date(a.createdAt).getTime(); bVal = new Date(b.createdAt).getTime(); break
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [players, sortField, sortDir])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="ml-1 text-gray-300">{'\u2195'}</span>
    return <span className="ml-1 text-primary">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function formatDateTime(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function getRankBadge(rank: number) {
    if (rank === 1) return <span className="text-lg" title="1st place">{'\uD83E\uDD47'}</span>
    if (rank === 2) return <span className="text-lg" title="2nd place">{'\uD83E\uDD48'}</span>
    if (rank === 3) return <span className="text-lg" title="3rd place">{'\uD83E\uDD49'}</span>
    return <span className="text-sm text-muted-foreground font-medium">#{rank}</span>
  }

  // Quick stats
  const totalPlayers = players.length
  const totalPlays = players.reduce((sum, p) => sum + p.totalPlays, 0)
  const totalWins = players.reduce((sum, p) => sum + p.totalWins, 0)
  const winRate = totalPlays > 0 ? Math.round((totalWins / totalPlays) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Players</h1>
        <div className="text-sm text-muted-foreground">
          {!loading && `${totalPlayers} player${totalPlayers !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Quick Stats */}
      {!loading && players.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-primary">{totalPlayers}</p>
            <p className="text-xs text-muted-foreground">Total Players</p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-2xl font-bold">{totalPlays}</p>
            <p className="text-xs text-muted-foreground">Total Plays</p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{totalWins}</p>
            <p className="text-xs text-muted-foreground">Total Wins</p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-2xl font-bold">{winRate}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Search + Sort presets */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="flex gap-1.5">
          {([
            { field: 'totalWins' as SortField, label: 'Most Wins' },
            { field: 'totalPlays' as SortField, label: 'Most Plays' },
            { field: 'lastSeenAt' as SortField, label: 'Recent' },
          ]).map(preset => (
            <button
              key={preset.field}
              type="button"
              onClick={() => { setSortField(preset.field); setSortDir('desc') }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                sortField === preset.field
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{'\uD83C\uDFC6'} Player Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="h-3 w-48 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-4xl">{'\uD83D\uDC65'}</p>
              <p className="mt-2 text-lg font-medium">No players yet</p>
              <p className="text-sm text-muted-foreground">
                {search ? 'No players match your search' : 'Players will appear here when they play your game'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-muted-foreground w-12">#</th>
                    <th className="pb-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort('name')}>
                      Player <SortIcon field="name" />
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort('totalPlays')}>
                      Plays <SortIcon field="totalPlays" />
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort('totalWins')}>
                      Wins <SortIcon field="totalWins" />
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">Win %</th>
                    <th className="pb-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground hidden sm:table-cell" onClick={() => toggleSort('lastSeenAt')}>
                      Last Active <SortIcon field="lastSeenAt" />
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground hidden md:table-cell cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort('createdAt')}>
                      Joined <SortIcon field="createdAt" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((player, i) => {
                    const winPct = player.totalPlays > 0 ? Math.round((player.totalWins / player.totalPlays) * 100) : 0
                    return (
                      <tr key={player.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 w-12">{getRankBadge(i + 1)}</td>
                        <td className="py-3">
                          <div>
                            <span className="font-medium">
                              {player.name || <span className="text-muted-foreground italic">Anonymous</span>}
                            </span>
                            {player.email && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{player.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 font-medium">{player.totalPlays}</td>
                        <td className="py-3">
                          <span className={player.totalWins > 0 ? 'font-bold text-green-600' : 'text-muted-foreground'}>
                            {player.totalWins}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${winPct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{winPct}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-muted-foreground hidden sm:table-cell text-xs">
                          {formatDateTime(player.lastSeenAt)}
                        </td>
                        <td className="py-3 text-muted-foreground hidden md:table-cell text-xs">
                          {formatDate(player.createdAt)}
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
