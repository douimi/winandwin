'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { TIER_LIMITS } from '@winandwin/shared'

const tierAccentColors: Record<string, { border: string; badge: string; bg: string }> = {
  free: { border: 'border-slate-700', badge: 'bg-slate-700 text-slate-300', bg: 'bg-slate-900' },
  starter: { border: 'border-blue-800/50', badge: 'bg-blue-900/50 text-blue-300', bg: 'bg-slate-900' },
  pro: { border: 'border-purple-800/50', badge: 'bg-purple-900/50 text-purple-300', bg: 'bg-slate-900' },
  enterprise: { border: 'border-amber-800/50', badge: 'bg-amber-900/50 text-amber-300', bg: 'bg-slate-900' },
}

function formatLimit(value: number): string {
  if (value === Number.POSITIVE_INFINITY) return 'Unlimited'
  return value.toLocaleString()
}

export default function AdminSettingsPage() {
  const tiers = Object.entries(TIER_LIMITS) as [
    string,
    (typeof TIER_LIMITS)[keyof typeof TIER_LIMITS],
  ][]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-100">Platform Settings</h1>

      {/* Tier Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {tiers.map(([name, limits]) => {
          const defaultAccent = { border: 'border-slate-700', badge: 'bg-slate-700 text-slate-300', bg: 'bg-slate-900' }
          const accent = tierAccentColors[name] ?? defaultAccent
          return (
            <Card key={name} className={`${accent.border} ${accent.bg} overflow-hidden`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-100 capitalize">{name}</CardTitle>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${accent.badge}`}>
                    {name}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <LimitRow label="Monthly Plays" value={formatLimit(limits.monthlyPlays)} />
                  <LimitRow label="Game Types" value={limits.gameTypes.join(', ')} />
                  <LimitRow label="Max Prizes" value={formatLimit(limits.maxPrizes)} />
                  <LimitRow label="Max CTAs" value={formatLimit(limits.maxCtas)} />
                  <LimitRow label="Max Locations" value={formatLimit(limits.maxLocations)} />
                  <LimitRow
                    label="A/B Testing"
                    value={limits.abTesting ? 'Yes' : 'No'}
                    valueColor={limits.abTesting ? 'text-emerald-400' : 'text-slate-500'}
                  />
                  <LimitRow
                    label="API Access"
                    value={limits.apiAccess === false ? 'None' : String(limits.apiAccess)}
                  />
                  <LimitRow label="Analytics" value={String(limits.analytics)} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Note */}
      <Card className="border-amber-900/30 bg-amber-950/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">{'\u26A0\uFE0F'}</span>
            <div>
              <p className="text-sm font-medium text-amber-300">Read-only configuration</p>
              <p className="mt-1 text-sm text-amber-300/70">
                Tier limits are defined as constants in{' '}
                <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-indigo-300">
                  packages/shared/src/constants/index.ts
                </code>.
                Contact the developer to modify tier limits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LimitRow({
  label,
  value,
  valueColor = 'text-slate-200',
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-medium capitalize ${valueColor}`}>{value}</span>
    </div>
  )
}
