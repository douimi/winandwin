'use client'

import { Check, X } from 'lucide-react'
import { useScrollReveal } from './hooks'
import { useLanding } from './lang-context'

/**
 * Comparison table between Win & Win and a generic "typical QR tool"
 * competitor. Displayed as a full table on ≥ md screens and as stacked
 * feature cards on mobile so nothing overflows horizontally.
 *
 * All row copy lives in text.ts under `battleRows` so it stays bilingual
 * without any inline strings here.
 */
export function LandingBattle() {
  const { txt } = useLanding()
  const reveal = useScrollReveal()

  return (
    <section className="py-24 sm:py-32">
      <div ref={reveal.ref} className={`mx-auto max-w-5xl px-4 sm:px-6 ${reveal.className}`}>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{txt.battleTitle}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{txt.battleSubtitle}</p>
        </div>

        {/* ── Desktop table ─────────────────────────────────────────── */}
        <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="w-1/2 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  &nbsp;
                </th>
                <th className="w-1/4 px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      ✓ {txt.battleWinWin}
                    </span>
                  </div>
                </th>
                <th className="w-1/4 px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground">{txt.battleOthers}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {txt.battleRows.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-t border-border ${i % 2 === 1 ? 'bg-muted/20' : ''}`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{row.label}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-start gap-2 text-left">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-sm font-medium text-foreground">{row.ours}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-start gap-2 text-left">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                      <span className="text-sm text-muted-foreground">{row.theirs}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile stacked cards ──────────────────────────────────── */}
        <div className="grid gap-3 md:hidden">
          {txt.battleRows.map((row) => (
            <div key={row.label} className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <p className="text-sm font-semibold text-foreground">{row.label}</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-2.5 ring-1 ring-primary/10">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                      {txt.battleWinWin}
                    </p>
                    <p className="text-sm font-medium text-foreground">{row.ours}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {txt.battleOthers}
                    </p>
                    <p className="text-sm text-muted-foreground">{row.theirs}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">{txt.battleFooter}</p>
      </div>
    </section>
  )
}
