'use client'

import { useScrollReveal } from './hooks'
import { PhoneWheelSVG } from './phone-wheel'
import type { LandingText } from './text'

interface Props {
  txt: LandingText
}

export function LandingGames({ txt }: Props) {
  const reveal = useScrollReveal()

  return (
    <section id="games" className="py-24 sm:py-32">
      <div ref={reveal.ref} className={`mx-auto max-w-6xl px-4 sm:px-6 ${reveal.className}`}>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{txt.games}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{txt.gamesSubtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Wheel of Fortune */}
          <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
            <div
              className="flex h-56 items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0369A1 0%, #38bdf8 100%)' }}
            >
              <div className="h-36 w-36">
                <PhoneWheelSVG />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground">Wheel of Fortune</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The classic spin-to-win. Customers love the anticipation.
              </p>
            </div>
          </article>

          {/* Slot Machine */}
          <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
            <div
              className="flex h-56 items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' }}
            >
              {['7', '★', '♣'].map((symbol, i) => (
                <div
                  key={i}
                  className="flex h-20 w-14 items-center justify-center rounded-lg bg-white/30 text-3xl font-bold text-white backdrop-blur-sm"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {symbol}
                </div>
              ))}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground">Slot Machine</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Match symbols to win. Pure casino-style excitement.
              </p>
            </div>
          </article>

          {/* Mystery Box */}
          <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
            <div
              className="flex h-56 items-center justify-center gap-4"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`flex h-16 w-16 items-center justify-center rounded-xl bg-white/30 shadow-lg backdrop-blur-sm ${i === 1 ? 'h-20 w-20' : ''}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    className={i === 1 ? 'h-10 w-10' : 'h-8 w-8'}
                  >
                    <path d="M20 12v10H4V12" />
                    <path d="M2 7h20v5H2z" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
                  </svg>
                </div>
              ))}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground">Mystery Box</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tap to reveal. Simple, fun, and addictive.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
