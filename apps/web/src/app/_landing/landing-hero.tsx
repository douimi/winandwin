'use client'

import { Button } from '@winandwin/ui'
import { ArrowRight, Sparkles } from 'lucide-react'
import { AnimatedCounter } from './animated-counter'
import { ScratchCard } from './scratch-card'
import type { LandingText } from './text'

interface Props {
  txt: LandingText
}

const TRUST_LOGOS = [
  'Riad Jardin',
  'Café Hafa',
  'Restaurant Al Fassia',
  'Salon Beauté',
  'Pâtisserie Amoud',
  'Gym Atlas',
]

// Light hero. Two soft brand-tinted glows take the place of the old animated
// dark gradient + particles + decorative stickers — same energy, far less
// visual noise.
export function LandingHero({ txt }: Props) {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient glows (no motion — calmer, no perf cost) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[520px] w-[520px] rounded-full bg-sky-200/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" />
              Gamified marketing for local businesses
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-foreground">{txt.heroTitle1}</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-sky-500 to-primary bg-clip-text text-transparent">
                {txt.heroTitle2}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground lg:mx-0">
              {txt.heroSubtitle}{' '}
              <span className="font-semibold text-foreground">{txt.heroHighlight1}</span>{' '}
              {txt.heroMid}{' '}
              <span className="font-semibold text-foreground">{txt.heroHighlight2}</span>.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <a href="#plans">
                <Button size="lg" className="px-6 font-semibold">
                  {txt.seePlans}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href="#contact">
                <Button size="lg" variant="outline" className="px-6 font-semibold">
                  {txt.contactUs}
                </Button>
              </a>
            </div>

            {/* Stat row */}
            <div className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-4 lg:mx-0">
              <Stat value={<AnimatedCounter target={500} suffix="+" />} label={txt.businesses} />
              <Stat value={<AnimatedCounter target={2} suffix="M+" />} label={txt.gamesPlayed} />
              <Stat value={<AnimatedCounter target={4} suffix=".8/5" />} label={txt.satisfaction} />
            </div>
          </div>

          {/* Phone demo — hidden on mobile to keep the fold tight */}
          <div className="hidden flex-col items-center gap-4 md:flex">
            <ScratchCard />
            <p className="max-w-[280px] text-center text-sm text-muted-foreground">{txt.tryNow}</p>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-16 text-center">
          <p className="mb-4 text-sm font-medium text-muted-foreground">{txt.trusted}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TRUST_LOGOS.map((name) => (
              <span
                key={name}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-xs"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="text-center lg:text-left">
      <div className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  )
}
