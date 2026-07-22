import { LandingLangProvider } from './_landing/lang-context'
import { LandingNav } from './_landing/landing-nav'
import { LandingHero } from './_landing/landing-hero'
import { LandingTicker } from './_landing/landing-ticker'
import { LandingHow } from './_landing/landing-how'
import { LandingGames } from './_landing/landing-games'
import { LandingIndustries } from './_landing/landing-industries'
import { LandingFeatures } from './_landing/landing-features'
import { LandingDashboardPreview } from './_landing/landing-dashboard-preview'
import { LandingCaseStudies } from './_landing/landing-case-studies'
import { LandingBattle } from './_landing/landing-battle'
import { LandingRoiCalculator } from './_landing/landing-roi-calculator'
import { LandingPlans } from './_landing/landing-plans'
import { LandingContact } from './_landing/landing-contact'
import { LandingFooter } from './_landing/landing-footer'
import { LandingWhatsAppFab } from './_landing/landing-whatsapp-fab'

export default function HomePage() {
  return (
    <LandingLangProvider>
      <div className="min-h-screen bg-background text-foreground">
        <LandingNav />
        <main>
          <LandingHero />
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
