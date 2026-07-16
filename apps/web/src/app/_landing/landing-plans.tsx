'use client'

import { Button } from '@winandwin/ui'
import { Check, ChevronDown, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useScrollReveal } from './hooks'
import { useLanding } from './lang-context'

interface Plan {
  name: string
  price: string
  priceSuffix?: string
  features: string[]
  popular?: boolean
  roi: string
}

export function LandingPlans() {
  const { txt } = useLanding()
  const reveal = useScrollReveal()
  const [openGroup, setOpenGroup] = useState<number>(0)
  const [openQ, setOpenQ] = useState<string | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')

  // 20% annual discount vs monthly. Round down to the nearest MAD.
  const monthlyToAnnual = (m: number) => Math.round((m * 12 * 0.8) / 12)

  const starterPrice = billing === 'annual' ? monthlyToAnnual(299) : 299
  const proPrice = billing === 'annual' ? monthlyToAnnual(599) : 599

  const plans: Plan[] = [
    {
      name: 'Starter',
      price: String(starterPrice),
      priceSuffix: `MAD${txt.perMonth}`,
      features: [
        '500 parties/mois',
        '1 jeu actif',
        '3 prix par jeu',
        '3 types de CTA',
        'QR code basique',
        'Coupons par email',
        'Analytics de base',
      ],
      roi: txt.planRoiStarter,
    },
    {
      name: 'Pro',
      price: String(proPrice),
      priceSuffix: `MAD${txt.perMonth}`,
      popular: true,
      features: [
        '2 000 parties/mois',
        '3 jeux actifs',
        '10 prix par jeu',
        'Tous les types de CTA',
        'Flyer QR imprimable',
        'Analytics complet',
        'Automatisation marketing',
        'Support WhatsApp prioritaire',
      ],
      roi: txt.planRoiPro,
    },
    {
      name: 'Enterprise',
      price: txt.custom,
      features: [
        'Parties illimitées',
        'Jeux illimités',
        'Multi-établissements',
        'Marque blanche',
        'Account manager dédié',
        'Intégrations sur mesure',
        'Support prioritaire',
      ],
      roi: txt.planRoiEnterprise,
    },
  ]

  return (
    <section id="plans" className="py-24 sm:py-32">
      <div ref={reveal.ref} className={`mx-auto max-w-5xl px-4 sm:px-6 ${reveal.className}`}>
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{txt.plans}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{txt.plansSubtitle}</p>
        </div>

        {/* Monthly / Annual toggle */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <div
            role="group"
            aria-label="Billing frequency"
            className="inline-flex items-center rounded-full border border-border bg-card p-0.5 shadow-xs"
          >
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              aria-pressed={billing === 'monthly'}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                billing === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {txt.billingMonthly}
            </button>
            <button
              type="button"
              onClick={() => setBilling('annual')}
              aria-pressed={billing === 'annual'}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                billing === 'annual'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {txt.billingAnnual}
              <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                −20%
              </span>
            </button>
          </div>
          {billing === 'annual' && (
            <p className="hidden text-xs text-muted-foreground sm:block">
              {txt.billingAnnualSavings} · {txt.billingAnnualHint}
            </p>
          )}
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
                  {txt.planRecommended}
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

              {/* ROI anchor line — one of the biggest per-plan conversion tweaks */}
              <p className="mt-2 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                💰 {plan.roi}
              </p>

              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <a href="#contact" className="mt-8 block">
                <Button className="w-full font-semibold" variant={plan.popular ? 'default' : 'outline'}>
                  {txt.contactUs}
                </Button>
              </a>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">{txt.trialNote}</p>

        {/* ── Deep FAQ — grouped accordion ─────────────────────────── */}
        <div className="mx-auto mt-20 max-w-3xl">
          <h3 className="mb-6 text-center text-2xl font-semibold text-foreground">
            {txt.faqHeading}
          </h3>

          {/* Group tabs */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {txt.faqGroups.map((group, idx) => (
              <button
                key={group.title}
                type="button"
                onClick={() => {
                  setOpenGroup(idx)
                  setOpenQ(null)
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  openGroup === idx
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {group.title}
              </button>
            ))}
          </div>

          {/* Questions in the active group */}
          <div className="space-y-3">
            {txt.faqGroups[openGroup]?.questions.map((qa) => {
              const isOpen = openQ === qa.q
              return (
                <div
                  key={qa.q}
                  className="overflow-hidden rounded-xl border border-border bg-card shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenQ(isOpen ? null : qa.q)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/30"
                  >
                    <span className="font-semibold text-foreground">{qa.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                      {qa.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
