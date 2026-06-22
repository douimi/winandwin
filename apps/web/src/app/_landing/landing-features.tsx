'use client'

import {
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
import type { LandingText } from './text'

interface Props {
  txt: LandingText
}

interface Feature {
  Icon: LucideIcon
  iconClass: string
  title: string
  desc: string
}

const FEATURES: Feature[] = [
  {
    Icon: Star,
    iconClass: 'bg-amber-50 text-amber-700',
    title: 'Google Reviews',
    desc: 'Customers leave reviews before playing. Watch your rating climb.',
  },
  {
    Icon: Smartphone,
    iconClass: 'bg-sky-50 text-sky-700',
    title: 'Social Growth',
    desc: 'Require Instagram follows or shares. Turn players into followers.',
  },
  {
    Icon: Ticket,
    iconClass: 'bg-violet-50 text-violet-700',
    title: 'Smart Coupons',
    desc: 'Time-limited prizes that drive return visits. Sent by email.',
  },
  {
    Icon: BarChart3,
    iconClass: 'bg-emerald-50 text-emerald-700',
    title: 'Live Analytics',
    desc: 'Track plays, wins, and redemptions in real-time.',
  },
  {
    Icon: ShieldCheck,
    iconClass: 'bg-rose-50 text-rose-700',
    title: 'Fraud Protection',
    desc: 'Device fingerprinting prevents cheating. One play per customer.',
  },
  {
    Icon: Palette,
    iconClass: 'bg-pink-50 text-pink-700',
    title: 'Your Brand',
    desc: 'Customize colors, logo, and theme to match your business.',
  },
  {
    Icon: Globe,
    iconClass: 'bg-indigo-50 text-indigo-700',
    title: 'Multi-Language',
    desc: "Support for French, English, and more. Your game speaks your customers' language.",
  },
]

export function LandingFeatures({ txt }: Props) {
  const reveal = useScrollReveal()

  return (
    <section id="features" className="bg-muted/40 py-24 sm:py-32">
      <div ref={reveal.ref} className={`mx-auto max-w-6xl px-4 sm:px-6 ${reveal.className}`}>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{txt.features}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{txt.featuresSubtitle}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.Icon
            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
