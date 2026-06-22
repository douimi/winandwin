'use client'

import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@winandwin/ui'
import { Check, CheckCircle2 } from 'lucide-react'
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
        <Card className="border-emerald-300 bg-emerald-50/60">
          <CardContent className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-emerald-900">Request submitted!</h2>
            <p className="mt-1 text-sm text-emerald-800">
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
                    plan.popular ? 'border-primary/40 shadow-md ring-1 ring-primary/10' : ''
                  } ${isCurrent ? 'opacity-60' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="mt-2">
                      {plan.price === 'Custom' ? (
                        <span className="text-3xl font-bold tracking-tight">Custom</span>
                      ) : (
                        <>
                          <span className="text-3xl font-bold tracking-tight tabular-nums">
                            {'\u20AC'}{plan.price}
                          </span>
                          <span className="text-muted-foreground">/month</span>
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
            <Card className="border-primary/30 bg-primary/[0.02]">
              <CardHeader>
                <CardTitle>Request Upgrade to {tierLabel(selectedPlan)}</CardTitle>
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
