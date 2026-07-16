'use client'

import { Button } from '@winandwin/ui'
import { ArrowRight, Calculator, Star, TrendingUp, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useScrollReveal } from './hooks'
import { useLanding } from './lang-context'

/**
 * Interactive ROI calculator — gamified value prop.
 *
 * The merchant sets:
 *   - monthly customer volume (slider 100 → 5000)
 *   - average ticket in MAD (segmented control)
 * and we compute three numbers based on our internal benchmark rates
 * (see BENCHMARKS below). The math is intentionally conservative so no
 * merchant ends up disappointed; sales can always upsell from here.
 */

// Benchmarks derived from our merchant-facing dashboard averages.
// Kept explicit so we can tune them from one place later.
const BENCHMARKS = {
  reviewConversion: 0.06,   // 6% of scans leave a Google review
  returnMultiplier: 0.22,   // 22% of players become recurring within 30 days
  couponRedemption: 0.35,   // 35% of issued coupons are redeemed
  scanRate: 0.28,           // 28% of walk-ins scan the QR
  planCostMonthly: 599,     // Pro plan (MAD/mo) — the anchor for payback maths
}

const TICKET_OPTIONS = [50, 100, 150, 200, 300] as const

export function LandingRoiCalculator() {
  const { txt, lang } = useLanding()
  const reveal = useScrollReveal()
  const [visitors, setVisitors] = useState(800)
  const [ticket, setTicket] = useState<(typeof TICKET_OPTIONS)[number]>(100)

  const output = useMemo(() => {
    const scans = Math.round(visitors * BENCHMARKS.scanRate)
    const reviews = Math.round(scans * BENCHMARKS.reviewConversion)
    const returning = Math.round(scans * BENCHMARKS.returnMultiplier)
    // Approximate uplifted revenue: recurring customers × avg ticket.
    // Payback = plan cost ÷ (uplifted weekly revenue).
    const upliftedMonthlyRevenue = returning * ticket
    const upliftedWeeklyRevenue = upliftedMonthlyRevenue / 4
    const roiWeeks =
      upliftedWeeklyRevenue > 0
        ? Math.max(1, Math.round(BENCHMARKS.planCostMonthly / upliftedWeeklyRevenue))
        : null

    return { reviews, returning, roiWeeks }
  }, [visitors, ticket])

  return (
    <section className="py-24 sm:py-32">
      <div ref={reveal.ref} className={`mx-auto max-w-4xl px-4 sm:px-6 ${reveal.className}`}>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Calculator className="h-3 w-3" />
            {lang === 'fr' ? 'Estimation' : 'Estimate'}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {txt.roiTitle}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{txt.roiSubtitle}</p>
        </div>

        <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-md sm:p-8 lg:grid-cols-[1fr_1fr]">
          {/* ── Inputs ─────────────────────────────────────────── */}
          <div className="space-y-6">
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="roi-visitors" className="text-sm font-semibold">
                  {txt.roiVisitorsLabel}
                </label>
                <span className="text-xl font-extrabold tabular-nums tracking-tight text-primary">
                  {visitors.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                </span>
              </div>
              <input
                id="roi-visitors"
                type="range"
                min={100}
                max={5000}
                step={50}
                value={visitors}
                onChange={(e) => setVisitors(Number(e.target.value))}
                className="mt-3 w-full accent-primary"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>100</span>
                <span>5 000</span>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold">
                {txt.roiTicketLabel}{' '}
                <span className="font-normal text-muted-foreground">(MAD)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {TICKET_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTicket(t)}
                    aria-pressed={ticket === t}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                      ticket === t
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-muted/40 text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Outputs ────────────────────────────────────────── */}
          <div className="space-y-3 rounded-xl bg-primary/5 p-5 ring-1 ring-primary/10">
            <OutputRow
              Icon={Star}
              label={txt.roiOutputReviews}
              value={`+${output.reviews.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} ${txt.roiPerMonth}`}
              accent="amber"
            />
            <OutputRow
              Icon={Users}
              label={txt.roiOutputReturning}
              value={`+${output.returning.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} ${txt.roiPerMonth}`}
              accent="sky"
            />
            <OutputRow
              Icon={TrendingUp}
              label={txt.roiOutputRoi}
              value={output.roiWeeks ? `${output.roiWeeks} ${txt.roiOutputRoiUnit}` : '—'}
              accent="emerald"
            />

            <a href="#contact" className="mt-4 block">
              <Button className="w-full font-semibold">
                {lang === 'fr' ? 'Démarrer maintenant' : 'Get started'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>

        <p className="mt-4 text-center text-xs italic text-muted-foreground">{txt.roiFootnote}</p>
      </div>
    </section>
  )
}

interface OutputRowProps {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  accent: 'amber' | 'sky' | 'emerald'
}

const ACCENT_CLASSES: Record<OutputRowProps['accent'], string> = {
  amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',
  emerald: 'bg-emerald-100 text-emerald-700',
}

function OutputRow({ Icon, label, value, accent }: OutputRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-3.5 py-3 shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ACCENT_CLASSES[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="shrink-0 text-lg font-extrabold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
    </div>
  )
}
