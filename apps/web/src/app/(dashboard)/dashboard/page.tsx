import {
  fetchStatsOverview,
  fetchGames,
  fetchUsageStats,
  fetchMerchant,
  type StatsOverview,
  type GameWithStats,
  type UsageStats,
} from '@/lib/api'
import { requireSessionWithMerchant } from '@/lib/session'
import { DashboardOverview } from './dashboard-client'

export default async function DashboardPage() {
  const { merchantId } = await requireSessionWithMerchant()

  let stats: StatsOverview | null = null
  let games: GameWithStats[] = []
  let usage: UsageStats | null = null
  let apiOffline = false
  let merchantTier = 'free'

  if (merchantId) {
    try {
      const [statsData, gamesData, usageData, merchantData] = await Promise.all([
        fetchStatsOverview(merchantId).catch(() => null),
        fetchGames(merchantId).catch(() => [] as GameWithStats[]),
        fetchUsageStats(merchantId).catch(() => null),
        fetchMerchant(merchantId).catch(() => null),
      ])
      stats = statsData
      games = gamesData
      usage = usageData
      if (merchantData) merchantTier = merchantData.subscriptionTier
    } catch {
      apiOffline = true
    }
  }

  return (
    <DashboardOverview
      stats={stats}
      games={games}
      usage={usage}
      apiOffline={apiOffline}
      merchantTier={merchantTier}
    />
  )
}
