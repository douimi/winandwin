import type { CityMeta } from './cities'
import { LandingBattle } from './landing-battle'
import { LandingCaseStudies } from './landing-case-studies'
import { LandingCityHero } from './landing-city-hero'
import { LandingContact } from './landing-contact'
import { LandingDashboardPreview } from './landing-dashboard-preview'
import { LandingFeatures } from './landing-features'
import { LandingFooter } from './landing-footer'
import { LandingGames } from './landing-games'
import { LandingHow } from './landing-how'
import { LandingIndustries } from './landing-industries'
import { LandingLangProvider } from './lang-context'
import { LandingNav } from './landing-nav'
import { LandingOfferBar } from './landing-offer-bar'
import { LandingPlans } from './landing-plans'
import { LandingRoiCalculator } from './landing-roi-calculator'
import { LandingTicker } from './landing-ticker'
import { LandingWhatsAppFab } from './landing-whatsapp-fab'

/**
 * Shared shell for /maroc/[city] and /france/[city] pages.
 *
 * We reuse every landing section as-is and swap only the hero for a
 * city-personalised one. The lang provider keeps FR default + EN toggle
 * consistent with the root landing page.
 */
export function CityPage({ city }: { city: CityMeta }) {
  return (
    <LandingLangProvider>
      <div className="min-h-screen bg-background text-foreground">
        <LandingOfferBar />
        <LandingNav />
        <main>
          <LandingCityHero city={city} />
          <LandingTicker />
          <LandingHow />
          <LandingGames />
          <LandingIndustries />
          <LandingFeatures />
          <LandingDashboardPreview />
          <LandingCaseStudies />
          <LandingBattle />
          <LandingRoiCalculator />
          <LandingPlans />
          <LandingContact />
        </main>
        <LandingFooter />
        <LandingWhatsAppFab />
      </div>
    </LandingLangProvider>
  )
}
