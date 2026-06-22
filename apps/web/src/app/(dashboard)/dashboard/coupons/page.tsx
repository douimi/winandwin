'use client'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { Download, Lock, Ticket } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchCoupons,
  fetchCouponStats,
  redeemCoupon,
  revokeCoupon,
  type CouponListPage,
  type CouponSortField,
  type CouponStats,
  type CouponStatusFilter,
  type CouponWithDetails,
} from '@/lib/api'
import { useMerchantId, useMerchantTier } from '@/lib/merchant-context'
import { hasFeature } from '@/lib/tier-features'

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  redeemed: 'bg-blue-100 text-blue-800',
  expired: 'bg-gray-100 text-gray-600',
  revoked: 'bg-red-100 text-red-800',
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

type ColumnDef = {
  field: CouponSortField
  label: string
  className?: string
}

const COLUMNS: ColumnDef[] = [
  { field: 'code', label: 'Code' },
  { field: 'prizeName', label: 'Prize' },
  { field: 'status', label: 'Status' },
  { field: 'playerName', label: 'Player' },
  { field: 'validFrom', label: 'Valid From', className: 'hidden md:table-cell' },
  { field: 'validUntil', label: 'Valid Until' },
  { field: 'redeemedAt', label: 'Redeemed', className: 'hidden lg:table-cell' },
  { field: 'createdAt', label: 'Issued', className: 'hidden lg:table-cell' },
]

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CouponsPage() {
  const merchantId = useMerchantId()
  const tier = useMerchantTier()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortField, setSortField] = useState<CouponSortField>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CouponStatusFilter | ''>('')

  const [pageData, setPageData] = useState<CouponListPage | null>(null)
  const [stats, setStats] = useState<CouponStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Reset to page 1 when filters/sort/page size change
  useEffect(() => { setPage(1) }, [statusFilter, sortField, sortDir, pageSize])

  const loadCoupons = useCallback(async () => {
    if (!merchantId) { setLoading(false); return }
    try {
      setLoading(true)
      const result = await fetchCoupons({
        merchantId,
        page,
        pageSize,
        sort: sortField,
        dir: sortDir,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      })
      setPageData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }, [merchantId, page, pageSize, sortField, sortDir, debouncedSearch, statusFilter])

  const loadStats = useCallback(async () => {
    if (!merchantId) return
    try {
      const s = await fetchCouponStats(merchantId)
      setStats(s)
    } catch { /* non-blocking */ }
  }, [merchantId])

  useEffect(() => { loadCoupons() }, [loadCoupons])
  useEffect(() => { loadStats() }, [loadStats])

  function toggleSort(field: CouponSortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function SortIcon({ field }: { field: CouponSortField }) {
    if (sortField !== field) return <span className="ml-1 text-gray-300 text-xs">{'↕'}</span>
    return <span className="ml-1 text-primary text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  async function handleRedeem(couponId: string) {
    setActionLoading(couponId)
    try {
      await redeemCoupon(couponId)
      await Promise.all([loadCoupons(), loadStats()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem coupon')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRevoke(couponId: string) {
    setActionLoading(couponId)
    try {
      await revokeCoupon(couponId)
      await Promise.all([loadCoupons(), loadStats()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke coupon')
    } finally {
      setActionLoading(null)
    }
  }

  // CSV export — pages through the API in 100-row chunks so it doesn't
  // truncate at the current page size. Respects active search + status
  // filter so merchants can export filtered slices.
  async function handleExportCsv() {
    if (!merchantId) return
    setExportLoading(true)
    try {
      const all: CouponWithDetails[] = []
      let p = 1
      while (true) {
        const res = await fetchCoupons({
          merchantId,
          page: p,
          pageSize: 100,
          sort: sortField,
          dir: sortDir,
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
        })
        all.push(...res.data)
        if (p >= res.pagination.totalPages || res.data.length === 0) break
        p++
        if (p > 500) break // safety cap (50k rows)
      }

      const escape = (s: string | null | undefined) => `"${(s ?? '').replace(/"/g, '""')}"`
      const header =
        'Code,Prize,Status,Player Name,Player Email,Valid From,Valid Until,Redeemed At,Issued At,Conditions\n'
      const rows = all
        .map((c) =>
          [
            escape(c.code),
            escape(c.prizeName),
            escape(c.status),
            escape(c.playerName),
            escape(c.playerEmail),
            escape(c.validFrom),
            escape(c.validUntil),
            escape(c.redeemedAt),
            escape(c.createdAt),
            escape((c.redemptionConditions ?? []).join(' | ')),
          ].join(','),
        )
        .join('\n')

      const blob = new Blob([header + rows], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `coupons-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export coupons')
    } finally {
      setExportLoading(false)
    }
  }

  const coupons = pageData?.data ?? []
  const pagination = pageData?.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 }
  const totalPages = pagination.totalPages
  const showingFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
  const showingTo = Math.min(pagination.page * pagination.pageSize, pagination.total)

  // Build a compact page-number list (1, …, current-1, current, current+1, …, last)
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
        <h1 className="text-2xl font-semibold tracking-tight">Coupons</h1>
        {hasFeature(tier, 'coupons.export') ? (
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exportLoading || pagination.total === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {exportLoading ? 'Exporting…' : 'Export CSV'}
          </button>
        ) : (
          <a
            href="/dashboard/upgrade"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
          >
            <Lock className="h-3.5 w-3.5" />
            Export CSV
            <span className="ml-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Pro
            </span>
          </a>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.active ?? '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Redeemed This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.redeemedThisWeek ?? '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Redemption Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.redemptionRate != null ? `${stats.redemptionRate}%` : '—'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle>All Coupons</CardTitle>
            <div className="text-xs text-muted-foreground">
              {loading ? 'Loading…' : `${pagination.total} total`}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search code, prize, player…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CouponStatusFilter | '')}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="redeemed">Redeemed</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
            <div className="flex items-center gap-2 ml-auto">
              <label htmlFor="pageSize" className="text-xs text-muted-foreground">Rows per page</label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {loading && coupons.length === 0 ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-4 flex-1 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Ticket className="h-6 w-6" />
              </div>
              <p className="mt-3 text-lg font-medium">No coupons match</p>
              <p className="text-sm text-muted-foreground">
                {debouncedSearch || statusFilter ? 'Try adjusting the filters.' : 'Coupons will appear here when players win prizes.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    {COLUMNS.map((col) => (
                      <th
                        key={col.field}
                        onClick={() => toggleSort(col.field)}
                        className={`pb-3 font-medium select-none cursor-pointer hover:text-foreground transition-colors ${col.className ?? ''}`}
                      >
                        {col.label}
                        <SortIcon field={col.field} />
                      </th>
                    ))}
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 font-mono font-semibold">{coupon.code}</td>
                      <td className="py-3">{coupon.prizeName}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[coupon.status] || ''}`}>
                          {coupon.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {coupon.playerName || coupon.playerEmail ? (
                          <div className="leading-tight">
                            <div className="font-medium">{coupon.playerName ?? '—'}</div>
                            {coupon.playerEmail && (
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {coupon.playerEmail}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Anonymous</span>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground hidden md:table-cell">
                        {formatDate(coupon.validFrom)}
                      </td>
                      <td className="py-3 text-muted-foreground">{formatDate(coupon.validUntil)}</td>
                      <td className="py-3 text-muted-foreground hidden lg:table-cell">
                        {formatDate(coupon.redeemedAt)}
                      </td>
                      <td className="py-3 text-muted-foreground hidden lg:table-cell">
                        {formatDate(coupon.createdAt)}
                      </td>
                      <td className="py-3">
                        {coupon.status === 'active' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading === coupon.id}
                              onClick={() => handleRedeem(coupon.id)}
                            >
                              {actionLoading === coupon.id ? '...' : 'Redeem'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading === coupon.id}
                              onClick={() => handleRevoke(coupon.id)}
                            >
                              {actionLoading === coupon.id ? '...' : 'Revoke'}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination footer */}
          {coupons.length > 0 && (
            <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-medium text-foreground">{showingFrom}</span>–<span className="font-medium text-foreground">{showingTo}</span> of{' '}
                <span className="font-medium text-foreground">{pagination.total}</span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="inline-flex h-8 items-center rounded-md border border-input px-3 text-xs font-medium disabled:opacity-40 hover:bg-accent transition-colors"
                >
                  ← Prev
                </button>

                {pageNumbers.map((pn, i) =>
                  pn === 'ellipsis' ? (
                    <span key={`e-${i}`} className="px-2 text-xs text-muted-foreground">…</span>
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
                  className="inline-flex h-8 items-center rounded-md border border-input px-3 text-xs font-medium disabled:opacity-40 hover:bg-accent transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
