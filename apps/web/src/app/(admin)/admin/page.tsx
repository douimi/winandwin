import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { fetchAdminStats, type AdminStats } from '@/lib/admin-api'

export default async function AdminOverviewPage() {
  let stats: AdminStats | null = null
  let apiOffline = false

  try {
    stats = await fetchAdminStats()
  } catch {
    apiOffline = true
  }

  const kpis = [
    {
      title: 'Total Merchants',
      value: stats?.totalMerchants ?? 0,
      sub: `+${stats?.newMerchantsThisWeek ?? 0} this week`,
    },
    {
      title: 'Total Players',
      value: stats?.totalPlayers ?? 0,
      sub: 'across all merchants',
    },
    {
      title: 'Games Played Today',
      value: stats?.gamesPlayedToday ?? 0,
      sub: `${stats?.gamesPlayedThisWeek ?? 0} this week`,
    },
    {
      title: 'Games This Month',
      value: stats?.gamesPlayedThisMonth ?? 0,
      sub: 'all merchants combined',
    },
    {
      title: 'Coupons Generated',
      value: stats?.totalCouponsGenerated ?? 0,
      sub: `${stats?.totalCouponsRedeemed ?? 0} redeemed`,
    },
    {
      title: 'Revenue',
      value: `$${stats?.revenue ?? 0}`,
      sub: 'placeholder',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-100">Platform Overview</h1>
        {apiOffline && (
          <span className="rounded-full bg-yellow-900/50 px-2.5 py-0.5 text-xs font-medium text-yellow-300">
            API offline
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-gray-800 bg-gray-900 text-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-50">
                {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
              </div>
              <p className="mt-1 text-xs text-gray-500">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Merchants */}
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-100">Top 5 Merchants This Week</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.topMerchants && stats.topMerchants.length > 0 ? (
            <div className="space-y-3">
              {stats.topMerchants.map((m, i) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600/20 text-sm font-bold text-purple-300">
                      {i + 1}
                    </span>
                    <a
                      href={`/admin/merchants/${m.id}`}
                      className="text-sm font-medium text-gray-200 hover:text-purple-300 hover:underline"
                    >
                      {m.name}
                    </a>
                  </div>
                  <span className="text-sm font-semibold text-gray-300">
                    {m.plays.toLocaleString()} plays
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No plays this week yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
