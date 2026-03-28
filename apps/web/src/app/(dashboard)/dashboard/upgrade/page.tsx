'use client'

import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@winandwin/ui'
import { useState, useEffect, useCallback } from 'react'
import { fetchMerchant } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'

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
  const merchantId = useMerchantId()
  const [currentTier, setCurrentTier] = useState<string>('free')
  const [loading, setLoading] = useState(true)

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
        <h1 className="text-2xl font-bold">Upgrade Plan</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upgrade Plan</h1>
        <p className="text-muted-foreground mt-1">
          You are currently on the <span className="font-semibold capitalize">{currentTier}</span> plan.
          {currentTier === 'enterprise'
            ? ' You have the best plan available!'
            : ' Choose a plan below to unlock more features.'}
        </p>
      </div>

      {/* Success state */}
      {submitted && (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="py-6 text-center">
            <p className="text-4xl mb-3">{'\u2705'}</p>
            <h2 className="text-lg font-semibold text-green-900">Request submitted!</h2>
            <p className="text-sm text-green-800 mt-1">
              We&apos;ll contact you within 24 hours to set up your new plan!
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
              Back to plans
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
                    plan.popular ? 'border-indigo-400 shadow-lg shadow-indigo-100' : ''
                  } ${isCurrent ? 'opacity-60' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-medium text-white">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="mt-2">
                      {plan.price === 'Custom' ? (
                        <span className="text-3xl font-bold">Custom</span>
                      ) : (
                        <>
                          <span className="text-3xl font-bold">{'\u20AC'}{plan.price}</span>
                          <span className="text-muted-foreground">/month</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-2 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600 mt-0.5">{'\u2713'}</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      {isCurrent ? (
                        <Button disabled className="w-full">
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant={plan.popular ? 'default' : 'outline'}
                          onClick={() => setSelectedPlan(plan.tier)}
                        >
                          Contact Us to Upgrade
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
            <Card className="border-indigo-300">
              <CardHeader>
                <CardTitle>Request Upgrade to {tierLabel(selectedPlan)}</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 mb-4">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Current Plan</Label>
                      <Input value={tierLabel(currentTier)} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Desired Plan</Label>
                      <Input value={tierLabel(selectedPlan)} disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upgradeMessage">Message (optional)</Label>
                    <textarea
                      id="upgradeMessage"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your needs, expected volume, or any questions..."
                      rows={3}
                      className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Upgrade Request'}
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
