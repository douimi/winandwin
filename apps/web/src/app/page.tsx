import { LANDING_TEXT } from './_landing/text'
import { LandingNav } from './_landing/landing-nav'
import { LandingHero } from './_landing/landing-hero'
import { LandingHow } from './_landing/landing-how'
import { LandingGames } from './_landing/landing-games'
import { LandingFeatures } from './_landing/landing-features'
import { LandingPlans } from './_landing/landing-plans'
import { LandingContact } from './_landing/landing-contact'
import { LandingFooter } from './_landing/landing-footer'

export default function HomePage() {
  const txt = LANDING_TEXT.en

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav txt={txt} />
      <main>
        <LandingHero txt={txt} />
        <LandingHow txt={txt} />
        <LandingGames txt={txt} />
        <LandingFeatures txt={txt} />
        <LandingPlans txt={txt} />
        <LandingContact txt={txt} />
      </main>
      <LandingFooter txt={txt} />
    </div>
  )
}
