'use client'

import { Card, CardContent, CardHeader, CardTitle, Button } from '@winandwin/ui'
import { useEffect, useState } from 'react'
import { adminRequest } from '@/lib/admin-api'
import { useAdmin } from '../../admin-lang-context'

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

const tierAccentColors: Record<string, { topBorder: string; badge: string }> = {
  free: { topBorder: 'border-t-slate-400', badge: 'border-slate-200 text-slate-600 bg-card' },
  starter: { topBorder: 'border-t-sky-500', badge: 'border-sky-200 text-sky-700 bg-card' },
  pro: { topBorder: 'border-t-primary', badge: 'border-primary/30 text-primary bg-card' },
  enterprise: { topBorder: 'border-t-amber-500', badge: 'border-amber-200 text-amber-700 bg-card' },
}

export default function AdminSettingsPage() {
  const { txt } = useAdmin()
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

  // Public sign-up toggle. `null` while we're still loading so the switch
  // stays disabled + non-interactive until we know its real state.
  const [publicSignupEnabled, setPublicSignupEnabled] = useState<boolean | null>(null)
  const [signupToggleSaving, setSignupToggleSaving] = useState(false)

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

      // Public sign-up flag. Missing row → default to enabled so a fresh
      // Neon instance still allows sign-ups until an admin explicitly turns
      // it off. Accept boolean or "false"/"true" string values from the DB.
      const signupSetting = data.find((s) => s.key === 'public_signup_enabled')
      if (signupSetting === undefined) {
        setPublicSignupEnabled(true)
      } else {
        const raw = signupSetting.value
        if (typeof raw === 'boolean') setPublicSignupEnabled(raw)
        else if (typeof raw === 'string') setPublicSignupEnabled(raw !== 'false')
        else setPublicSignupEnabled(true)
      }
    } catch {
      // Settings may not exist yet
      setPublicSignupEnabled(true)
    } finally {
      setLoading(false)
    }
  }

  async function togglePublicSignup(nextValue: boolean) {
    setSignupToggleSaving(true)
    setFeedback(null)
    // Optimistic update so the pill flips immediately.
    setPublicSignupEnabled(nextValue)
    try {
      await adminRequest('/api/v1/admin/settings/public_signup_enabled', {
        method: 'PATCH',
        body: JSON.stringify({ value: nextValue }),
      })
      setFeedback({ type: 'success', message: txt.settingsSignupFeedbackSaved })
    } catch (err) {
      // Revert on error
      setPublicSignupEnabled(!nextValue)
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : txt.settingsSignupFeedbackFail,
      })
    } finally {
      setSignupToggleSaving(false)
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
      setFeedback({ type: 'success', message: txt.settingsFeedbackTierSaved })
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : txt.settingsFeedbackTierFail })
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
      setFeedback({ type: 'success', message: txt.settingsFeedbackPlatformSaved })
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : txt.settingsFeedbackPlatformFail })
    } finally {
      setSaving(false)
    }
  }

  const hasTierChanges = Object.keys(editedTierValues).length > 0
  const dataSource = tierLimits ? txt.settingsTierSectionSourceDb : txt.settingsTierSectionSourceDefault

  const tierDisplayName: Record<(typeof TIER_NAMES)[number], string> = {
    free: txt.tierFree,
    starter: txt.tierStarter,
    pro: txt.tierPro,
    enterprise: txt.tierEnterprise,
  }

  const atmosphereLabels: Record<string, string> = {
    joyful: txt.atmosphereJoyful,
    elegant: txt.atmosphereElegant,
    energetic: txt.atmosphereEnergetic,
    calm: txt.atmosphereCalm,
    festive: txt.atmosphereFestive,
    luxury: txt.atmosphereLuxury,
    playful: txt.atmospherePlayful,
    neon: txt.atmosphereNeon,
    custom: txt.atmosphereCustom,
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">{txt.settingsTitle}</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">{txt.settingsTitle}</h1>
          <p className="mt-1 text-sm text-gray-500">{txt.settingsSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={loadSettings}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {txt.commonRefresh}
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

      {/* Public sign-up toggle \u2014 placed above tier limits so admins see the
          most consequential switch first. Flipping it here immediately
          changes what /sign-up and /onboarding render across the site. */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{txt.settingsSignupSectionTitle}</h2>
          <p className="text-sm text-gray-500">{txt.settingsSignupSectionSubtitle}</p>
        </div>

        <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm rounded-xl">
          <CardContent className="py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{txt.settingsSignupToggleLabel}</p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      publicSignupEnabled
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {publicSignupEnabled ? txt.settingsSignupBadgeOn : txt.settingsSignupBadgeOff}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {publicSignupEnabled ? txt.settingsSignupToggleDescOn : txt.settingsSignupToggleDescOff}
                </p>
              </div>

              {/* Toggle switch \u2014 pill with sliding thumb, same vocabulary as
                  the merchant-disable switch on the Merchants list */}
              <button
                type="button"
                role="switch"
                aria-checked={publicSignupEnabled ?? undefined}
                disabled={publicSignupEnabled === null || signupToggleSaving}
                onClick={() => togglePublicSignup(!publicSignupEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  publicSignupEnabled ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    publicSignupEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Limits Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{txt.settingsTierSectionTitle}</h2>
            <p className="text-sm text-gray-500">
              {txt.settingsTierSectionSource} <span className="font-medium text-primary">{dataSource}</span>
            </p>
          </div>
          {hasTierChanges && (
            <Button onClick={handleSaveTierLimits} disabled={saving} className="font-semibold">
              {saving ? txt.commonSaving : txt.settingsTierSaveButton}
            </Button>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {TIER_NAMES.map((name) => {
            const accent = tierAccentColors[name] ?? tierAccentColors.free!
            const monthlyPlays = getMonthlyPlays(name)
            const isEdited = `${name}.monthlyPlays` in editedTierValues

            return (
              <Card key={name} className={`overflow-hidden border-t-2 ${accent.topBorder}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tierDisplayName[name]}</CardTitle>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${accent.badge}`}>
                      {tierDisplayName[name]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                      <span className="text-sm font-medium text-muted-foreground">{txt.settingsTierMonthlyPlays}</span>
                      <input
                        type="number"
                        value={monthlyPlays}
                        onChange={(e) => handleMonthlyPlaysChange(name, e.target.value)}
                        className={`w-28 rounded-lg border px-3 py-1.5 text-right text-sm font-semibold transition-colors ${
                          isEdited
                            ? 'border-primary bg-primary/5 text-primary shadow-xs'
                            : 'border-border bg-card text-foreground'
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
            <h2 className="text-lg font-bold text-gray-900">{txt.settingsPlatformSectionTitle}</h2>
            <p className="text-sm text-gray-500">{txt.settingsPlatformSectionSubtitle}</p>
          </div>
          {editedPlatform && (
            <Button onClick={handleSavePlatformSettings} disabled={saving} className="font-semibold">
              {saving ? txt.commonSaving : txt.settingsPlatformSaveButton}
            </Button>
          )}
        </div>

        <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
          <CardContent className="py-6">
            <div className="space-y-5 max-w-lg">
              {/* Default Atmosphere */}
              <div className="space-y-1.5">
                <label htmlFor="default-atmosphere" className="block text-sm font-medium text-gray-700">
                  {txt.settingsPlatformDefaultAtmosphere}
                </label>
                <select
                  id="default-atmosphere"
                  value={defaultAtmosphere || 'joyful'}
                  onChange={(e) => {
                    setDefaultAtmosphere(e.target.value)
                    setEditedPlatform(true)
                  }}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {Object.entries(atmosphereLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400">{txt.settingsPlatformAtmosphereHelp}</p>
              </div>

              {/* Site Name */}
              <div className="space-y-1.5">
                <label htmlFor="site-name" className="block text-sm font-medium text-gray-700">
                  {txt.settingsPlatformSiteName}
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
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>

              {/* Support Email */}
              <div className="space-y-1.5">
                <label htmlFor="support-email" className="block text-sm font-medium text-gray-700">
                  {txt.settingsPlatformSupportEmail}
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
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
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
              <p className="text-sm font-medium text-gray-700">{txt.settingsSourceInfoTitle}</p>
              <p className="mt-1 text-sm text-gray-500">{txt.settingsSourceInfoBody}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
