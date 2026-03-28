'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@winandwin/ui'
import { fetchAdminMerchants, type AdminMerchantRow } from '@/lib/admin-api'
import { MerchantSearch } from './merchant-search'

const TIER_GRADIENTS: Record<string, string> = {
  free: 'from-slate-600 to-slate-500',
  starter: 'from-blue-600 to-blue-500',
  pro: 'from-purple-600 to-purple-500',
  enterprise: 'from-amber-600 to-amber-500',
}

function TierBadge({ tier }: { tier: string }) {
  const gradient = TIER_GRADIENTS[tier] ?? TIER_GRADIENTS.free
  return (
    <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${gradient} px-2.5 py-0.5 text-xs font-bold capitalize text-white shadow-sm`}>
      {tier}
    </span>
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-800/50">
          <td className="px-4 py-3"><div className="h-4 w-32 animate-pulse rounded bg-slate-800" /></td>
          <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-slate-800" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-slate-800" /></td>
          <td className="px-4 py-3"><div className="h-4 w-12 animate-pulse rounded bg-slate-800" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-slate-800" /></td>
          <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-slate-800" /></td>
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

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetchAdminMerchants(search || undefined)
      .then(setMerchants)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Merchants</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? 'Loading...' : `${merchants.length} merchant${merchants.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        {error && (
          <span className="rounded-full bg-yellow-900/50 px-2.5 py-0.5 text-xs font-medium text-yellow-300">
            API offline
          </span>
        )}
      </div>

      <MerchantSearch defaultValue={search} />

      <Card className="border-slate-800 bg-slate-900 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left bg-slate-800/30">
                  <th className="px-4 py-3.5 font-semibold text-slate-300">Name</th>
                  <th className="px-4 py-3.5 font-semibold text-slate-300">Category</th>
                  <th className="px-4 py-3.5 font-semibold text-slate-300">Tier</th>
                  <th className="px-4 py-3.5 font-semibold text-slate-300">Monthly Plays</th>
                  <th className="px-4 py-3.5 font-semibold text-slate-300">Status</th>
                  <th className="px-4 py-3.5 font-semibold text-slate-300">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows />
                ) : merchants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">{'\uD83C\uDFEA'}</span>
                        <p className="text-sm text-slate-500">
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
                        ? 'text-red-400'
                        : usagePercent > 70
                          ? 'text-yellow-400'
                          : 'text-emerald-400'
                    const barColor =
                      usagePercent > 90
                        ? 'bg-red-500'
                        : usagePercent > 70
                          ? 'bg-yellow-500'
                          : 'bg-emerald-500'
                    const statusLabel = usagePercent > 90 ? 'At limit' : 'Active'
                    const statusStyle =
                      usagePercent > 90
                        ? 'bg-red-900/30 text-red-400 ring-1 ring-red-500/20'
                        : 'bg-emerald-900/30 text-emerald-400 ring-1 ring-emerald-500/20'

                    return (
                      <tr
                        key={m.id}
                        className={`border-b border-slate-800/50 hover:bg-indigo-500/5 transition-colors cursor-pointer ${idx % 2 === 1 ? 'bg-slate-800/10' : ''}`}
                        onClick={() => window.location.assign(`/admin/merchants/${m.id}`)}
                      >
                        <td className="px-4 py-3.5">
                          <a
                            href={`/admin/merchants/${m.id}`}
                            className="font-medium text-slate-200 hover:text-indigo-300 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {m.name}
                          </a>
                          <p className="text-xs text-slate-500 mt-0.5">{m.email}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 capitalize">
                            {m.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <TierBadge tier={m.subscriptionTier} />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${usageColor}`}>
                              {m.playsThisMonth.toLocaleString()}
                            </span>
                            <span className="text-slate-600">/</span>
                            <span className="text-slate-500">
                              {m.monthlyLimit ? m.monthlyLimit.toLocaleString() : '\u221E'}
                            </span>
                          </div>
                          {m.monthlyLimit && (
                            <div className="mt-1.5 h-1.5 w-full max-w-[100px] rounded-full bg-slate-800">
                              <div
                                className={`h-1.5 rounded-full transition-all ${barColor}`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 text-xs">
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
