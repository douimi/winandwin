'use client'

import { Card, CardContent, CardHeader, CardTitle, Button } from '@winandwin/ui'
import { useEffect, useState } from 'react'
import { adminRequest } from '@/lib/admin-api'

interface TierConfig {
  monthlyPlays: number
  [key: string]: unknown
}

interface PlatformSetting {
  key: string
  value: unknown
  updatedAt: string
}

const TIER_NAMES = ['free', 'starter', 'pro', 'enterprise'] as const

const TIER_DEFAULTS: Record<string, TierConfig> = {
  free: { monthlyPlays: 200 },
  starter: { monthlyPlays: 2000 },
  pro: { monthlyPlays: 20000 },
  enterprise: { monthlyPlays: 999999 },
}

const tierAccentColors: Record<string, { topBorder: string; icon: string; badge: string }> = {
  free: { topBorder: 'border-t-gray-400', icon: '\uD83C\uDD93', badge: 'border-gray-300 text-gray-600 bg-white' },
  starter: { topBorder: 'border-t-blue-500', icon: '\uD83D\uDE80', badge: 'border-blue-300 text-blue-700 bg-white' },
  pro: { topBorder: 'border-t-indigo-500', icon: '\u2B50', badge: 'border-indigo-300 text-indigo-700 bg-white' },
  enterprise: { topBorder: 'border-t-amber-500', icon: '\uD83D\uDC8E', badge: 'border-amber-300 text-amber-700 bg-white' },
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([])
  const [tierLimits, setTierLimits] = useState<Record<string, TierConfig> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [editedTierValues, setEditedTierValues] = useState<Record<string, number>>({})

  // Platform settings
  const [defaultAtmosphere, setDefaultAtmosphere] = useState('')
  const [siteName, setSiteName] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [editedPlatform, setEditedPlatform] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    try {
      const data = await adminRequest<PlatformSetting[]>('/api/v1/admin/settings')
      setSettings(data)

      // Load tier limits from DB
      const tierSetting = data.find((s) => s.key === 'tier_limits')
      if (tierSetting && tierSetting.value) {
        setTierLimits(tierSetting.value as Record<string, TierConfig>)
      }

      // Load platform settings
      const atmosphereSetting = data.find((s) => s.key === 'default_atmosphere')
      if (atmosphereSetting) setDefaultAtmosphere(atmosphereSetting.value as string)

      const siteNameSetting = data.find((s) => s.key === 'site_name')
      if (siteNameSetting) setSiteName(siteNameSetting.value as string)

      const supportSetting = data.find((s) => s.key === 'support_email')
      if (supportSetting) setSupportEmail(supportSetting.value as string)
    } catch {
      // Settings may not exist yet
    } finally {
      setLoading(false)
    }
  }

  // Tier limits from DB first, then defaults
  function getEffectiveTierConfig(tier: string): TierConfig {
    if (tierLimits && tierLimits[tier]) {
      return tierLimits[tier]
    }
    return TIER_DEFAULTS[tier] ?? { monthlyPlays: 200 }
  }

  function handleMonthlyPlaysChange(tier: string, value: string) {
    const num = Number.parseInt(value, 10)
    if (!Number.isNaN(num) && num >= 0) {
      setEditedTierValues((prev) => ({ ...prev, [`${tier}.monthlyPlays`]: num }))
    }
  }

  function getMonthlyPlays(tier: string): number {
    const editKey = `${tier}.monthlyPlays`
    if (editKey in editedTierValues) return editedTierValues[editKey] ?? 200
    return getEffectiveTierConfig(tier).monthlyPlays
  }

  async function handleSaveTierLimits() {
    if (Object.keys(editedTierValues).length === 0) return

    setSaving(true)
    setFeedback(null)

    try {
      const updated: Record<string, TierConfig> = {}
      for (const tier of TIER_NAMES) {
        const existing = getEffectiveTierConfig(tier)
        updated[tier] = {
          ...existing,
          monthlyPlays: getMonthlyPlays(tier),
        }
      }

      await adminRequest('/api/v1/admin/settings/tier_limits', {
        method: 'PATCH',
        body: JSON.stringify({ value: updated }),
      })

      setTierLimits(updated)
      setEditedTierValues({})
      setFeedback({ type: 'success', message: 'Tier limits saved successfully' })
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save tier limits' })
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePlatformSettings() {
    setSaving(true)
    setFeedback(null)

    try {
      const promises: Promise<unknown>[] = []

      if (defaultAtmosphere) {
        promises.push(
          adminRequest('/api/v1/admin/settings/default_atmosphere', {
            method: 'PATCH',
            body: JSON.stringify({ value: defaultAtmosphere }),
          }),
        )
      }

      if (siteName) {
        promises.push(
          adminRequest('/api/v1/admin/settings/site_name', {
            method: 'PATCH',
            body: JSON.stringify({ value: siteName }),
          }),
        )
      }

      if (supportEmail) {
        promises.push(
          adminRequest('/api/v1/admin/settings/support_email', {
            method: 'PATCH',
            body: JSON.stringify({ value: supportEmail }),
          }),
        )
      }

      await Promise.all(promises)
      setEditedPlatform(false)
      setFeedback({ type: 'success', message: 'Platform settings saved successfully' })
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const hasTierChanges = Object.keys(editedTierValues).length > 0
  const dataSource = tierLimits ? 'Database' : 'Default (no DB values found)'

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
          <CardContent className="flex items-center justify-center py-12">
            <div className="space-y-3 w-full max-w-md">
              <div className="h-6 w-48 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Configure tier limits and platform-wide settings</p>
        </div>
        <button
          type="button"
          onClick={loadSettings}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      {feedback && (
        <Card className={`rounded-xl ${feedback.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${feedback.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {feedback.message}
              </p>
              <button type="button" onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">{'\u2715'}</button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tier Limits Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tier Limits</h2>
            <p className="text-sm text-gray-500">
              Source: <span className="font-medium text-indigo-600">{dataSource}</span>
            </p>
          </div>
          {hasTierChanges && (
            <Button onClick={handleSaveTierLimits} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
              {saving ? 'Saving...' : 'Save Tier Limits'}
            </Button>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {TIER_NAMES.map((name) => {
            const accent = tierAccentColors[name] ?? tierAccentColors.free!
            const monthlyPlays = getMonthlyPlays(name)
            const isEdited = `${name}.monthlyPlays` in editedTierValues

            return (
              <Card key={name} className={`border border-gray-200 bg-white shadow-sm rounded-xl overflow-hidden border-t-2 ${accent.topBorder}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{accent.icon}</span>
                      <CardTitle className="text-gray-900 capitalize text-lg">{name}</CardTitle>
                    </div>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${accent.badge}`}>
                      {name}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                      <span className="text-sm font-medium text-gray-600">Monthly Plays Limit</span>
                      <input
                        type="number"
                        value={monthlyPlays}
                        onChange={(e) => handleMonthlyPlaysChange(name, e.target.value)}
                        className={`w-28 rounded-lg border px-3 py-1.5 text-right text-sm font-semibold transition-colors ${
                          isEdited
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-900'
                        }`}
                        min={0}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Platform-Wide Settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Platform Settings</h2>
            <p className="text-sm text-gray-500">Global configuration for the platform</p>
          </div>
          {editedPlatform && (
            <Button onClick={handleSavePlatformSettings} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
              {saving ? 'Saving...' : 'Save Platform Settings'}
            </Button>
          )}
        </div>

        <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
          <CardContent className="py-6">
            <div className="space-y-5 max-w-lg">
              {/* Default Atmosphere */}
              <div className="space-y-1.5">
                <label htmlFor="default-atmosphere" className="block text-sm font-medium text-gray-700">
                  Default Atmosphere for New Merchants
                </label>
                <select
                  id="default-atmosphere"
                  value={defaultAtmosphere || 'joyful'}
                  onChange={(e) => {
                    setDefaultAtmosphere(e.target.value)
                    setEditedPlatform(true)
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                >
                  <option value="joyful">Joyful</option>
                  <option value="elegant">Elegant</option>
                  <option value="energetic">Energetic</option>
                  <option value="calm">Calm</option>
                  <option value="festive">Festive</option>
                  <option value="luxury">Luxury</option>
                  <option value="playful">Playful</option>
                  <option value="neon">Neon</option>
                  <option value="custom">Custom</option>
                </select>
                <p className="text-xs text-gray-400">Applied to new merchants when they sign up</p>
              </div>

              {/* Site Name */}
              <div className="space-y-1.5">
                <label htmlFor="site-name" className="block text-sm font-medium text-gray-700">
                  Site Name
                </label>
                <input
                  id="site-name"
                  type="text"
                  value={siteName}
                  onChange={(e) => {
                    setSiteName(e.target.value)
                    setEditedPlatform(true)
                  }}
                  placeholder="Win & Win"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>

              {/* Support Email */}
              <div className="space-y-1.5">
                <label htmlFor="support-email" className="block text-sm font-medium text-gray-700">
                  Support Email
                </label>
                <input
                  id="support-email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => {
                    setSupportEmail(e.target.value)
                    setEditedPlatform(true)
                  }}
                  placeholder="support@winandwin.com"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Info */}
      <Card className="border border-gray-200 bg-gray-50 rounded-xl">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">{'\u2139\uFE0F'}</span>
            <div>
              <p className="text-sm font-medium text-gray-700">Database-backed configuration</p>
              <p className="mt-1 text-sm text-gray-500">
                All settings are stored in the <code className="rounded bg-white border border-gray-200 px-1.5 py-0.5 text-xs text-indigo-600">platform_settings</code> table.
                Changes take effect within 30 seconds. Default values are only used if no database values exist.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
