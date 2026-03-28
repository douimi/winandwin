'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { fetchAdminMerchantDetail, type AdminMerchantDetail } from '@/lib/admin-api'
import { TierChanger } from './tier-changer'

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    free: 'bg-slate-700 text-slate-300',
    starter: 'bg-blue-900/50 text-blue-300 ring-1 ring-blue-500/20',
    pro: 'bg-purple-900/50 text-purple-300 ring-1 ring-purple-500/20',
    enterprise: 'bg-amber-900/50 text-amber-300 ring-1 ring-amber-500/20',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${colors[tier] ?? colors.free}`}>
      {tier}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-emerald-900/30 text-emerald-400 ring-1 ring-emerald-500/20',
    draft: 'bg-slate-800 text-slate-400',
    paused: 'bg-yellow-900/30 text-yellow-300 ring-1 ring-yellow-500/20',
    ended: 'bg-red-900/30 text-red-400 ring-1 ring-red-500/20',
    redeemed: 'bg-blue-900/30 text-blue-300 ring-1 ring-blue-500/20',
    expired: 'bg-red-900/30 text-red-400 ring-1 ring-red-500/20',
    revoked: 'bg-slate-800 text-slate-500',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[status] ?? 'bg-slate-800 text-slate-400'}`}>
      {status}
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-800" />
        <div className="h-4 w-48 animate-pulse rounded bg-slate-800" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-800" />
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
        <a href="/admin/merchants" className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          {'\u2190'} Back to Merchants
        </a>
        <Card className="border-slate-800 bg-slate-900">
          <CardContent className="py-12 text-center">
            <span className="text-3xl">{'\uD83D\uDEAB'}</span>
            <p className="mt-2 text-sm text-slate-400">{error ?? 'Merchant not found'}</p>
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
    usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
  const usageTextColor =
    usagePercent > 90 ? 'text-red-400' : usagePercent > 70 ? 'text-yellow-400' : 'text-emerald-400'

  const statCards = [
    { label: 'Total Players', value: playerCount, icon: '\uD83D\uDC65', bg: 'bg-blue-500/10', color: 'text-blue-400' },
    { label: 'Total Games', value: games.length, icon: '\uD83C\uDFAE', bg: 'bg-purple-500/10', color: 'text-purple-400' },
    { label: 'Active Games', value: activeGames, icon: '\u25B6\uFE0F', bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
    { label: 'Coupons Redeemed', value: redeemedCoupons, icon: '\uD83C\uDF9F\uFE0F', bg: 'bg-amber-500/10', color: 'text-amber-400' },
  ]

  return (
    <div className="space-y-6">
      {/* Back link */}
      <a href="/admin/merchants" className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
        {'\u2190'} Back to Merchants
      </a>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100">{merchant.name}</h1>
            <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 capitalize">
              {merchant.category}
            </span>
            <TierBadge tier={merchant.subscriptionTier} />
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {merchant.email} {merchant.phone && `\u00B7 ${merchant.phone}`}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Created {new Date(merchant.createdAt).toLocaleDateString()}
          </p>
        </div>
        <TierChanger merchantId={merchant.id} currentTier={merchant.subscriptionTier} />
      </div>

      {/* Usage Card */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-100">Monthly Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-slate-100">
              {usage.playsThisMonth.toLocaleString()}
            </span>
            <span className="text-slate-500">
              / {usage.monthlyLimit ? usage.monthlyLimit.toLocaleString() : 'Unlimited'} plays
            </span>
          </div>
          {usage.monthlyLimit ? (
            <>
              <div className="h-3 w-full max-w-lg rounded-full bg-slate-800">
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
            <p className="text-sm text-slate-500">Unlimited plan &mdash; no usage cap</p>
          )}
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="border-slate-800 bg-slate-900">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-100">{s.value.toLocaleString()}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                  <span className={`text-lg ${s.color}`}>{s.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Games Table */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-100">Games ({games.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {games.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-2xl">{'\uD83C\uDFAE'}</span>
              <p className="mt-2 text-sm text-slate-500">No games configured yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="px-4 py-3 font-medium text-slate-400">Name</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Type</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Status</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Plays</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((g) => (
                    <tr key={g.id} className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-slate-200">{g.name}</td>
                      <td className="px-4 py-3 text-slate-400 capitalize">{g.type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                      <td className="px-4 py-3 font-medium text-slate-300">{g.playsCount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(g.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Coupons */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-100">Recent Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-2xl">{'\uD83C\uDF9F\uFE0F'}</span>
              <p className="mt-2 text-sm text-slate-500">No coupons generated yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="px-4 py-3 font-medium text-slate-400">Code</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Prize</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Status</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Valid Until</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.slice(0, 10).map((cp) => (
                    <tr key={cp.id} className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-mono text-xs text-slate-200">{cp.code}</td>
                      <td className="px-4 py-3 text-slate-300">{cp.prizeName}</td>
                      <td className="px-4 py-3"><StatusBadge status={cp.status} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(cp.validUntil).toLocaleDateString()}</td>
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
