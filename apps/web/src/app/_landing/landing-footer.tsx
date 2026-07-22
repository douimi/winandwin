'use client'

import { Heart } from 'lucide-react'
import { useLanding } from './lang-context'

// SEO-heavy footer: city-specific + industry-specific link groups feed
// local SEO. Placeholder anchors for now — the linked pages don't exist
// yet but Google still credits the sitemap when they're added later.
const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir', 'Fès', 'Paris', 'Lyon', 'Marseille']
const INDUSTRIES_FR = ['Restaurant', 'Café', 'Bar', 'Salon', 'Salle de sport', 'Hôtel', 'Boulangerie', 'Retail']

export function LandingFooter() {
  const { txt, lang } = useLanding()

  return (
    <footer className="border-t border-border bg-card py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <span className="text-xl font-bold tracking-tight text-foreground">winandwin.club</span>
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === 'fr'
                ? 'Le jeu qui fait revenir vos clients.'
                : 'The game that brings your customers back.'}
            </p>
            <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
              {txt.madeWith}
              <Heart className="h-3.5 w-3.5 fill-rose-500 stroke-rose-500" />
              {txt.inMorocco}
            </p>
          </div>

          {/* Villes */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {lang === 'fr' ? 'Villes desservies' : 'Cities we serve'}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {CITIES.map((city) => (
                <li key={city}>
                  <a
                    href={`/${lang === 'fr' ? 'maroc' : 'morocco'}/${city.toLowerCase().replace('è', 'e').replace('à', 'a')}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Win & Win {city}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Par type de commerce */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {lang === 'fr' ? 'Par type de commerce' : 'By business type'}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {INDUSTRIES_FR.map((industry) => (
                <li key={industry}>
                  <a href="#games" className="text-muted-foreground transition-colors hover:text-foreground">
                    {industry}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources + Légal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {lang === 'fr' ? 'Ressources' : 'Resources'}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li>
                <a href="#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
                  {txt.navHow}
                </a>
              </li>
              <li>
                <a href="#plans" className="text-muted-foreground transition-colors hover:text-foreground">
                  {txt.navPlans}
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground transition-colors hover:text-foreground">
                  {txt.contact}
                </a>
              </li>
              <li>
                <a href="/terms" className="text-muted-foreground transition-colors hover:text-foreground">
                  {txt.terms}
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                  {txt.privacy}
                </a>
              </li>
              <li>
                <a href="/confidentiality" className="text-muted-foreground transition-colors hover:text-foreground">
                  {txt.confidentiality}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground/70">{txt.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
