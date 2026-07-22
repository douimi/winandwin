'use client'

import { ChevronRight, ScrollText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLanding } from '../_landing/lang-context'
import { LandingFooter } from '../_landing/landing-footer'
import { LandingNav } from '../_landing/landing-nav'

/**
 * Bilingual legal-page shell shared by /privacy, /terms and /confidentiality.
 *
 * Each page passes a `content` prop with the FR + EN variants of every
 * section. The shell wraps them in the same landing nav + footer, keeps
 * the FR/EN toggle live, and renders a sticky table of contents.
 */

export interface LegalSection {
  id: string
  fr: {
    heading: string
    body: LegalBlock[]
  }
  en: {
    heading: string
    body: LegalBlock[]
  }
}

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'callout'; tone: 'info' | 'warn'; text: string }
  | { type: 'sub'; text: string }

export interface LegalPageProps {
  /** Distinct slug used to build in-page anchors — mostly for analytics. */
  slug: string
  fr: {
    title: string
    intro: string
    lastUpdated: string
  }
  en: {
    title: string
    intro: string
    lastUpdated: string
  }
  sections: LegalSection[]
}

export function LegalPage({ slug, fr, en, sections }: LegalPageProps) {
  const { lang } = useLanding()
  const head = lang === 'fr' ? fr : en
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Highlight the current section in the sticky TOC as the user scrolls.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        // Prefer the topmost intersecting section so the highlight tracks
        // the visible heading, not the last one that crossed the boundary.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0.01 },
    )
    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [sections])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />

      <main className="relative">
        {/* Soft header wash so the top of the page has visual weight */}
        <div className="relative overflow-hidden border-b border-border bg-primary/[0.03]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <ScrollText className="h-3 w-3" />
              {lang === 'fr' ? 'Documents légaux' : 'Legal documents'}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {head.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {head.intro}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {lang === 'fr' ? 'Dernière mise à jour :' : 'Last updated:'}{' '}
              <span className="font-medium text-foreground">{head.lastUpdated}</span>
            </p>
          </div>
        </div>

        {/* Body — two columns on desktop: sticky TOC + prose */}
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[220px_1fr]">
          {/* Sticky table of contents */}
          <nav
            aria-label={lang === 'fr' ? 'Sommaire' : 'Table of contents'}
            className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {lang === 'fr' ? 'Sommaire' : 'On this page'}
            </p>
            <ul className="space-y-1 text-sm">
              {sections.map((s) => {
                const isActive = activeSection === s.id
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      data-slug={slug}
                      className={`group flex items-start gap-1.5 rounded-md py-1 pl-2 pr-1 transition-colors ${
                        isActive
                          ? 'bg-primary/5 font-semibold text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <ChevronRight className={`mt-0.5 h-3 w-3 shrink-0 transition-transform ${isActive ? 'text-primary' : 'text-muted-foreground/40 group-hover:translate-x-0.5'}`} />
                      <span className="leading-snug">
                        {(lang === 'fr' ? s.fr.heading : s.en.heading)}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Prose */}
          <article className="prose-legal space-y-10">
            {sections.map((s) => {
              const section = lang === 'fr' ? s.fr : s.en
              return (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4 text-sm leading-relaxed text-foreground/90 sm:text-base">
                    {section.body.map((block, i) => (
                      <LegalBlockRenderer key={`${s.id}-${i}`} block={block} />
                    ))}
                  </div>
                </section>
              )
            })}
          </article>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}

function LegalBlockRenderer({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'p':
      return <p>{block.text}</p>
    case 'sub':
      return <h3 className="mt-6 text-base font-semibold tracking-tight text-foreground">{block.text}</h3>
    case 'ul':
      return (
        <ul className="list-disc space-y-1.5 pl-5 marker:text-primary/60">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-primary">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      )
    case 'callout':
      return (
        <aside
          className={`rounded-xl border px-4 py-3 text-sm ${
            block.tone === 'warn'
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-primary/20 bg-primary/5 text-foreground'
          }`}
        >
          {block.text}
        </aside>
      )
    default:
      return null
  }
}
