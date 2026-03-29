'use client'

import { useState } from 'react'
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
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null)
  const [confirming, setConfirming] = useState(false)

  async function handleSave() {
    if (tier === currentTier) return

    if (!confirming) {
      setConfirming(true)
      return
    }

    setSaving(true)
    setMessage(null)
    setConfirming(false)

    const result = await changeMerchantTier(merchantId, tier)
    setMessage({ text: result.message, success: result.success })

    if (result.success) {
      setTimeout(() => window.location.reload(), 800)
    }

    setSaving(false)
  }

  function handleCancel() {
    setTier(currentTier)
    setConfirming(false)
    setMessage(null)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <label htmlFor="tier-select" className="text-sm font-medium text-gray-500">
          Tier:
        </label>
        <select
          id="tier-select"
          value={tier}
          onChange={(e) => {
            setTier(e.target.value)
            setConfirming(false)
            setMessage(null)
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium capitalize text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
        >
          {TIERS.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t}
            </option>
          ))}
        </select>
        {tier !== currentTier && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                confirming
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {saving ? 'Saving...' : confirming ? 'Confirm Change' : 'Save'}
            </button>
            {confirming && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
      {confirming && !saving && (
        <p className="text-xs text-yellow-600">
          Are you sure? This will change the tier from <span className="font-semibold capitalize">{currentTier}</span> to <span className="font-semibold capitalize">{tier}</span>.
        </p>
      )}
      {message && (
        <p className={`text-xs font-medium ${message.success ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}
