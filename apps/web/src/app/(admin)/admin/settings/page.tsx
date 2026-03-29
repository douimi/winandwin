'use client'

import { Card, CardContent, CardHeader, CardTitle, Button } from '@winandwin/ui'
import { TIER_LIMITS } from '@winandwin/shared'
import { useEffect, useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''

interface TierLimits {
  free: { monthlyPlays: number; maxPrizes?: number; maxCtas?: number }
  starter: { monthlyPlays: number; maxPrizes?: number }
  pro: { monthlyPlays: number }
  enterprise: { monthlyPlays: number }
}

interface PlatformSetting {
  key: string
  value: unknown
  updatedAt: string
}

const tierAccentColors: Record<string, { topBorder: string; icon: string; badge: string }> = {
  free: { topBorder: 'border-t-gray-400', icon: '\uD83C\uDD93', badge: 'border-gray-300 text-gray-600 bg-white' },
  starter: { topBorder: 'border-t-blue-500', icon: '\uD83D\uDE80', badge: 'border-blue-300 text-blue-700 bg-white' },
  pro: { topBorder: 'border-t-indigo-500', icon: '\u2B50', badge: 'border-indigo-300 text-indigo-700 bg-white' },
  enterprise: { topBorder: 'border-t-amber-500', icon: '\uD83D\uDC8E', badge: 'border-amber-300 text-amber-700 bg-white' },
}

async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_KEY,
      ...(options.headers as Record<string, string> | undefined),
    },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message || 'Request failed')
  return json.data
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([])
  const [tierLimits, setTierLimits] = useState<TierLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [editedValues, setEditedValues] = useState<Record<string, number>>({})

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const data = await adminRequest<PlatformSetting[]>('/api/v1/admin/settings')
      setSettings(data)
      const tierSetting = data.find((s) => s.key === 'tier_limits')
      if (tierSetting) {
        setTierLimits(tierSetting.value as TierLimits)
      }
    } catch {
      // Settings may not exist yet
    } finally {
      setLoading(false)
    }
  }

  const effectiveTiers = tierLimits || {
    free: { monthlyPlays: (TIER_LIMITS as Record<string, { monthlyPlays: number }>).free?.monthlyPlays ?? 200 },
    starter: { monthlyPlays: (TIER_LIMITS as Record<string, { monthlyPlays: number }>).starter?.monthlyPlays ?? 2000 },
    pro: { monthlyPlays: (TIER_LIMITS as Record<string, { monthlyPlays: number }>).pro?.monthlyPlays ?? 20000 },
    enterprise: { monthlyPlays: (TIER_LIMITS as Record<string, { monthlyPlays: number }>).enterprise?.monthlyPlays ?? 999999 },
  }

  function handleMonthlyPlaysChange(tier: string, value: string) {
    const num = Number.parseInt(value, 10)
    if (!Number.isNaN(num) && num >= 0) {
      setEditedValues((prev) => ({ ...prev, [`${tier}.monthlyPlays`]: num }))
    }
  }

  function getMonthlyPlays(tier: string): number {
    const editKey = `${tier}.monthlyPlays`
    if (editKey in editedValues) return editedValues[editKey] ?? 200
    const t = effectiveTiers[tier as keyof typeof effectiveTiers]
    return t?.monthlyPlays ?? 200
  }

  async function handleSave() {
    if (Object.keys(editedValues).length === 0) return

    setSaving(true)
    setFeedback(null)

    try {
      const updated: Record<string, Record<string, number>> = {}
      for (const tier of ['free', 'starter', 'pro', 'enterprise']) {
        const existing = effectiveTiers[tier as keyof typeof effectiveTiers] || { monthlyPlays: 200 }
        updated[tier] = {
          ...existing,
          monthlyPlays: getMonthlyPlays(tier),
        }
      }

      await adminRequest('/api/v1/admin/settings/tier_limits', {
        method: 'PATCH',
        body: JSON.stringify({ value: updated }),
      })

      setTierLimits(updated as unknown as TierLimits)
      setEditedValues({})
      setFeedback({ type: 'success', message: 'Settings saved successfully' })
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = Object.keys(editedValues).length > 0

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-500">Loading settings...</p>
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
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {feedback && (
        <Card className={`rounded-xl ${feedback.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="py-3">
            <p className={`text-sm font-medium ${feedback.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {feedback.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tier Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {(['free', 'starter', 'pro', 'enterprise'] as const).map((name) => {
          const accent = tierAccentColors[name] ?? tierAccentColors.free!
          const monthlyPlays = getMonthlyPlays(name)
          const isEdited = `${name}.monthlyPlays` in editedValues

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

      {/* Source Info */}
      <Card className="border border-gray-200 bg-gray-50 rounded-xl">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">{'\u2139\uFE0F'}</span>
            <div>
              <p className="text-sm font-medium text-gray-700">Database-backed configuration</p>
              <p className="mt-1 text-sm text-gray-500">
                Tier limits are stored in the <code className="rounded bg-white border border-gray-200 px-1.5 py-0.5 text-xs text-indigo-600">platform_settings</code> table.
                Changes take effect within 5 minutes. Hardcoded defaults from constants are used as fallback.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
