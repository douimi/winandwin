'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TIERS = ['free', 'starter', 'pro', 'enterprise'] as const

export function TierChanger({
  merchantId,
  currentTier,
}: {
  merchantId: string
  currentTier: string
}) {
  const [tier, setTier] = useState(currentTier)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

  async function handleSave() {
    if (tier === currentTier) return
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch(`${apiBase}/api/v1/admin/merchants/${merchantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
        },
        body: JSON.stringify({ subscriptionTier: tier }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error?.message ?? 'Failed to update tier')
      }

      setMessage('Tier updated successfully')
      router.refresh()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to update tier')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="tier-select" className="text-sm text-gray-400">
        Tier:
      </label>
      <select
        id="tier-select"
        value={tier}
        onChange={(e) => setTier(e.target.value)}
        className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-200 capitalize"
      >
        {TIERS.map((t) => (
          <option key={t} value={t} className="capitalize">
            {t}
          </option>
        ))}
      </select>
      {tier !== currentTier && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      )}
      {message && (
        <span className="text-xs text-gray-400">{message}</span>
      )}
    </div>
  )
}
