import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { fetchAdminMerchantDetail, type AdminMerchantDetail } from '@/lib/admin-api'
import { TierChanger } from './tier-changer'

export default async function AdminMerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let detail: AdminMerchantDetail | null = null
  let error: string | null = null

  try {
    detail = await fetchAdminMerchantDetail(id)
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load merchant'
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <a href="/admin/merchants" className="text-sm text-purple-400 hover:underline">
          &larr; Back to Merchants
        </a>
        <Card className="border-gray-800 bg-gray-900">
          <CardContent className="py-8 text-center text-gray-400">
            {error ?? 'Merchant not found'}
          </CardContent>
        </Card>
      </div>
    )
  }

  const { merchant, usage, games, coupons, playerCount, ctas: ctaList } = detail

  const usagePercent = usage.monthlyLimit
    ? Math.round((usage.playsThisMonth / usage.monthlyLimit) * 100)
    : 0
  const usageColor =
    usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="space-y-6">
      <a href="/admin/merchants" className="text-sm text-purple-400 hover:underline">
        &larr; Back to Merchants
      </a>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{merchant.name}</h1>
          <p className="text-sm text-gray-400">
            {merchant.email} &middot; {merchant.category} &middot; /{merchant.slug}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Created {new Date(merchant.createdAt).toLocaleDateString()}
            {merchant.phone && ` | Phone: ${merchant.phone}`}
          </p>
        </div>
        <TierChanger merchantId={merchant.id} currentTier={merchant.subscriptionTier} />
      </div>

      {/* Usage Card */}
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-100">Monthly Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-gray-100">
              {usage.playsThisMonth.toLocaleString()}
            </span>
            <span className="text-gray-500 mb-1">
              / {usage.monthlyLimit ? usage.monthlyLimit.toLocaleString() : 'Unlimited'} plays
            </span>
          </div>
          {usage.monthlyLimit && (
            <div className="h-3 w-full max-w-md rounded-full bg-gray-800">
              <div
                className={`h-3 rounded-full transition-all ${usageColor}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Tier: <span className="font-medium text-gray-300 capitalize">{usage.tier}</span>
            {usage.monthlyLimit && ` | ${usagePercent}% used`}
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{playerCount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Games Configured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{games.length}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{coupons.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Games */}
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-100">Games ({games.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {games.length === 0 ? (
            <p className="text-sm text-gray-500">No games configured.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-3 py-2 font-medium text-gray-400">Name</th>
                    <th className="px-3 py-2 font-medium text-gray-400">Type</th>
                    <th className="px-3 py-2 font-medium text-gray-400">Status</th>
                    <th className="px-3 py-2 font-medium text-gray-400">Plays</th>
                    <th className="px-3 py-2 font-medium text-gray-400">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((g) => (
                    <tr key={g.id} className="border-b border-gray-800/50">
                      <td className="px-3 py-2 text-gray-200">{g.name}</td>
                      <td className="px-3 py-2 text-gray-400 capitalize">{g.type.replace('_', ' ')}</td>
                      <td className="px-3 py-2">
                        <StatusBadge status={g.status} />
                      </td>
                      <td className="px-3 py-2 text-gray-300">{g.playsCount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-gray-500 text-xs">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Coupons */}
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-100">Recent Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <p className="text-sm text-gray-500">No coupons generated.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-3 py-2 font-medium text-gray-400">Code</th>
                    <th className="px-3 py-2 font-medium text-gray-400">Prize</th>
                    <th className="px-3 py-2 font-medium text-gray-400">Status</th>
                    <th className="px-3 py-2 font-medium text-gray-400">Valid Until</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.slice(0, 20).map((cp) => (
                    <tr key={cp.id} className="border-b border-gray-800/50">
                      <td className="px-3 py-2 font-mono text-gray-200 text-xs">{cp.code}</td>
                      <td className="px-3 py-2 text-gray-300">{cp.prizeName}</td>
                      <td className="px-3 py-2">
                        <StatusBadge status={cp.status} />
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs">
                        {new Date(cp.validUntil).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTAs */}
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-100">CTAs ({ctaList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {ctaList.length === 0 ? (
            <p className="text-sm text-gray-500">No CTAs configured.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {ctaList.map((ct) => (
                <span
                  key={ct.id}
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                    ct.enabled
                      ? 'bg-green-900/30 text-green-300'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {ct.type.replace(/_/g, ' ')} (w:{ct.weight})
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-900/30 text-green-300',
    draft: 'bg-gray-800 text-gray-400',
    paused: 'bg-yellow-900/30 text-yellow-300',
    ended: 'bg-red-900/30 text-red-300',
    redeemed: 'bg-blue-900/30 text-blue-300',
    expired: 'bg-red-900/30 text-red-300',
    revoked: 'bg-gray-800 text-gray-500',
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
        colors[status] ?? 'bg-gray-800 text-gray-400'
      }`}
    >
      {status}
    </span>
  )
}
