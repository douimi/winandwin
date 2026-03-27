import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { fetchAdminMerchants, type AdminMerchantRow } from '@/lib/admin-api'
import { MerchantSearch } from './merchant-search'

export default async function AdminMerchantsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  let merchants: AdminMerchantRow[] = []
  let apiOffline = false

  try {
    merchants = await fetchAdminMerchants(search)
  } catch {
    apiOffline = true
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Merchants</h1>
        {apiOffline && (
          <span className="rounded-full bg-yellow-900/50 px-2.5 py-0.5 text-xs font-medium text-yellow-300">
            API offline
          </span>
        )}
      </div>

      <MerchantSearch defaultValue={search ?? ''} />

      <Card className="border-gray-800 bg-gray-900 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 font-medium text-gray-400">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Category</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Tier</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Players</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Total Plays</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Monthly Usage</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {merchants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {apiOffline ? 'Unable to load merchants.' : 'No merchants found.'}
                    </td>
                  </tr>
                ) : (
                  merchants.map((m) => {
                    const usagePercent = m.monthlyLimit
                      ? Math.round((m.playsThisMonth / m.monthlyLimit) * 100)
                      : 0
                    const usageColor =
                      usagePercent > 90
                        ? 'text-red-400'
                        : usagePercent > 70
                          ? 'text-yellow-400'
                          : 'text-green-400'

                    return (
                      <tr
                        key={m.id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <a
                            href={`/admin/merchants/${m.id}`}
                            className="font-medium text-gray-200 hover:text-purple-300 hover:underline"
                          >
                            {m.name}
                          </a>
                          <p className="text-xs text-gray-500">{m.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-300 capitalize">
                            {m.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <TierBadge tier={m.subscriptionTier} />
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {m.totalPlayers.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {m.totalGamesPlayed.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${usageColor}`}>
                              {m.playsThisMonth.toLocaleString()}
                            </span>
                            <span className="text-gray-600">/</span>
                            <span className="text-gray-500">
                              {m.monthlyLimit ? m.monthlyLimit.toLocaleString() : 'Unlimited'}
                            </span>
                          </div>
                          {m.monthlyLimit && (
                            <div className="mt-1 h-1.5 w-full max-w-[100px] rounded-full bg-gray-800">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  usagePercent > 90
                                    ? 'bg-red-500'
                                    : usagePercent > 70
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
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

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    free: 'bg-gray-700 text-gray-300',
    starter: 'bg-blue-900/50 text-blue-300',
    pro: 'bg-purple-900/50 text-purple-300',
    enterprise: 'bg-amber-900/50 text-amber-300',
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${
        colors[tier] ?? colors.free
      }`}
    >
      {tier}
    </span>
  )
}
