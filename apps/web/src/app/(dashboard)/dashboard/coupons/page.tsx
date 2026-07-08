'use client'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { AlertTriangle, CheckCircle2, Download, Lock, Ticket, X } from 'lucide-react'
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

// Confirmation dialog state — which coupon and which action to run.
type ConfirmAction = { kind: 'redeem' | 'revoke'; coupon: CouponWithDetails } | null

// Floating toast state — auto-dismisses after 4 seconds.
type Toast = { kind: 'success' | 'error'; message: string } | null

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

  const [confirm, setConfirm] = useState<ConfirmAction>(null)
  const [toast, setToast] = useState<Toast>(null)

  // Auto-dismiss the toast after 4 s. A separate useEffect (not a
  // setTimeout in setToast) so back-to-back toasts reset the timer.
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

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

  // Optimistically flip a single row's status so the merchant sees
  // immediate feedback next to the button they just tapped. If the API
  // rejects the change we restore the previous state.
  function patchCouponStatus(couponId: string, next: CouponWithDetails['status']) {
    setPageData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        data: prev.data.map((c) =>
          c.id === couponId
            ? { ...c, status: next, redeemedAt: next === 'redeemed' ? new Date().toISOString() : c.redeemedAt }
            : c,
        ),
      }
    })
  }

  async function runConfirmedAction() {
    if (!confirm) return
    const { kind, coupon } = confirm
    const prevStatus = coupon.status
    setActionLoading(coupon.id)
    setConfirm(null)

    // Optimistic UI update — flip the row instantly.
    patchCouponStatus(coupon.id, kind === 'redeem' ? 'redeemed' : 'revoked')

    try {
      if (kind === 'redeem') {
        await redeemCoupon(coupon.id)
        setToast({ kind: 'success', message: `Coupon ${coupon.code} marked as redeemed.` })
      } else {
        await revokeCoupon(coupon.id)
        setToast({ kind: 'success', message: `Coupon ${coupon.code} revoked.` })
      }
      // Refresh in the background so pagination + stats stay in sync.
      loadCoupons().catch(() => { /* silent — the optimistic state is already correct */ })
      loadStats().catch(() => {})
    } catch (err) {
      // Rollback the optimistic status.
      patchCouponStatus(coupon.id, prevStatus)
      const msg = err instanceof Error ? err.message : `Failed to ${kind} coupon`
      setToast({ kind: 'error', message: msg })
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
                              variant="default"
                              disabled={actionLoading === coupon.id}
                              onClick={() => setConfirm({ kind: 'redeem', coupon })}
                            >
                              {actionLoading === coupon.id ? '...' : 'Redeem'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading === coupon.id}
                              onClick={() => setConfirm({ kind: 'revoke', coupon })}
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

      {/* ── Confirmation dialog ─────────────────────────────────────────
          Both Redeem and Revoke are destructive-ish (Redeem can't be
          undone; Revoke can't be redeemed later), so we require an
          explicit second click. The modal shows exactly which coupon +
          who owns it so staff can verify before pressing OK.
      */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coupon-confirm-title"
        >
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setConfirm(null)}
            role="presentation"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  confirm.kind === 'redeem' ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive'
                }`}
              >
                {confirm.kind === 'redeem' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="coupon-confirm-title" className="text-base font-semibold tracking-tight">
                  {confirm.kind === 'redeem' ? 'Redeem this coupon?' : 'Revoke this coupon?'}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {confirm.kind === 'redeem'
                    ? 'The customer receives their reward and the coupon is marked used. This action cannot be undone.'
                    : 'The coupon becomes invalid and cannot be used or redeemed. This cannot be undone.'}
                </p>

                <div className="mt-4 space-y-1 rounded-lg border border-border bg-muted/40 p-3 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Code</span>
                    <span className="font-mono font-semibold tracking-wide">{confirm.coupon.code}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Prize</span>
                    <span className="font-medium">{confirm.coupon.prizeName}</span>
                  </div>
                  {confirm.coupon.playerName && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Player</span>
                      <span className="truncate font-medium">{confirm.coupon.playerName}</span>
                    </div>
                  )}
                  {confirm.coupon.playerEmail && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Email</span>
                      <span className="max-w-[180px] truncate">{confirm.coupon.playerEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setConfirm(null)}
                disabled={actionLoading === confirm.coupon.id}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={confirm.kind === 'revoke' ? 'destructive' : 'default'}
                className="flex-1"
                onClick={runConfirmedAction}
                disabled={actionLoading === confirm.coupon.id}
                autoFocus
              >
                {confirm.kind === 'redeem' ? 'Yes, redeem' : 'Yes, revoke'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating toast ──────────────────────────────────────────────
          Pinned to the bottom of the viewport so success + error feedback
          is visible wherever the merchant is scrolled — the previous
          setError(...) rendered at the TOP of the page, which was
          invisible to anyone tapping a button on the coupons table on
          mobile.
      */}
      {toast && (
        <div
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm sm:bottom-6"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
          role={toast.kind === 'error' ? 'alert' : 'status'}
        >
          <div
            className={`flex items-start gap-3 rounded-xl border p-3.5 shadow-lg ${
              toast.kind === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-destructive/30 bg-destructive/10 text-destructive'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.kind === 'success' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className={`shrink-0 rounded-md p-1 transition-colors ${
                toast.kind === 'success'
                  ? 'hover:bg-emerald-100 text-emerald-700'
                  : 'hover:bg-destructive/10 text-destructive'
              }`}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
