'use client'

import { Button } from '@winandwin/ui'
import { ArrowRight, MessageCircle, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLanding } from './lang-context'
import { whatsAppUrl } from './text'

/**
 * Two-question quiz that recommends a game type based on the merchant's
 * business + priority. Feels smart, personalizes the next step, and
 * routes into the WhatsApp funnel with a prefilled context message.
 *
 * The modal is opened by <LandingQuizButton />, which is embedded both
 * in the Games section and under the Industries CTA.
 */

interface Recommendation {
  game: 'wheel' | 'slots' | 'mystery'
  headline: string
  reason: string
}

// Deterministic mapping from (business × priority) → game recommendation.
// Priorities in the mental model:
//   - reviews  → Wheel (universal + review-oriented, the safe default)
//   - return   → Mystery Box (feel-good, low-friction, addicts return)
//   - social   → Slots (visual, screenshottable, shareable)
//   - email    → Wheel (progressive collection through CTA sequence)
function recommend(business: string, priority: string, lang: 'fr' | 'en'): Recommendation {
  const isEvent = business === 'event'
  const isCafe = business === 'restaurant'
  const isRetail = business === 'retail'

  // Priority-dominant heuristics, then business overrides.
  let game: Recommendation['game'] = 'wheel'
  if (priority === 'social') game = 'slots'
  else if (priority === 'return') game = 'mystery'
  else if (priority === 'email') game = 'wheel'
  else game = 'wheel'

  // Business-specific overrides
  if (isEvent) game = 'slots'
  if (isCafe && priority === 'return') game = 'mystery'
  if (isRetail && priority === 'reviews') game = 'wheel'

  if (lang === 'fr') {
    const map = {
      wheel: {
        headline: 'Roue de la Fortune',
        reason:
          'Le jeu le plus polyvalent. Marche pour tous les commerces, tous les prix. Excellent pour collecter des avis et des emails.',
      },
      slots: {
        headline: 'Machine à Sous',
        reason:
          'L\'effet jackpot est très partageable — vos clients postent des stories. Parfait pour Instagram, TikTok et l\'événementiel.',
      },
      mystery: {
        headline: 'Boîte Mystère',
        reason:
          'Un tap, la surprise, les confettis. Effet feel-good qui fait revenir. Idéal pour cafés, boulangeries, salons.',
      },
    }
    return { game, ...map[game] }
  }

  const map = {
    wheel: {
      headline: 'Wheel of Fortune',
      reason:
        'The most versatile game. Works for any business, any prize. Great at collecting reviews and emails.',
    },
    slots: {
      headline: 'Slot Machine',
      reason: 'The jackpot moment is very shareable — customers post stories. Perfect for Instagram, TikTok, events.',
    },
    mystery: {
      headline: 'Mystery Box',
      reason:
        'One tap, surprise, confetti. Feel-good vibe that brings customers back. Ideal for cafés, bakeries, salons.',
    },
  }
  return { game, ...map[game] }
}

export function LandingQuizButton() {
  const [open, setOpen] = useState(false)
  const { txt } = useLanding()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-md"
      >
        <Sparkles className="h-4 w-4" />
        {txt.quizCta}
        <ArrowRight className="h-4 w-4" />
      </button>

      {open && <QuizModal onClose={() => setOpen(false)} />}
    </>
  )
}

function QuizModal({ onClose }: { onClose: () => void }) {
  const { txt, lang } = useLanding()
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [business, setBusiness] = useState<string | null>(null)
  const [priority, setPriority] = useState<string | null>(null)

  const recommendation =
    business && priority ? recommend(business, priority, lang) : null

  // ESC to close + prevent scroll on body while open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="landing-quiz-title"
    >
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} role="presentation" />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress bar */}
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {step < 2 && (
            <div className="mb-6 text-center">
              <h3 id="landing-quiz-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
                {txt.quizTitle}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{txt.quizSubtitle}</p>
            </div>
          )}

          {/* Step 0 — business */}
          {step === 0 && (
            <QuizStep
              question={txt.quizQ1}
              options={txt.quizQ1Options}
              value={business}
              onSelect={(v) => {
                setBusiness(v)
                setTimeout(() => setStep(1), 220)
              }}
            />
          )}

          {/* Step 1 — priority */}
          {step === 1 && (
            <QuizStep
              question={txt.quizQ2}
              options={txt.quizQ2Options}
              value={priority}
              onSelect={(v) => {
                setPriority(v)
                setTimeout(() => setStep(2), 220)
              }}
            />
          )}

          {/* Step 2 — recommendation */}
          {step === 2 && recommendation && (
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-3 w-3" />
                {txt.quizResultTitle}
              </div>

              <p className="mt-4 text-3xl font-bold tracking-tight">{recommendation.headline}</p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {recommendation.reason}
              </p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button variant="outline" onClick={() => setStep(0)}>
                  ← {txt.quizBack}
                </Button>
                <a
                  href={`${whatsAppUrl(lang)}%20J'aimerais%20essayer%20${encodeURIComponent(recommendation.headline)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-emerald-600 text-white hover:bg-emerald-500">
                    <MessageCircle className="h-4 w-4 fill-current" strokeWidth={0} />
                    {txt.quizResultCta}
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Presentational — a grid of option cards ──────────────────────────
interface QuizStepProps {
  question: string
  options: readonly { key: string; label: string; emoji: string }[]
  value: string | null
  onSelect: (key: string) => void
}

function QuizStep({ question, options, value, onSelect }: QuizStepProps) {
  return (
    <div>
      <p className="mb-4 text-center font-semibold">{question}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const isSelected = value === opt.key
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelect(opt.key)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-foreground/20 hover:bg-muted/50'
              }`}
            >
              <span className="text-2xl" aria-hidden>
                {opt.emoji}
              </span>
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
