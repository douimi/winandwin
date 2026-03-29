'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { fetchAdminMerchantDetail, type AdminMerchantDetail } from '@/lib/admin-api'
import { TierChanger } from './tier-changer'

const TIER_STYLES: Record<string, string> = {
  free: 'border-gray-300 text-gray-600 bg-white',
  starter: 'border-blue-300 text-blue-700 bg-white',
  pro: 'border-indigo-300 text-indigo-700 bg-white',
  enterprise: 'border-amber-300 text-amber-700 bg-white',
}

function TierBadge({ tier }: { tier: string }) {
  const style = TIER_STYLES[tier] ?? TIER_STYLES.free
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}>
      {tier}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'border-green-300 text-green-600 bg-green-50',
    draft: 'border-gray-200 text-gray-500 bg-gray-50',
    paused: 'border-yellow-300 text-yellow-600 bg-yellow-50',
    ended: 'border-red-300 text-red-600 bg-red-50',
    redeemed: 'border-blue-300 text-blue-600 bg-blue-50',
    expired: 'border-red-300 text-red-600 bg-red-50',
    revoked: 'border-gray-200 text-gray-400 bg-gray-50',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${colors[status] ?? 'border-gray-200 text-gray-500 bg-gray-50'}`}>
      {status}
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  )
}

export default function AdminMerchantDetailPage() {
  const params = useParams<{ id: string }>()
  const [detail, setDetail] = useState<AdminMerchantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return
    setLoading(true)
    fetchAdminMerchantDetail(params.id)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load merchant'))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <a href="/admin/merchants" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
          {'\u2190'} Merchants
        </a>
        <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
          <CardContent className="py-12 text-center">
            <span className="text-3xl">{'\uD83D\uDEAB'}</span>
            <p className="mt-2 text-sm text-gray-500">{error ?? 'Merchant not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { merchant, usage, games, coupons, playerCount } = detail
  const activeGames = games.filter((g) => g.status === 'active').length
  const redeemedCoupons = coupons.filter((c) => c.status === 'redeemed').length

  const usagePercent = usage.monthlyLimit
    ? Math.round((usage.playsThisMonth / usage.monthlyLimit) * 100)
    : 0
  const usageBarColor =
    usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
  const usageTextColor =
    usagePercent > 90 ? 'text-red-600' : usagePercent > 70 ? 'text-yellow-600' : 'text-green-600'

  const statCards = [
    { label: 'Total Players', value: playerCount, icon: '\uD83D\uDC65' },
    { label: 'Total Games', value: games.length, icon: '\uD83C\uDFAE' },
    { label: 'Active Games', value: activeGames, icon: '\u25B6\uFE0F' },
    { label: 'Coupons Redeemed', value: redeemedCoupons, icon: '\uD83C\uDF9F\uFE0F' },
  ]

  return (
    <div className="space-y-6">
      {/* Back link */}
      <a href="/admin/merchants" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
        {'\u2190'} Merchants
      </a>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{merchant.name}</h1>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600 capitalize">
              {merchant.category}
            </span>
            <TierBadge tier={merchant.subscriptionTier} />
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {merchant.email} {merchant.phone && `\u00B7 ${merchant.phone}`}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Created {new Date(merchant.createdAt).toLocaleDateString()}
          </p>
        </div>
        <TierChanger merchantId={merchant.id} currentTier={merchant.subscriptionTier} />
      </div>

      {/* Usage Card */}
      <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-gray-900">Monthly Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-900">
              {usage.playsThisMonth.toLocaleString()}
            </span>
            <span className="text-gray-500">
              / {usage.monthlyLimit ? usage.monthlyLimit.toLocaleString() : 'Unlimited'} plays
            </span>
          </div>
          {usage.monthlyLimit ? (
            <>
              <div className="h-3 w-full max-w-lg rounded-full bg-gray-100">
                <div
                  className={`h-3 rounded-full transition-all ${usageBarColor}`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <p className={`mt-2 text-sm font-medium ${usageTextColor}`}>
                {usagePercent}% of monthly limit used
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Unlimited plan &mdash; no usage cap</p>
          )}
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="border border-gray-200 bg-white shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</p>
                </div>
                <span className="text-xl">{s.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Games Table */}
      <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-gray-900">Games ({games.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {games.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-2xl">{'\uD83C\uDFAE'}</span>
              <p className="mt-2 text-sm text-gray-500">No games configured yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Plays</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((g, i) => (
                    <tr key={g.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{g.name}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{g.type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                      <td className="px-4 py-3 font-medium text-gray-700">{g.playsCount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(g.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Coupons */}
      <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-2xl">{'\uD83C\uDF9F\uFE0F'}</span>
              <p className="mt-2 text-sm text-gray-500">No coupons generated yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-4 py-3 font-medium text-gray-500">Code</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Prize</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Valid Until</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.slice(0, 10).map((cp, i) => (
                    <tr key={cp.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-900">{cp.code}</td>
                      <td className="px-4 py-3 text-gray-700">{cp.prizeName}</td>
                      <td className="px-4 py-3"><StatusBadge status={cp.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(cp.validUntil).toLocaleDateString()}</td>
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
