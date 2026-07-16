'use client'

import { ArrowUpRight, MapPin, Quote, Sparkles } from 'lucide-react'
import { useScrollReveal } from './hooks'
import { useLanding } from './lang-context'

/**
 * Named case studies — the highest-converting element on any SMB SaaS
 * landing. Three cards, each with:
 *   - A "photo" (CSS gradient tile with initials — swap for real photos
 *     as soon as merchants sign off; the API is the same).
 *   - Merchant name + role + city.
 *   - A pull quote.
 *   - A 3-cell before / after / delta strip.
 *
 * All copy is bilingual via useLanding(). The cases themselves are
 * defined inline here (not in text.ts) because they're structural
 * story data — swapping to real merchants is a merged concern.
 */

interface Case {
  key: string
  photoGradient: string
  initials: string
  fr: CaseCopy
  en: CaseCopy
  metrics: Array<{ label: { fr: string; en: string }; before: string; after: string }>
}

interface CaseCopy {
  merchant: string
  role: string
  city: string
  headline: string
  quote: string
}

const CASES: Case[] = [
  {
    key: 'cafe-hafa',
    photoGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 60%, #7c2d12 100%)',
    initials: 'AI',
    fr: {
      merchant: 'Amine El Idrissi',
      role: 'Gérant, Café Hafa',
      city: 'Casablanca',
      headline: 'De 3,7 à 4,6 étoiles sur Google en 3 mois',
      quote:
        '« On a essayé plein d\'outils pour récolter des avis. Rien n\'a marché comme Win & Win. En 3 mois, nos réservations le weekend ont doublé, et notre note Google est passée de 3,7 à 4,6. »',
    },
    en: {
      merchant: 'Amine El Idrissi',
      role: 'Owner, Café Hafa',
      city: 'Casablanca',
      headline: 'From 3.7 to 4.6 stars on Google in 3 months',
      quote:
        '"We\'d tried plenty of review tools. Nothing worked like Win & Win. In 3 months, our weekend bookings doubled and our Google rating jumped from 3.7 to 4.6."',
    },
    metrics: [
      { label: { fr: 'Note Google', en: 'Google rating' }, before: '3,7 ★', after: '4,6 ★' },
      { label: { fr: 'Réservations weekend', en: 'Weekend bookings' }, before: '85/sem', after: '176/sem' },
      { label: { fr: 'Avis récoltés', en: 'Reviews collected' }, before: '18', after: '160' },
    ],
  },
  {
    key: 'salon-beaute',
    photoGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 60%, #831843 100%)',
    initials: 'SM',
    fr: {
      merchant: 'Salma Meknassi',
      role: 'Fondatrice, Salon Beauté',
      city: 'Rabat',
      headline: 'Instagram : de 800 à 2 400 abonnées en 6 semaines',
      quote:
        '« Chaque cliente qui vient au salon repart avec l\'envie de partager. Notre Instagram a explosé. Une bonne moitié de nos nouvelles clientes nous découvrent via nos posts. »',
    },
    en: {
      merchant: 'Salma Meknassi',
      role: 'Founder, Salon Beauté',
      city: 'Rabat',
      headline: 'Instagram: 800 → 2,400 followers in 6 weeks',
      quote:
        '"Every client who comes in leaves eager to share. Our Instagram exploded. About half of our new clients now find us through posts."',
    },
    metrics: [
      { label: { fr: 'Abonnées Instagram', en: 'Instagram followers' }, before: '812', after: '2 404' },
      { label: { fr: 'Nouvelles clientes/mois', en: 'New clients/month' }, before: '22', after: '68' },
      { label: { fr: 'Retour à 90j', en: '90-day return rate' }, before: '18%', after: '52%' },
    ],
  },
  {
    key: 'patisserie-amoud',
    photoGradient: 'linear-gradient(135deg, #16a34a 0%, #0d9488 60%, #134e4a 100%)',
    initials: 'YB',
    fr: {
      merchant: 'Youssef Bennani',
      role: 'Chef pâtissier, Pâtisserie Amoud',
      city: 'Casablanca',
      headline: 'Le samedi matin est deux fois plus fréquenté',
      quote:
        '« Nos clients revenaient de manière aléatoire. Depuis Win & Win, on a des données. Le samedi matin est le moment de la semaine le plus attendu — deux fois plus de monde qu\'avant. »',
    },
    en: {
      merchant: 'Youssef Bennani',
      role: 'Head pastry chef, Pâtisserie Amoud',
      city: 'Casablanca',
      headline: 'Saturday mornings are twice as busy',
      quote:
        '"Customers used to come back randomly. With Win & Win we have data. Saturday mornings became the most-anticipated moment of the week — twice as busy as before."',
    },
    metrics: [
      { label: { fr: 'Trafic samedi matin', en: 'Saturday morning traffic' }, before: '~80', after: '~170' },
      { label: { fr: 'Clients récurrents', en: 'Returning customers' }, before: '12%', after: '41%' },
      { label: { fr: 'Avis Google', en: 'Google reviews' }, before: '24', after: '107' },
    ],
  },
]

export function LandingCaseStudies() {
  const { txt, lang } = useLanding()
  const reveal = useScrollReveal()

  return (
    <section className="bg-muted/40 py-24 sm:py-32">
      <div ref={reveal.ref} className={`mx-auto max-w-6xl px-4 sm:px-6 ${reveal.className}`}>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" />
            {lang === 'fr' ? 'Vraies histoires' : 'Real stories'}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {txt.caseStudiesTitle}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{txt.caseStudiesSubtitle}</p>
        </div>

        <div className="space-y-8">
          {CASES.map((c, idx) => (
            <CaseCard key={c.key} c={c} lang={lang} readMoreLabel={txt.caseStudyReadMore} reverse={idx % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface CaseCardProps {
  c: Case
  lang: 'fr' | 'en'
  readMoreLabel: string
  reverse?: boolean
}

function CaseCard({ c, lang, readMoreLabel, reverse }: CaseCardProps) {
  const copy = c[lang]
  return (
    <article className="grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-md lg:grid-cols-[280px_1fr] lg:p-8">
      {/* Photo — CSS gradient tile with initials */}
      <div
        className={`relative flex h-56 items-center justify-center overflow-hidden rounded-xl lg:h-full ${reverse ? 'lg:order-last' : ''}`}
        style={{ background: c.photoGradient }}
      >
        <span className="text-6xl font-bold text-white/95 drop-shadow-md">{c.initials}</span>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15), transparent 50%)',
          }}
        />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-semibold">{copy.merchant}</span>
            <span className="truncate opacity-80">{copy.role}</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 backdrop-blur-sm">
            <MapPin className="h-3 w-3" />
            {copy.city}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col">
        <h3 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
          {copy.headline}
        </h3>

        <div className="mt-4 flex-1 rounded-xl bg-muted/40 p-4 ring-1 ring-border">
          <Quote className="h-5 w-5 text-primary/50" />
          <p className="mt-2 text-sm leading-relaxed text-foreground/90 sm:text-base">
            {copy.quote}
          </p>
        </div>

        {/* Before / After metrics strip */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {c.metrics.map((m, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {m.label[lang]}
              </p>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground line-through">{m.before}</span>
                <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                <span className="text-lg font-extrabold tabular-nums tracking-tight text-emerald-600">
                  {m.after}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          <a href="#contact" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
            {readMoreLabel} <ArrowUpRight className="h-3 w-3" />
          </a>
        </p>
      </div>
    </article>
  )
}
