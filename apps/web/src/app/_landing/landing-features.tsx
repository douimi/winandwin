'use client'

import {
  BadgeCheck,
  BarChart3,
  Globe,
  Palette,
  ShieldCheck,
  Smartphone,
  Star,
  Ticket,
  type LucideIcon,
} from 'lucide-react'
import { useScrollReveal } from './hooks'
import { useLanding } from './lang-context'

interface Feature {
  Icon: LucideIcon
  iconClass: string
  title: string
  desc: string
}

export function LandingFeatures() {
  const { txt } = useLanding()
  const reveal = useScrollReveal()

  const features: Feature[] = [
    { Icon: Star, iconClass: 'bg-amber-50 text-amber-700', title: txt.featureReviews, desc: txt.featureReviewsDesc },
    { Icon: Smartphone, iconClass: 'bg-sky-50 text-sky-700', title: txt.featureSocial, desc: txt.featureSocialDesc },
    { Icon: Ticket, iconClass: 'bg-violet-50 text-violet-700', title: txt.featureCoupons, desc: txt.featureCouponsDesc },
    { Icon: BarChart3, iconClass: 'bg-emerald-50 text-emerald-700', title: txt.featureAnalytics, desc: txt.featureAnalyticsDesc },
    { Icon: ShieldCheck, iconClass: 'bg-rose-50 text-rose-700', title: txt.featureFraud, desc: txt.featureFraudDesc },
    { Icon: Palette, iconClass: 'bg-pink-50 text-pink-700', title: txt.featureBrand, desc: txt.featureBrandDesc },
    { Icon: Globe, iconClass: 'bg-indigo-50 text-indigo-700', title: txt.featureLanguages, desc: txt.featureLanguagesDesc },
    { Icon: BadgeCheck, iconClass: 'bg-slate-100 text-slate-700', title: txt.featureValidation, desc: txt.featureValidationDesc },
  ]

  return (
    <section id="features" className="bg-muted/40 py-24 sm:py-32">
      <div ref={reveal.ref} className={`mx-auto max-w-6xl px-4 sm:px-6 ${reveal.className}`}>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{txt.features}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{txt.featuresSubtitle}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.Icon
            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold leading-tight text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
