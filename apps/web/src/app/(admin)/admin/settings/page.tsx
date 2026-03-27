import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@winandwin/ui'
import { TIER_LIMITS } from '@winandwin/shared'

export default function AdminSettingsPage() {
  const tiers = Object.entries(TIER_LIMITS) as [
    string,
    (typeof TIER_LIMITS)[keyof typeof TIER_LIMITS],
  ][]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-100">Platform Settings</h1>

      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-100">Tier Limits</CardTitle>
          <CardDescription className="text-gray-500">
            Current subscription tier configuration. Edit in code for now &mdash;
            these values are defined in{' '}
            <code className="rounded bg-gray-800 px-1 py-0.5 text-xs text-purple-300">
              packages/shared/src/constants/index.ts
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 font-medium text-gray-400">Tier</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Monthly Plays</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Game Types</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Max Prizes</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Max CTAs</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Locations</th>
                  <th className="px-4 py-3 font-medium text-gray-400">A/B Testing</th>
                  <th className="px-4 py-3 font-medium text-gray-400">API Access</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Analytics</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map(([name, limits]) => (
                  <tr key={name} className="border-b border-gray-800/50">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-200 capitalize">{name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {limits.monthlyPlays === Number.POSITIVE_INFINITY
                        ? 'Unlimited'
                        : limits.monthlyPlays.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {limits.gameTypes.join(', ')}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {limits.maxPrizes === Number.POSITIVE_INFINITY
                        ? 'Unlimited'
                        : limits.maxPrizes}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {limits.maxCtas === Number.POSITIVE_INFINITY
                        ? 'Unlimited'
                        : limits.maxCtas}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {limits.maxLocations === Number.POSITIVE_INFINITY
                        ? 'Unlimited'
                        : limits.maxLocations}
                    </td>
                    <td className="px-4 py-3">
                      {limits.abTesting ? (
                        <span className="text-green-400">Yes</span>
                      ) : (
                        <span className="text-gray-600">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs capitalize">
                      {limits.apiAccess === false ? 'None' : limits.apiAccess}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs capitalize">
                      {limits.analytics}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-900/30 bg-amber-950/20">
        <CardContent className="py-4">
          <p className="text-sm text-amber-300">
            <strong>Note:</strong> Tier limits are currently defined as constants in code.
            To modify limits, edit the <code className="rounded bg-gray-800 px-1 py-0.5 text-xs">TIER_LIMITS</code> object
            in <code className="rounded bg-gray-800 px-1 py-0.5 text-xs">packages/shared/src/constants/index.ts</code> and
            redeploy. A database-backed settings system will be added in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
