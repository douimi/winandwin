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

const tierAccentColors: Record<string, { border: string; badge: string; bg: string }> = {
  free: { border: 'border-slate-700', badge: 'bg-slate-700 text-slate-300', bg: 'bg-slate-900' },
  starter: { border: 'border-blue-800/50', badge: 'bg-blue-900/50 text-blue-300', bg: 'bg-slate-900' },
  pro: { border: 'border-purple-800/50', badge: 'bg-purple-900/50 text-purple-300', bg: 'bg-slate-900' },
  enterprise: { border: 'border-amber-800/50', badge: 'bg-amber-900/50 text-amber-300', bg: 'bg-slate-900' },
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
      // Settings may not exist yet, fall back to constants
    } finally {
      setLoading(false)
    }
  }

  // Get effective tier limits: from DB or fallback to constants
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
      // Build updated tier limits
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
        <Card>
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
        <h1 className="text-2xl font-bold text-slate-100">Platform Settings</h1>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving}>
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
          const defaultAccent = { border: 'border-slate-700', badge: 'bg-slate-700 text-slate-300', bg: 'bg-slate-900' }
          const accent = tierAccentColors[name] ?? defaultAccent
          const monthlyPlays = getMonthlyPlays(name)
          const isEdited = `${name}.monthlyPlays` in editedValues

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
                  <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-sm text-slate-400">Monthly Plays</span>
                    <input
                      type="number"
                      value={monthlyPlays}
                      onChange={(e) => handleMonthlyPlaysChange(name, e.target.value)}
                      className={`w-28 rounded border px-2 py-1 text-right text-sm font-medium ${
                        isEdited
                          ? 'border-indigo-500 bg-indigo-950/30 text-indigo-300'
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
