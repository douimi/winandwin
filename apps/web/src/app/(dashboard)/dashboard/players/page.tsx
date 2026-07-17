'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { Award, Download, Lock, Medal, Trophy, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchPlayers, type PlayerData, type PlayerListPage, type PlayerSortField } from '@/lib/api'
import { useMerchantId, useMerchantTier } from '@/lib/merchant-context'
import { useApp } from '@/lib/i18n/app-lang-context'
import type { AppText } from '@/lib/i18n/app-text'
import { hasFeature } from '@/lib/tier-features'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

type ColumnDef = {
  field: PlayerSortField
  labelKey: keyof AppText
  className?: string
}

const COLUMNS: ColumnDef[] = [
  { field: 'name', labelKey: 'playersColName' },
  { field: 'totalPlays', labelKey: 'playersColPlays' },
  { field: 'totalWins', labelKey: 'playersColWins' },
  { field: 'lastSeenAt', labelKey: 'playersColLastSeen', className: 'hidden sm:table-cell' },
  { field: 'createdAt', labelKey: 'playersColJoined', className: 'hidden md:table-cell' },
]

function formatDate(iso: string, lang: 'fr' | 'en' = 'fr') {
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
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <span
        title="1st place"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200"
      >
        <Trophy className="h-3.5 w-3.5" />
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span
        title="2nd place"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200"
      >
        <Medal className="h-3.5 w-3.5" />
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span
        title="3rd place"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-orange-700 ring-1 ring-orange-200"
      >
        <Award className="h-3.5 w-3.5" />
      </span>
    )
  }
  return <span className="text-sm font-medium tabular-nums text-muted-foreground">#{rank}</span>
}

export default function PlayersPage() {
  const { txt, lang } = useApp()
  const merchantId = useMerchantId()
  const tier = useMerchantTier()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortField, setSortField] = useState<PlayerSortField>('totalWins')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [pageData, setPageData] = useState<PlayerListPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page when filter/sort/page-size change
  useEffect(() => {
    setPage(1)
  }, [sortField, sortDir, pageSize])

  const loadPlayers = useCallback(async () => {
    if (!merchantId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const result = await fetchPlayers({
        merchantId,
        page,
        pageSize,
        sort: sortField,
        dir: sortDir,
        search: debouncedSearch || undefined,
      })
      setPageData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : txt.commonError)
    } finally {
      setLoading(false)
    }
  }, [merchantId, page, pageSize, sortField, sortDir, debouncedSearch, txt])

  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])

  function toggleSort(field: PlayerSortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function SortIcon({ field }: { field: PlayerSortField }) {
    if (sortField !== field) return <span className="ml-1 text-xs text-gray-300">{'↕'}</span>
    return <span className="ml-1 text-xs text-primary">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  // CSV export — fetches ALL rows by paging through the API, so it doesn't
  // truncate at the current page size.
  async function handleExportCsv() {
    if (!merchantId) return
    setExportLoading(true)
    try {
      const all: PlayerData[] = []
      let p = 1
      while (true) {
        const res = await fetchPlayers({
          merchantId,
          page: p,
          pageSize: 100,
          sort: sortField,
          dir: sortDir,
          search: debouncedSearch || undefined,
        })
        all.push(...res.data)
        if (p >= res.pagination.totalPages || res.data.length === 0) break
        p++
        // Safety: never loop more than 500 pages (50k rows).
        if (p > 500) break
      }

      const header = 'Name,Email,Plays,Wins,Win %,Last Active,Joined\n'
      const rows = all
        .map((player) => {
          const winPct = player.totalPlays > 0 ? Math.round((player.totalWins / player.totalPlays) * 100) : 0
          return [
            `"${(player.name || 'Anonymous').replace(/"/g, '""')}"`,
            `"${(player.email || '').replace(/"/g, '""')}"`,
            player.totalPlays,
            player.totalWins,
            `${winPct}%`,
            player.lastSeenAt,
            player.createdAt,
          ].join(',')
        })
        .join('\n')

      const blob = new Blob([header + rows], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `players-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export players')
    } finally {
      setExportLoading(false)
    }
  }

  const players = pageData?.data ?? []
  const pagination = pageData?.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 }
  const stats = pageData?.stats ?? { totalPlayers: 0, totalPlays: 0, totalWins: 0 }
  const totalPages = pagination.totalPages
  const showingFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
  const showingTo = Math.min(pagination.page * pagination.pageSize, pagination.total)
  const winRate = stats.totalPlays > 0 ? Math.round((stats.totalWins / stats.totalPlays) * 100) : 0

  // Compact page-number list (1, …, current-1, current, current+1, …, last)
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    pages.push(1)
    if (page > 4) pages.push('ellipsis')
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (page < totalPages - 3) pages.push('ellipsis')
    pages.push(totalPages)
    return pages
  }, [page, totalPages])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{txt.playersTitle}</h1>
        <div className="flex items-center gap-3">
          {hasFeature(tier, 'players.export') ? (
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={exportLoading || stats.totalPlayers === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {exportLoading ? (lang === 'fr' ? 'Export en cours…' : 'Exporting…') : txt.couponsExportCsv}
            </button>
          ) : (
            <a
              href="/dashboard/upgrade"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
            >
              <Lock className="h-3.5 w-3.5" />
              {txt.couponsExportCsv}
              <span className="ml-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Pro
              </span>
            </a>
          )}
          <div className="text-sm text-muted-foreground">
            {!loading && `${stats.totalPlayers} ${stats.totalPlayers === 1 ? (lang === 'fr' ? 'joueur' : 'player') : (lang === 'fr' ? 'joueurs' : 'players')}`}
          </div>
        </div>
      </div>

      {/* Aggregate KPIs across the full filtered set (not just the current page) */}
      {!loading && stats.totalPlayers > 0 && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-3 text-center shadow-xs">
            <p className="text-2xl font-bold tabular-nums text-primary">{stats.totalPlayers}</p>
            <p className="text-xs text-muted-foreground">{txt.playersStatTotal}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center shadow-xs">
            <p className="text-2xl font-bold tabular-nums">{stats.totalPlays}</p>
            <p className="text-xs text-muted-foreground">{txt.playersStatPlays}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center shadow-xs">
            <p className="text-2xl font-bold tabular-nums text-emerald-600">{stats.totalWins}</p>
            <p className="text-xs text-muted-foreground">{txt.playersStatWins}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center shadow-xs">
            <p className="text-2xl font-bold tabular-nums">{winRate}%</p>
            <p className="text-xs text-muted-foreground">{txt.playersDetailWinRate}</p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              {txt.playersRankingTitle}
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              {loading ? txt.commonLoading : `${pagination.total} ${lang === 'fr' ? 'au total' : 'total'}`}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters + sort presets */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder={txt.playersSearchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { field: 'totalWins' as PlayerSortField, label: lang === 'fr' ? 'Meilleurs gains' : 'Most Wins' },
                  { field: 'totalPlays' as PlayerSortField, label: lang === 'fr' ? 'Plus actifs' : 'Most Plays' },
                  { field: 'lastSeenAt' as PlayerSortField, label: lang === 'fr' ? 'Récents' : 'Recent' },
                ]
              ).map((preset) => (
                <button
                  key={preset.field}
                  type="button"
                  onClick={() => {
                    setSortField(preset.field)
                    setSortDir('desc')
                  }}
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

            <div className="ml-auto flex items-center gap-2">
              <label htmlFor="pageSize" className="text-xs text-muted-foreground">
                {lang === 'fr' ? 'Lignes par page' : 'Rows per page'}
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && players.length === 0 ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex animate-pulse gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-48 rounded bg-muted/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : players.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Users className="h-6 w-6" />
              </div>
              <p className="mt-3 text-lg font-medium">{txt.playersEmpty}</p>
              <p className="text-sm text-muted-foreground">
                {debouncedSearch
                  ? (lang === 'fr' ? 'Aucun joueur ne correspond à votre recherche.' : 'No players match your search.')
                  : (lang === 'fr' ? 'Les joueurs apparaîtront ici quand ils joueront.' : 'Players will appear here when they play your game.')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="w-12 pb-3 font-medium text-muted-foreground">#</th>
                    {COLUMNS.map((col) => (
                      <th
                        key={col.field}
                        onClick={() => toggleSort(col.field)}
                        className={`cursor-pointer select-none pb-3 font-medium text-muted-foreground transition-colors hover:text-foreground ${col.className ?? ''}`}
                      >
                        {txt[col.labelKey]}
                        <SortIcon field={col.field} />
                      </th>
                    ))}
                    <th className="pb-3 font-medium text-muted-foreground">
                      {lang === 'fr' ? 'Taux de gain' : 'Win %'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, i) => {
                    const winPct = player.totalPlays > 0 ? Math.round((player.totalWins / player.totalPlays) * 100) : 0
                    // Rank reflects position on the current page given the active sort
                    const overallRank = (pagination.page - 1) * pagination.pageSize + i + 1
                    return (
                      <tr
                        key={player.id}
                        onClick={() => {
                          window.location.href = `/dashboard/players/${player.id}`
                        }}
                        className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/40"
                      >
                        <td className="w-12 py-3">{getRankBadge(overallRank)}</td>
                        <td className="py-3">
                          <a
                            href={`/dashboard/players/${player.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="block"
                          >
                            <span className="font-medium hover:text-primary hover:underline">
                              {player.name || <span className="italic text-muted-foreground">{txt.playersAnonymous}</span>}
                            </span>
                            {player.email && (
                              <p className="max-w-[200px] truncate text-xs text-muted-foreground">{player.email}</p>
                            )}
                          </a>
                        </td>
                        <td className="py-3 font-medium tabular-nums">{player.totalPlays}</td>
                        <td className="py-3">
                          <span
                            className={
                              player.totalWins > 0
                                ? 'font-bold tabular-nums text-emerald-600'
                                : 'tabular-nums text-muted-foreground'
                            }
                          >
                            {player.totalWins}
                          </span>
                        </td>
                        <td className="hidden py-3 text-xs text-muted-foreground sm:table-cell">
                          {formatDateTime(player.lastSeenAt, lang)}
                        </td>
                        <td className="hidden py-3 text-xs text-muted-foreground md:table-cell">
                          {formatDate(player.createdAt, lang)}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${winPct}%` }} />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground">{winPct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination footer */}
          {players.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-muted-foreground">
                {lang === 'fr' ? 'Affichage' : 'Showing'}{' '}
                <span className="font-medium text-foreground">{showingFrom}</span>–
                <span className="font-medium text-foreground">{showingTo}</span>{' '}
                {lang === 'fr' ? 'sur' : 'of'}{' '}
                <span className="font-medium text-foreground">{pagination.total}</span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="inline-flex h-8 items-center rounded-md border border-input px-3 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-40"
                >
                  ← {txt.commonPrevious}
                </button>

                {pageNumbers.map((pn, i) =>
                  pn === 'ellipsis' ? (
                    <span key={`e-${i}`} className="px-2 text-xs text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <button
                      key={pn}
                      type="button"
                      onClick={() => setPage(pn)}
                      disabled={loading}
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2.5 text-xs font-medium transition-colors ${
                        pn === page
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-input hover:bg-accent'
                      }`}
                    >
                      {pn}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="inline-flex h-8 items-center rounded-md border border-input px-3 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-40"
                >
                  {txt.commonNext} →
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
