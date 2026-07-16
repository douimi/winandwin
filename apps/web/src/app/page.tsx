import { LandingLangProvider } from './_landing/lang-context'
import { LandingNav } from './_landing/landing-nav'
import { LandingOfferBar } from './_landing/landing-offer-bar'
import { LandingHero } from './_landing/landing-hero'
import { LandingTicker } from './_landing/landing-ticker'
import { LandingHow } from './_landing/landing-how'
import { LandingGames } from './_landing/landing-games'
import { LandingFeatures } from './_landing/landing-features'
import { LandingBattle } from './_landing/landing-battle'
import { LandingPlans } from './_landing/landing-plans'
import { LandingContact } from './_landing/landing-contact'
import { LandingFooter } from './_landing/landing-footer'
import { LandingWhatsAppFab } from './_landing/landing-whatsapp-fab'

export default function HomePage() {
  return (
    <LandingLangProvider>
      <div className="min-h-screen bg-background text-foreground">
        <LandingOfferBar />
        <LandingNav />
        <main>
          <LandingHero />
          <LandingTicker />
          <LandingHow />
          <LandingGames />
          <LandingFeatures />
          <LandingBattle />
          <LandingPlans />
          <LandingContact />
        </main>
        <LandingFooter />
        <LandingWhatsAppFab />
      </div>
    </LandingLangProvider>
  )
}
