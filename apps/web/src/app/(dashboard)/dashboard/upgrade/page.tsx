'use client'

import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@winandwin/ui'
import { Check, CheckCircle2 } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { fetchMerchant } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'
import { useApp } from '@/lib/i18n/app-lang-context'

const PLANS = [
  {
    tier: 'starter',
    name: 'Starter',
    price: '29',
    description: 'Perfect for small businesses getting started with gamification.',
    features: [
      '2,000 plays / month',
      'Wheel, Mystery Box & Slots',
      'Up to 10 prizes',
      'Unlimited CTAs',
      '1 location',
      'Detailed analytics',
      'Read-only API access',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '79',
    popular: true,
    description: 'For growing businesses that need more power and flexibility.',
    features: [
      '20,000 plays / month',
      'All game types',
      'Unlimited prizes',
      'Unlimited CTAs',
      'Up to 5 locations',
      'Advanced analytics',
      'Full API access',
      'A/B testing',
    ],
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large businesses and chains with custom needs.',
    features: [
      'Unlimited plays',
      'All game types',
      'Unlimited prizes',
      'Unlimited CTAs',
      'Unlimited locations',
      'Advanced analytics',
      'Full API access',
      'A/B testing',
      'Dedicated support',
      'Custom integrations',
    ],
  },
]

export default function UpgradePage() {
  const { txt, lang } = useApp()
  const merchantId = useMerchantId()
  const [currentTier, setCurrentTier] = useState<string>('free')
  const [loading, setLoading] = useState(true)

  const tierDisplayName: Record<string, string> = {
    free: txt.shellTierFree,
    starter: txt.shellTierStarter,
    pro: txt.shellTierPro,
    enterprise: txt.shellTierEnterprise,
  }

  // Modal state
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMerchant = useCallback(async () => {
    if (!merchantId) {
      setLoading(false)
      return
    }
    try {
      const merchant = await fetchMerchant(merchantId)
      setCurrentTier(merchant.subscriptionTier)
    } catch {
      // Silently fail — default to free
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  useEffect(() => {
    loadMerchant()
  }, [loadMerchant])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPlan) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'upgrade_request',
          merchantId,
          currentPlan: currentTier,
          desiredPlan: selectedPlan,
          message: message || undefined,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit request')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const tierLabel = (tier: string) => tier.charAt(0).toUpperCase() + tier.slice(1)

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold">{txt.upgradeTitle}</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">{txt.commonLoading}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{txt.upgradeTitle}</h1>
        <p className="text-muted-foreground mt-1">
          {lang === 'fr'
            ? <>Vous êtes actuellement sur le plan <span className="font-semibold">{tierDisplayName[currentTier] ?? currentTier}</span>.</>
            : <>You are currently on the <span className="font-semibold">{tierDisplayName[currentTier] ?? currentTier}</span> plan.</>}
          {currentTier === 'enterprise'
            ? (lang === 'fr' ? ' Vous avez le meilleur plan disponible !' : ' You have the best plan available!')
            : (lang === 'fr' ? ' Choisissez un plan ci-dessous pour débloquer plus de fonctionnalités.' : ' Choose a plan below to unlock more features.')}
        </p>
      </div>

      {/* Success state */}
      {submitted && (
        <Card className="border-emerald-300 bg-emerald-50/60">
          <CardContent className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-emerald-900">
              {lang === 'fr' ? 'Demande envoyée !' : 'Request submitted!'}
            </h2>
            <p className="mt-1 text-sm text-emerald-800">
              {lang === 'fr'
                ? 'Nous vous contacterons sous 24 heures pour finaliser votre nouveau plan !'
                : "We'll contact you within 24 hours to set up your new plan!"}
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                setSubmitted(false)
                setSelectedPlan(null)
                setMessage('')
              }}
            >
              {lang === 'fr' ? 'Retour aux plans' : 'Back to plans'}
            </Button>
          </CardContent>
        </Card>
      )}

      {!submitted && (
        <>
          {/* Plan cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => {
              const isCurrent = plan.tier === currentTier
              return (
                <Card
                  key={plan.tier}
                  className={`relative flex flex-col ${
                    plan.popular ? 'border-primary/40 shadow-md ring-1 ring-primary/10' : ''
                  } ${isCurrent ? 'opacity-60' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                      {lang === 'fr' ? 'Le plus populaire' : 'Most Popular'}
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{tierDisplayName[plan.tier] ?? plan.name}</CardTitle>
                    <div className="mt-2">
                      {plan.price === 'Custom' ? (
                        <span className="text-3xl font-bold tracking-tight">
                          {lang === 'fr' ? 'Sur mesure' : 'Custom'}
                        </span>
                      ) : (
                        <>
                          <span className="text-3xl font-bold tracking-tight tabular-nums">
                            {'\u20AC'}{plan.price}
                          </span>
                          <span className="text-muted-foreground">
                            {lang === 'fr' ? '/mois' : '/month'}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="flex-1 space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      {isCurrent ? (
                        <Button disabled className="w-full">
                          {txt.upgradeCurrent}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant={plan.popular ? 'default' : 'outline'}
                          onClick={() => setSelectedPlan(plan.tier)}
                        >
                          {lang === 'fr' ? 'Nous contacter' : 'Contact Us to Upgrade'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Upgrade request form */}
          {selectedPlan && (
            <Card className="border-primary/30 bg-primary/[0.02]">
              <CardHeader>
                <CardTitle>
                  {lang === 'fr'
                    ? `Demander le plan ${tierDisplayName[selectedPlan] ?? tierLabel(selectedPlan)}`
                    : `Request Upgrade to ${tierDisplayName[selectedPlan] ?? tierLabel(selectedPlan)}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{txt.upgradeCurrentPlan}</Label>
                      <Input value={tierDisplayName[currentTier] ?? tierLabel(currentTier)} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>{lang === 'fr' ? 'Plan souhaité' : 'Desired Plan'}</Label>
                      <Input value={tierDisplayName[selectedPlan] ?? tierLabel(selectedPlan)} disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upgradeMessage">
                      {lang === 'fr' ? 'Message (optionnel)' : 'Message (optional)'}
                    </Label>
                    <textarea
                      id="upgradeMessage"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={lang === 'fr'
                        ? 'Décrivez vos besoins, votre volume attendu ou vos questions…'
                        : 'Tell us about your needs, expected volume, or any questions...'}
                      rows={3}
                      className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={submitting}>
                      {submitting
                        ? (lang === 'fr' ? 'Envoi…' : 'Submitting...')
                        : (lang === 'fr' ? 'Envoyer la demande' : 'Submit Upgrade Request')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedPlan(null)
                        setMessage('')
                        setError(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
