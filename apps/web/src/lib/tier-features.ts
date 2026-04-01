type Tier = 'free' | 'starter' | 'pro' | 'enterprise'

const TIER_FEATURES: Record<string, Tier[]> = {
  'analytics.funnel': ['pro', 'enterprise'],
  'analytics.topActions': ['pro', 'enterprise'],
  'analytics.prizePopularity': ['pro', 'enterprise'],
  'analytics.weeklyChart': ['pro', 'enterprise'],
  'analytics.periodSelector': ['pro', 'enterprise'],
  'players.export': ['pro', 'enterprise'],
  'branding.customAtmosphere': ['pro', 'enterprise'],
  'game.description': ['pro', 'enterprise'],
  'game.ctaReplay': ['pro', 'enterprise'],
}

export function hasFeature(tier: string | undefined, feature: string): boolean {
  const allowed = TIER_FEATURES[feature]
  if (!allowed) return true // feature not restricted = available to all
  return allowed.includes((tier ?? 'free') as Tier)
}
