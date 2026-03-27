'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { changeMerchantTier } from './actions'

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

  async function handleSave() {
    if (tier === currentTier) return
    setSaving(true)
    setMessage(null)

    const result = await changeMerchantTier(merchantId, tier)
    setMessage(result.message)

    if (result.success) {
      router.refresh()
    }

    setSaving(false)
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
