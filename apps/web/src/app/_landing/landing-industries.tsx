'use client'

import { MapPin, MessageSquareQuote, Quote } from 'lucide-react'
import { useState } from 'react'
import { useScrollReveal } from './hooks'
import { useLanding } from './lang-context'
import { LandingQuizButton } from './landing-quiz-modal'

/**
 * "For every industry" tabs — the killer social-proof section.
 *
 * Six vertical tabs; each shows a matching merchant with pain-point, a
 * quote, a mock QR flyer, and three concrete numbers. The flyer is
 * rendered as pure CSS/SVG (no image assets needed — everything stays
 * self-hostable and instant to load).
 *
 * Copy for every tab lives in text.ts under `industries[]` so a single
 * FR / EN swap propagates everywhere.
 */
export function LandingIndustries() {
  const { txt } = useLanding()
  const reveal = useScrollReveal()
  const [activeKey, setActiveKey] = useState(txt.industries[0]?.key ?? 'restaurant')

  const active = txt.industries.find((i) => i.key === activeKey) ?? txt.industries[0]!

  return (
    <section className="bg-muted/40 py-24 sm:py-32">
      <div ref={reveal.ref} className={`mx-auto max-w-6xl px-4 sm:px-6 ${reveal.className}`}>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{txt.industriesTitle}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{txt.industriesSubtitle}</p>
        </div>

        {/* Horizontal scrollable tab bar so 6 tabs fit on mobile without wrap-collapsing */}
        <div
          role="tablist"
          className="mb-8 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2 sm:justify-center sm:overflow-visible sm:pb-0"
        >
          {txt.industries.map((ind) => {
            const isActive = ind.key === activeKey
            return (
              <button
                key={ind.key}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveKey(ind.key)}
                className={`snap-start flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground shadow-md'
                    : 'border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                }`}
              >
                <span aria-hidden>{ind.emoji}</span>
                {ind.label}
              </button>
            )
          })}
        </div>

        {/* Active industry card */}
        <div className="grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-md sm:p-8 lg:grid-cols-[1fr_1.15fr]">
          {/* Left column — copy */}
          <div className="flex flex-col">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <span aria-hidden>{active.emoji}</span>
              {active.label}
            </div>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{active.pain}</p>

            <div className="my-6 flex-1 rounded-xl bg-primary/5 p-5 ring-1 ring-primary/10">
              <Quote className="h-6 w-6 text-primary/50" />
              <p className="mt-2 text-base font-medium leading-relaxed text-foreground">
                {active.quote}
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageSquareQuote className="h-3.5 w-3.5" />
                <span className="font-semibold text-foreground">{active.merchant}</span>
                <span className="text-border">·</span>
                <MapPin className="h-3 w-3" />
                {active.city}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {active.stats.map((stat, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/40 px-3 py-3 text-center">
                  <p className="text-xl font-extrabold tabular-nums tracking-tight text-primary sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — mock flyer */}
          <div className="flex items-center justify-center">
            <FlyerMockup
              merchant={active.merchant}
              headline={active.flyerHeadline}
              sub={active.flyerSub}
              emoji={active.emoji}
            />
          </div>
        </div>

        {/* Quiz nudge — anchored to the industries CTA */}
        <div className="mt-8 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <p className="text-sm text-muted-foreground">{txt.industryTakeQuizCta}</p>
          <LandingQuizButton />
        </div>
      </div>
    </section>
  )
}

// ── Flyer mockup — pure CSS/SVG, no image asset needed ───────────────
interface FlyerMockupProps {
  merchant: string
  headline: string
  sub: string
  emoji: string
}

function FlyerMockup({ merchant, headline, sub, emoji }: FlyerMockupProps) {
  return (
    <div
      className="relative w-full max-w-xs overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5"
      style={{
        aspectRatio: '3 / 4',
        background: 'linear-gradient(155deg, #7c1d1d 0%, #b91c1c 55%, #f59e0b 100%)',
      }}
    >
      {/* Grain/flame texture via layered radial gradients */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.15), transparent 30%), radial-gradient(circle at 85% 80%, rgba(255,200,100,0.2), transparent 40%)',
        }}
      />

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-between p-5 text-white">
        {/* Top: merchant + emoji */}
        <div className="flex w-full items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>{emoji}</span>
            <div className="text-left">
              <p className="text-[9px] font-semibold uppercase tracking-widest opacity-70">
                Powered by Win & Win
              </p>
              <p className="text-sm font-bold tracking-tight">{merchant}</p>
            </div>
          </div>
        </div>

        {/* Middle: headline */}
        <div className="text-center">
          <p className="text-2xl font-extrabold uppercase leading-tight tracking-tight drop-shadow-md">
            {headline}
          </p>
          <p className="mt-2 text-xs opacity-90">{sub}</p>
        </div>

        {/* Bottom: QR + CTA */}
        <div className="flex w-full flex-col items-center gap-2">
          <div className="rounded-lg bg-white p-2 shadow-md">
            <MockQR />
          </div>
          <p className="text-[9px] font-semibold uppercase tracking-widest opacity-80">
            Scanne pour jouer →
          </p>
        </div>
      </div>
    </div>
  )
}

// Static SVG QR-code visual approximation. Not scannable — purely
// decorative to convey "there's a QR here" without shipping an image.
function MockQR() {
  const cells = [
    '1111111011111011111',
    '1000001010001010000',
    '1011101010111010111',
    '1011101001010010111',
    '1011101000010010111',
    '1000001010111010000',
    '1111111010101011111',
    '0000000001010000000',
    '1010101011011011011',
    '1101011000010100101',
    '0100011110101010111',
    '1011100010010111010',
    '1111111000001010111',
    '1000001001010011010',
    '1011101010111010111',
    '1011101000000010101',
    '1000001010111010001',
    '1111111000110011111',
  ]
  const size = 4
  const cellSize = 100 / cells.length
  return (
    <svg viewBox="0 0 100 100" width={size * cells.length} height={size * cells.length} className="block">
      <rect width="100" height="100" fill="white" />
      {cells.map((row, y) =>
        row.split('').map((c, x) =>
          c === '1' ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0f172a"
            />
          ) : null,
        ),
      )}
    </svg>
  )
}
