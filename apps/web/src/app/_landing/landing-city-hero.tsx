'use client'

import { Button } from '@winandwin/ui'
import { ArrowRight, MapPin, MessageCircle, Sparkles } from 'lucide-react'
import { AnimatedCounter } from './animated-counter'
import type { CityMeta } from './cities'
import { useLanding } from './lang-context'
import { ScratchCard } from './scratch-card'
import { whatsAppUrl } from './text'

// Same visual language as LandingHero, but the h1 pulls its two big lines
// from the city entry (so /maroc/casablanca reads "À Casablanca…"). The rest
// of the copy comes from the current lang context.
export function LandingCityHero({ city }: { city: CityMeta }) {
  const { txt, lang } = useLanding()
  const cityCopy = city[lang]

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[520px] w-[520px] rounded-full bg-sky-200/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <MapPin className="h-3 w-3" />
              {city.displayName}
              <span className="text-primary/50">·</span>
              <Sparkles className="h-3 w-3" />
              {txt.heroEyebrow}
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-foreground">{cityCopy.heroTitle1}</span>
              <br />
              <span className="text-foreground">{cityCopy.heroTitle2}</span>
              <br />
              <span className="mt-1 inline-block bg-gradient-to-r from-primary via-sky-500 to-primary bg-clip-text text-transparent">
                {txt.heroTitleAccent}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground lg:mx-0">
              {txt.heroSubtitle}
            </p>

            <p className="mx-auto mt-3 max-w-lg text-sm font-medium text-primary lg:mx-0">
              {cityCopy.localPitch}
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <a href={whatsAppUrl(lang)} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="bg-emerald-600 px-6 font-semibold text-white shadow-md hover:bg-emerald-500 hover:shadow-lg"
                >
                  <MessageCircle className="h-4 w-4 fill-current" strokeWidth={0} />
                  {txt.heroCtaWhatsApp}
                </Button>
              </a>
              <a href="#games">
                <Button size="lg" variant="outline" className="px-6 font-semibold">
                  {txt.heroCtaDemo}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>

            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground lg:mx-0 lg:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-amber-500">⭐</span>
                {txt.heroTrust1}
              </span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span>🏪</span>
                <span className="tabular-nums"><AnimatedCounter target={500} suffix="+" /></span>{' '}
                {txt.heroTrust2.replace(/^\d+\+?\s*/, '')}
              </span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span>🎯</span>
                {txt.heroTrust3}
              </span>
            </div>
          </div>

          <div className="hidden flex-col items-center gap-4 md:flex">
            <ScratchCard />
            <p className="max-w-[280px] text-center text-sm text-muted-foreground">{txt.tryNow}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
