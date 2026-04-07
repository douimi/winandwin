'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@winandwin/ui'
import { fetchAdminMerchants, updateAdminMerchant, type AdminMerchantRow } from '@/lib/admin-api'
import { MerchantSearch } from './merchant-search'

const TIER_STYLES: Record<string, string> = {
  free: 'border-gray-300 text-gray-600 bg-white',
  starter: 'border-blue-300 text-blue-700 bg-white shadow-sm shadow-blue-500/20',
  pro: 'border-indigo-300 text-indigo-700 bg-white shadow-sm shadow-indigo-500/20',
  enterprise: 'border-amber-300 text-amber-700 bg-white shadow-sm shadow-amber-500/20',
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
          <h1 className="text-2xl font-bold text-gray-900">Merchants</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? 'Loading...' : `${merchants.length} merchant${merchants.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        {error && (
          <span className="rounded-full border border-yellow-300 bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
            API offline
          </span>
        )}
      </div>

      <MerchantSearch defaultValue={search} />

      <Card className="border border-gray-200 bg-white shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left bg-gray-50">
                  <th className="px-4 py-3.5 font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600">Tier</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600">Monthly Plays</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600">Usage</th>
                  <th className="px-4 py-3.5 font-semibold text-gray-600">Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows />
                ) : merchants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">{'\uD83C\uDFEA'}</span>
                        <p className="text-sm text-gray-500">
                          {error ? 'Unable to load merchants.' : 'No merchants found.'}
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
                        className={`border-b border-gray-100 hover:bg-indigo-50/50 transition-colors cursor-pointer ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                        onClick={() => window.location.assign(`/admin/merchants/${m.id}`)}
                      >
                        <td className="px-4 py-3.5">
                          <a
                            href={`/admin/merchants/${m.id}`}
                            className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {m.name}
                          </a>
                          <p className="text-xs text-gray-400 mt-0.5">{m.email}</p>
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
                              {m.disabled ? 'Disabled' : 'Active'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleToggleDisabled(e, m)}
                              disabled={togglingId === m.id}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                m.disabled ? 'bg-gray-300' : 'bg-indigo-600'
                              } ${togglingId === m.id ? 'opacity-50' : ''}`}
                              aria-label={m.disabled ? 'Enable merchant' : 'Disable merchant'}
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
                            <div className="mt-1.5 h-1.5 w-full max-w-[100px] rounded-full bg-gray-100">
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(usagePercent, 100)}%`,
                                  background: usagePercent > 90
                                    ? 'linear-gradient(90deg, #ef4444, #f97316)'
                                    : usagePercent > 70
                                      ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                                      : 'linear-gradient(90deg, #6366f1, #a855f7)',
                                }}
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
                            {usagePercent > 90 ? 'At limit' : `${usagePercent}%`}
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
