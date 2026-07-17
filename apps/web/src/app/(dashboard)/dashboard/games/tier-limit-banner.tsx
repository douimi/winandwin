'use client'

import { useEffect, useState } from 'react'
import { fetchMerchant, fetchGames, fetchCtas } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'
import { useApp } from '@/lib/i18n/app-lang-context'
import { TIER_LIMITS } from '@winandwin/shared/constants'

interface Props {
  resource: 'games' | 'ctas'
}

export function TierLimitBanner({ resource }: Props) {
  const { lang } = useApp()
  const merchantId = useMerchantId()
  const [state, setState] = useState<{ max: number; tier: string } | null>(null)

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
              setState({ max: maxGames, tier })
            }
          }
        } else if (resource === 'ctas') {
          const maxCtas = limits.maxCtas as number
          if (maxCtas !== Infinity) {
            const ctasList = await fetchCtas(merchantId)
            if (!cancelled && ctasList.length >= maxCtas) {
              setState({ max: maxCtas, tier })
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

  if (!state) return null

  const noun =
    resource === 'games'
      ? state.max === 1
        ? (lang === 'fr' ? 'jeu' : 'game')
        : (lang === 'fr' ? 'jeux' : 'games')
      : state.max === 1
        ? 'CTA'
        : 'CTAs'

  const message =
    lang === 'fr'
      ? `Vous avez atteint la limite de ${state.max} ${noun} pour votre plan ${state.tier}. Passez à un plan supérieur pour en ajouter plus.`
      : `You've reached the maximum of ${state.max} ${noun} for your ${state.tier} plan. Upgrade to add more.`

  const upgradeLink = lang === 'fr' ? 'Voir les plans' : 'Upgrade now'

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {message}{' '}
      <a href="/dashboard/upgrade" className="font-medium underline">
        {upgradeLink}
      </a>
    </div>
  )
}
