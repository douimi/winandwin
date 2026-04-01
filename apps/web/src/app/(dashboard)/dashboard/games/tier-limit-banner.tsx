'use client'

import { useEffect, useState } from 'react'
import { fetchMerchant, fetchGames, fetchCtas } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'
import { TIER_LIMITS } from '@winandwin/shared/constants'

interface Props {
  resource: 'games' | 'ctas'
}

export function TierLimitBanner({ resource }: Props) {
  const merchantId = useMerchantId()
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!merchantId) return
    let cancelled = false

    async function check() {
      try {
        const merchant = await fetchMerchant(merchantId)
        const tier = merchant.subscriptionTier as keyof typeof TIER_LIMITS
        const limits = TIER_LIMITS[tier]

        if (resource === 'games') {
          const maxGames = (limits as Record<string, unknown>).maxGames as number | undefined
          if (maxGames && maxGames !== Infinity) {
            const gamesList = await fetchGames(merchantId)
            if (!cancelled && gamesList.length >= maxGames) {
              setMessage(
                `You've reached the maximum of ${maxGames} game${maxGames !== 1 ? 's' : ''} for your ${tier} plan. Upgrade to add more.`,
              )
            }
          }
        } else if (resource === 'ctas') {
          const maxCtas = limits.maxCtas as number
          if (maxCtas !== Infinity) {
            const ctasList = await fetchCtas(merchantId)
            if (!cancelled && ctasList.length >= maxCtas) {
              setMessage(
                `You've reached the maximum of ${maxCtas} CTA${maxCtas !== 1 ? 's' : ''} for your ${tier} plan. Upgrade to add more.`,
              )
            }
          }
        }
      } catch {
        // Silently fail -- banner is non-critical
      }
    }

    check()
    return () => { cancelled = true }
  }, [merchantId, resource])

  if (!message) return null

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {message}{' '}
      <a href="/dashboard/upgrade" className="font-medium underline">
        Upgrade now
      </a>
    </div>
  )
}
