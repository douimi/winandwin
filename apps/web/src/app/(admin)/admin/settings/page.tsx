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

const tierAccentColors: Record<string, { gradient: string; border: string; badge: string; icon: string }> = {
  free: { gradient: 'from-slate-600 to-slate-500', border: 'border-slate-700', badge: 'bg-gradient-to-r from-slate-600 to-slate-500 text-white', icon: '\uD83C\uDD93' },
  starter: { gradient: 'from-blue-600 to-blue-500', border: 'border-blue-800/50', badge: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white', icon: '\uD83D\uDE80' },
  pro: { gradient: 'from-purple-600 to-purple-500', border: 'border-purple-800/50', badge: 'bg-gradient-to-r from-purple-600 to-purple-500 text-white', icon: '\u2B50' },
  enterprise: { gradient: 'from-amber-600 to-amber-500', border: 'border-amber-800/50', badge: 'bg-gradient-to-r from-amber-600 to-amber-500 text-white', icon: '\uD83D\uDC8E' },
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
        <h1 className="text-2xl font-bold text-slate-100">Platform Settings</h1>
        <Card className="border-slate-800 bg-slate-900">
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-slate-400">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Platform Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Configure tier limits and platform-wide settings</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {feedback && (
        <Card className={feedback.type === 'success' ? 'border-green-900/30 bg-green-950/20' : 'border-red-900/30 bg-red-950/20'}>
          <CardContent className="py-3">
            <p className={`text-sm font-medium ${feedback.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
              {feedback.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tier Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {(['free', 'starter', 'pro', 'enterprise'] as const).map((name) => {
          const accent = (tierAccentColors[name] ?? tierAccentColors.free)!
          const monthlyPlays = getMonthlyPlays(name)
          const isEdited = `${name}.monthlyPlays` in editedValues

          return (
            <Card key={name} className={`${accent.border} bg-slate-900 overflow-hidden`}>
              {/* Gradient header strip */}
              <div className={`h-1.5 bg-gradient-to-r ${accent.gradient}`} />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{accent.icon}</span>
                    <CardTitle className="text-slate-100 capitalize text-lg">{name}</CardTitle>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize shadow-sm ${accent.badge}`}>
                    {name}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-slate-800/30 px-4 py-3">
                    <span className="text-sm font-medium text-slate-300">Monthly Plays Limit</span>
                    <input
                      type="number"
                      value={monthlyPlays}
                      onChange={(e) => handleMonthlyPlaysChange(name, e.target.value)}
                      className={`w-28 rounded-lg border px-3 py-1.5 text-right text-sm font-semibold transition-colors ${
                        isEdited
                          ? 'border-indigo-500 bg-indigo-950/30 text-indigo-300 shadow-sm shadow-indigo-500/10'
                          : 'border-slate-700 bg-slate-800 text-slate-200'
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
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">{'\u2139\uFE0F'}</span>
            <div>
              <p className="text-sm font-medium text-slate-300">Database-backed configuration</p>
              <p className="mt-1 text-sm text-slate-400">
                Tier limits are stored in the <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-indigo-300">platform_settings</code> table.
                Changes take effect within 5 minutes. Hardcoded defaults from constants are used as fallback.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
