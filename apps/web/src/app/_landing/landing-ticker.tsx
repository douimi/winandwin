'use client'

import { Radio } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useLanding } from './lang-context'

/**
 * Horizontal auto-scrolling activity ticker rendered just under the hero.
 * Uses a duplicated string of items + a CSS `@keyframes` slide so the
 * scroll is smooth even if JS is throttled.
 *
 * This is the "we are alive" signal — ScanUpGo has a static "128 avis
 * ce mois" counter; a live-ish ticker beats that at first glance.
 */
export function LandingTicker() {
  const { txt } = useLanding()
  const trackRef = useRef<HTMLDivElement>(null)

  // Duplicate the items twice so the seamless loop reads continuously
  // regardless of how many actual items are in the source array.
  const items = [...txt.ticker, ...txt.ticker]

  // Pause on hover for accessibility (someone might want to read one).
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const pause = () => (el.style.animationPlayState = 'paused')
    const play = () => (el.style.animationPlayState = 'running')
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', play)
    return () => {
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', play)
    }
  }, [])

  return (
    <div className="border-y border-border bg-muted/30 py-2.5">
      <div className="relative mx-auto flex max-w-7xl items-center gap-3 overflow-hidden px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          {txt.tickerLabel}
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-10 whitespace-nowrap"
            style={{
              animation: 'wnw-ticker 40s linear infinite',
              width: 'max-content',
            }}
          >
            {items.map((item, i) => (
              <span key={i} className="text-xs text-muted-foreground sm:text-sm">
                {item}
              </span>
            ))}
          </div>
          {/* Left / right fade so the strip fades in and out of the container */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-muted/30 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-muted/30 to-transparent"
          />
        </div>
      </div>

      <style>{`
        @keyframes wnw-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
