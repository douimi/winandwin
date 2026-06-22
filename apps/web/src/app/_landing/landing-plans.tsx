'use client'

import { Button } from '@winandwin/ui'
import { Check, Sparkles } from 'lucide-react'
import { useScrollReveal } from './hooks'
import type { LandingText } from './text'

interface Props {
  txt: LandingText
}

interface Plan {
  name: string
  price: string
  priceSuffix?: string
  features: string[]
  popular?: boolean
}

export function LandingPlans({ txt }: Props) {
  const reveal = useScrollReveal()

  const plans: Plan[] = [
    {
      name: 'Starter',
      price: '299',
      priceSuffix: `MAD${txt.perMonth}`,
      features: [
        '500 plays/month',
        '1 active game',
        '3 prizes per game',
        '3 CTA types',
        'Basic QR code',
        'Email coupons',
        'Basic analytics',
      ],
    },
    {
      name: 'Pro',
      price: '599',
      priceSuffix: `MAD${txt.perMonth}`,
      popular: true,
      features: [
        '2,000 plays/month',
        '3 active games',
        '10 prizes per game',
        'All CTA types',
        'Branded QR materials',
        'Full analytics',
        'Marketing automation',
        'WhatsApp support',
      ],
    },
    {
      name: 'Enterprise',
      price: txt.custom,
      features: [
        'Unlimited plays',
        'Unlimited games',
        'Multi-location support',
        'White-label option',
        'Dedicated account manager',
        'Custom integrations',
        'Priority support',
      ],
    },
  ]

  const faqs = [
    { q: txt.faq1q, a: txt.faq1a },
    { q: txt.faq2q, a: txt.faq2a },
    { q: txt.faq3q, a: txt.faq3a },
  ]

  return (
    <section id="plans" className="py-24 sm:py-32">
      <div ref={reveal.ref} className={`mx-auto max-w-5xl px-4 sm:px-6 ${reveal.className}`}>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{txt.plans}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{txt.plansSubtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border bg-card p-7 shadow-sm transition-shadow hover:shadow-md ${
                plan.popular ? 'border-primary/40 ring-1 ring-primary/10 md:scale-[1.02]' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  Recommended
                </div>
              )}

              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tabular-nums tracking-tight text-foreground">
                  {plan.price}
                </span>
                {plan.priceSuffix && (
                  <span className="text-muted-foreground">{plan.priceSuffix}</span>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <a href="#contact" className="mt-8 block">
                <Button
                  className="w-full font-semibold"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {txt.contactUs}
                </Button>
              </a>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">{txt.trialNote}</p>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-2xl">
          <h3 className="mb-6 text-center text-xl font-semibold text-foreground">
            {txt.faqHeading}
          </h3>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <h4 className="font-semibold text-foreground">{faq.q}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
