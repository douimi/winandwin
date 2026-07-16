'use client'

import { BarChart3, CheckCircle2, Gauge, Star, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useScrollReveal } from './hooks'
import { useLanding } from './lang-context'

/**
 * Animated dashboard preview — the "live product feel" section.
 *
 * A fake browser chrome hosts a mini merchant dashboard with:
 *   - Four KPI tiles whose numbers tick up when they scroll into view.
 *   - A simple 7-bar weekly activity chart with staggered fade-in.
 *   - A rotating merchant name at the top ("Voilà ce que voit Café Hafa
 *     en ce moment") so the visitor sees several concrete merchants.
 *
 * All shapes are CSS/SVG — no chart libs, no images. Ships in <1KB gz.
 */
export function LandingDashboardPreview() {
  const { txt } = useLanding()
  const reveal = useScrollReveal()

  // Rotate the merchant name every 4.5s so the visitor sees the sample
  // apply to several concrete brands.
  const [merchantIdx, setMerchantIdx] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setMerchantIdx((i) => (i + 1) % txt.dashboardMerchants.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [txt.dashboardMerchants.length])

  return (
    <section className="py-24 sm:py-32">
      <div ref={reveal.ref} className={`mx-auto max-w-6xl px-4 sm:px-6 ${reveal.className}`}>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {txt.dashboardTitle}{' '}
            <span className="inline-block min-w-[160px] rounded-lg bg-primary/10 px-3 py-1 text-primary sm:min-w-[220px]">
              {txt.dashboardMerchants[merchantIdx]}
            </span>
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{txt.dashboardSubtitle}</p>
        </div>

        {/* Fake browser chrome */}
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <BrowserChrome />

          {/* Inner dashboard */}
          <div className="border-t border-border bg-muted/40 p-5 sm:p-7">
            <div className="mb-5 flex items-baseline justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Dashboard
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {txt.dashboardMerchants[merchantIdx]}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            </div>

            {/* KPI tiles */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KpiTile
                Icon={Users}
                label={txt.dashboardKpiPlayers}
                target={247 + merchantIdx * 8}
                tone="sky"
              />
              <KpiTile
                Icon={Gauge}
                label={txt.dashboardKpiPlays}
                target={1842 + merchantIdx * 34}
                tone="violet"
              />
              <KpiTile
                Icon={Star}
                label={txt.dashboardKpiReviews}
                target={187 + merchantIdx * 5}
                tone="amber"
              />
              <KpiTile
                Icon={CheckCircle2}
                label={txt.dashboardKpiRedeemed}
                target={92 + merchantIdx * 3}
                tone="emerald"
              />
            </div>

            {/* Weekly chart */}
            <div className="mt-5 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">{txt.dashboardChart}</p>
              </div>
              <div className="mt-4 flex items-end gap-1.5 sm:gap-3" style={{ height: 100 }}>
                {WEEKDAY_HEIGHTS.map((heightPct, i) => (
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center gap-1.5"
                    style={{ animation: `wnw-bar-in 0.9s ease-out ${i * 0.08}s both` }}
                  >
                    <span className="text-[9px] font-medium tabular-nums text-muted-foreground">
                      {Math.round(heightPct * 3 + merchantIdx * 2)}
                    </span>
                    <div className="relative w-full flex-1">
                      <div
                        className="absolute bottom-0 w-full rounded-t-md bg-primary/80"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {WEEK_LABELS[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-center text-xs italic text-muted-foreground">
              {txt.dashboardWatermark}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wnw-bar-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wnw-count-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}

// Realistic-ish weekly bar shape (a working weekend + Wednesday spike).
const WEEKDAY_HEIGHTS = [40, 55, 72, 88, 62, 95, 78]
const WEEK_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// ── KPI tile with count-up (fires when the whole preview is visible) ──
interface KpiTileProps {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  target: number
  tone: 'sky' | 'violet' | 'amber' | 'emerald'
}

const TONE_CLASSES: Record<KpiTileProps['tone'], string> = {
  sky: 'bg-sky-50 text-sky-700',
  violet: 'bg-violet-50 text-violet-700',
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700',
}

function KpiTile({ Icon, label, target, tone }: KpiTileProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    // Every time `target` changes (merchant rotation), retween to the
    // new value. Duration deliberately short so the visitor feels the
    // numbers "settling" but doesn't wait.
    let raf = 0
    let start = 0
    const from = display
    const distance = target - from
    const duration = 800
    const step = (t: number) => {
      if (!start) start = t
      const progress = Math.min((t - start) / duration, 1)
      setDisplay(Math.round(from + distance * ease(progress)))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-lg font-extrabold tabular-nums tracking-tight text-foreground sm:text-2xl">
        {display.toLocaleString('fr-FR')}
      </p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

function ease(t: number) {
  // easeOutQuint — feels crisp on counters
  return 1 - Math.pow(1 - t, 5)
}

// ── Fake browser chrome ──────────────────────────────────────────────
function BrowserChrome() {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-2.5">
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
      </div>
      <div className="flex-1 truncate rounded-md bg-card px-3 py-1 text-xs text-muted-foreground shadow-inner">
        winandwin.club/dashboard
      </div>
    </div>
  )
}
