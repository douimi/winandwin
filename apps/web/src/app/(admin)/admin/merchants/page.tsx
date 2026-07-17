'use client'

import { AlertTriangle, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@winandwin/ui'
import { fetchAdminMerchants, updateAdminMerchant, type AdminMerchantRow } from '@/lib/admin-api'
import { useAdmin } from '../../admin-lang-context'
import { MerchantSearch } from './merchant-search'

const TIER_STYLES: Record<string, string> = {
  free: 'border-gray-300 text-gray-600 bg-gray-50',
  starter: 'border-cyan-400 text-cyan-700 bg-cyan-50 shadow-sm shadow-cyan-500/20',
  pro: 'border-purple-400 text-purple-700 bg-purple-50 shadow-sm shadow-purple-500/20',
  enterprise: 'border-amber-400 text-amber-700 bg-amber-50 shadow-sm shadow-amber-500/20',
}

function TierBadge({ tier }: { tier: string }) {
  const style = TIER_STYLES[tier] ?? TIER_STYLES.free
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}>
      {tier}
    </span>
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          <td className="px-4 py-3"><div className="h-4 w-32 animate-pulse rounded bg-gray-100" /></td>
          <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-gray-100" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-gray-100" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-gray-100" /></td>
          <td className="px-4 py-3"><div className="h-4 w-12 animate-pulse rounded bg-gray-100" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-gray-100" /></td>
          <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-gray-100" /></td>
        </tr>
      ))}
    </>
  )
}

export default function AdminMerchantsPage() {
  const { txt } = useAdmin()
  const searchParams = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const [merchants, setMerchants] = useState<AdminMerchantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetchAdminMerchants(search || undefined)
      .then(setMerchants)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [search])

  async function handleToggleDisabled(e: React.MouseEvent, merchant: AdminMerchantRow) {
    e.stopPropagation()
    setTogglingId(merchant.id)
    try {
      await updateAdminMerchant(merchant.id, { disabled: !merchant.disabled })
      setMerchants((prev) =>
        prev.map((m) => (m.id === merchant.id ? { ...m, disabled: !m.disabled } : m)),
      )
    } catch {
      // silently fail
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{txt.merchantsTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? txt.commonLoading
              : `${merchants.length} ${merchants.length === 1 ? txt.merchantsCountOne : txt.merchantsCountMany}`}
          </p>
        </div>
        {error && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            <AlertTriangle className="h-3 w-3" />
            {txt.commonApiOffline}
          </span>
        )}
      </div>

      <MerchantSearch defaultValue={search} />

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{txt.merchantsColName}</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{txt.merchantsColCategory}</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{txt.merchantsColTier}</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{txt.merchantsColStatus}</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{txt.merchantsColMonthlyPlays}</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{txt.merchantsColUsage}</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{txt.merchantsColJoined}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows />
                ) : merchants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                          <Store className="h-6 w-6" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {error ? txt.merchantsErrorLoad : txt.merchantsEmpty}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  merchants.map((m, idx) => {
                    const usagePercent = m.monthlyLimit
                      ? Math.round((m.playsThisMonth / m.monthlyLimit) * 100)
                      : 0
                    const usageColor =
                      usagePercent > 90
                        ? 'text-red-600'
                        : usagePercent > 70
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    const barColor =
                      usagePercent > 90
                        ? 'bg-red-500'
                        : usagePercent > 70
                          ? 'bg-yellow-500'
                          : 'bg-green-500'

                    return (
                      <tr
                        key={m.id}
                        className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40"
                        onClick={() => window.location.assign(`/admin/merchants/${m.id}`)}
                      >
                        <td className="px-4 py-3.5">
                          <a
                            href={`/admin/merchants/${m.id}`}
                            className="font-medium text-foreground transition-colors hover:text-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {m.name}
                          </a>
                          <p className="mt-0.5 text-xs text-muted-foreground">{m.email}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600 capitalize">
                            {m.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <TierBadge tier={m.subscriptionTier} />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                              m.disabled
                                ? 'border-red-300 text-red-600 bg-red-50'
                                : 'border-green-300 text-green-600 bg-green-50'
                            }`}>
                              {m.disabled ? txt.merchantsStatusDisabled : txt.merchantsStatusActive}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleToggleDisabled(e, m)}
                              disabled={togglingId === m.id}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                                m.disabled ? 'bg-gray-300' : 'bg-primary'
                              } ${togglingId === m.id ? 'opacity-50' : ''}`}
                              aria-label={m.disabled ? txt.merchantsToggleEnable : txt.merchantsToggleDisable}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  m.disabled ? 'translate-x-0' : 'translate-x-4'
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${usageColor}`}>
                              {m.playsThisMonth.toLocaleString()}
                            </span>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-400">
                              {m.monthlyLimit ? m.monthlyLimit.toLocaleString() : '\u221E'}
                            </span>
                          </div>
                          {m.monthlyLimit && (
                            <div className="mt-1.5 h-1.5 w-full max-w-[100px] overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                                  usagePercent > 90
                                    ? 'bg-destructive'
                                    : usagePercent > 70
                                      ? 'bg-amber-500'
                                      : 'bg-primary'
                                }`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            usagePercent > 90
                              ? 'border-red-300 text-red-600 bg-red-50'
                              : 'border-green-300 text-green-600 bg-green-50'
                          }`}>
                            {usagePercent > 90 ? txt.merchantsUsageAtLimit : `${usagePercent}%`}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 text-xs">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
