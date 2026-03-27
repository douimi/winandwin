import { Button, Card, CardContent } from '@winandwin/ui'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            Win &amp; Win
          </span>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How It Works
            </a>
            <a href="#games" className="transition-colors hover:text-foreground">
              Games
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
          </nav>
          <div className="flex gap-3">
            <a href="/sign-in">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </a>
            <a href="/sign-up">
              <Button>Get Started Free</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 via-transparent to-[#ec4899]/5" />
        <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-[#6366f1]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-[#ec4899]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 lg:pt-32">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left — Copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#6366f1]/20 bg-[#6366f1]/5 px-4 py-1.5 text-sm font-medium text-[#6366f1]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6366f1] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6366f1]" />
                </span>
                Gamification marketing for physical businesses
              </div>

              <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Turn Every Visit Into a Game Your Customers{' '}
                <span className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-transparent">
                  Love
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Deploy QR-code games in your business. Collect Google reviews, grow your social
                media, and drive repeat visits with smart, time-limited prizes.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                <a href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] px-8 text-base font-semibold shadow-lg shadow-[#6366f1]/25 transition-shadow hover:shadow-xl hover:shadow-[#6366f1]/30"
                  >
                    Start Free
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="px-8 text-base font-semibold">
                    See How It Works
                  </Button>
                </a>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-4 rounded-2xl border bg-white/60 p-6 shadow-sm backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-[#6366f1] sm:text-3xl">+200</div>
                  <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    reviews / month
                  </div>
                </div>
                <div className="border-x text-center">
                  <div className="text-2xl font-extrabold text-[#6366f1] sm:text-3xl">+25%</div>
                  <div className="mt-1 text-xs text-muted-foreground sm:text-sm">return rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-[#6366f1] sm:text-3xl">
                    &lt;10 min
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground sm:text-sm">setup time</div>
                </div>
              </div>
            </div>

            {/* Right — Phone Mockup */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Phone frame */}
                <div className="relative h-[580px] w-[290px] overflow-hidden rounded-[3rem] border-[8px] border-gray-900 bg-gradient-to-b from-[#6366f1] to-[#4f46e5] shadow-2xl shadow-[#6366f1]/30">
                  {/* Notch */}
                  <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-gray-900" />

                  {/* Screen Content */}
                  <div className="flex h-full flex-col items-center px-4 pt-12">
                    <div className="text-center text-xs font-semibold tracking-widest text-white/60">
                      TAP TO SPIN
                    </div>
                    <div className="mt-2 text-center text-sm font-bold text-white">
                      Win a prize!
                    </div>

                    {/* Wheel */}
                    <div className="mt-6 flex items-center justify-center">
                      <svg width="200" height="200" viewBox="0 0 200 200" className="animate-[spin_8s_linear_infinite]">
                        <circle cx="100" cy="100" r="95" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
                        {/* Wheel segments */}
                        <path d="M100,100 L100,5 A95,95 0 0,1 182,52 Z" fill="#f472b6" />
                        <path d="M100,100 L182,52 A95,95 0 0,1 182,148 Z" fill="#818cf8" />
                        <path d="M100,100 L182,148 A95,95 0 0,1 100,195 Z" fill="#f472b6" />
                        <path d="M100,100 L100,195 A95,95 0 0,1 18,148 Z" fill="#a78bfa" />
                        <path d="M100,100 L18,148 A95,95 0 0,1 18,52 Z" fill="#f472b6" />
                        <path d="M100,100 L18,52 A95,95 0 0,1 100,5 Z" fill="#818cf8" />
                        {/* Center */}
                        <circle cx="100" cy="100" r="18" fill="white" />
                        <text x="100" y="105" textAnchor="middle" fontSize="16" fill="#6366f1" fontWeight="bold">GO</text>
                        {/* Labels */}
                        <text x="125" y="45" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" transform="rotate(30 125 45)">10%</text>
                        <text x="165" y="100" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" transform="rotate(90 165 100)">FREE</text>
                        <text x="125" y="160" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" transform="rotate(150 125 160)">5%</text>
                        <text x="75" y="160" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" transform="rotate(210 75 160)">20%</text>
                        <text x="35" y="100" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" transform="rotate(270 35 100)">GIFT</text>
                        <text x="75" y="45" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" transform="rotate(330 75 45)">15%</text>
                      </svg>
                    </div>

                    {/* Prize list */}
                    <div className="mt-6 w-full space-y-2">
                      <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-white">
                        <span>🎁</span>
                        <span>Free dessert</span>
                        <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                          10%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-white">
                        <span>☕</span>
                        <span>Free coffee</span>
                        <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                          25%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-white">
                        <span>💰</span>
                        <span>20% off next visit</span>
                        <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                          15%
                        </span>
                      </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-auto mb-4 flex w-full items-center justify-center gap-1 text-[10px] text-white/40">
                      Powered by <span className="font-bold text-white/60">Win &amp; Win</span>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#ec4899]/20 blur-xl" />
                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-[#6366f1]/20 blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Up and Running in{' '}
              <span className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              No technical skills needed. Go from sign-up to first player in under 10 minutes.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <StepCard
              number={1}
              icon="🎮"
              title="Set Up Your Game"
              description="Configure prizes, branding, and rules in minutes. Choose from Wheel of Fortune, Slot Machine, or Mystery Box."
            />
            <StepCard
              number={2}
              icon="📱"
              title="Print Your QR Code"
              description="Place it on table tents, posters, or receipts. Customers scan and play instantly — no app download needed."
            />
            <StepCard
              number={3}
              icon="📈"
              title="Watch Customers Engage"
              description="Collect Google reviews, gain followers, and drive return visits. Track everything in real-time analytics."
            />
          </div>
        </div>
      </section>

      {/* Game Types */}
      <section id="games" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Games Your Customers Will{' '}
              <span className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-transparent">
                Love to Play
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Three interactive game types, each designed to maximize engagement and delight.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <GameCard
              emoji="🎡"
              title="Wheel of Fortune"
              description="The classic spin-to-win experience. Customers spin the wheel and land on exciting prizes. Highly visual and addictive."
              color="#6366f1"
            />
            <GameCard
              emoji="🎰"
              title="Slot Machine"
              description="Match symbols to win rewards. The anticipation of each reel stopping creates unforgettable excitement."
              color="#ec4899"
            />
            <GameCard
              emoji="📦"
              title="Mystery Box"
              description="Tap to reveal a hidden prize. Simple, elegant, and perfect for quick interactions at the counter."
              color="#8b5cf6"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-transparent">
                Grow Your Business
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Powerful features that work together to drive real business results.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="⭐"
              title="Collect Google Reviews"
              description="Deep-link customers to your Google review page before they play. Track new reviews and watch your rating climb."
            />
            <FeatureCard
              icon="📱"
              title="Grow Social Media"
              description="Require Instagram follows or story shares as entry conditions. Turn every player into a follower."
            />
            <FeatureCard
              icon="🎟️"
              title="Smart Coupons"
              description="Time-limited, device-bound, fraud-proof coupons that expire to drive urgency and return visits."
            />
            <FeatureCard
              icon="📊"
              title="Real-Time Analytics"
              description="Track plays, wins, redemptions, and conversion rates. Know exactly what's working and optimize."
            />
            <FeatureCard
              icon="🖨️"
              title="QR Code Materials"
              description="Download print-ready posters, table tents, and stickers. Professional designs ready to deploy."
            />
            <FeatureCard
              icon="🛡️"
              title="Anti-Fraud Protection"
              description="Device fingerprinting prevents abuse. One play per customer, no cheating, no duplicate entries."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Simple,{' '}
              <span className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-transparent">
                Transparent Pricing
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Start free and scale as your business grows. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="mt-16 grid items-start gap-8 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-2xl border bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Free
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold">0&euro;</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Perfect to try it out with your first campaign.
              </p>
              <a href="/sign-up" className="mt-8 block">
                <Button variant="outline" className="w-full">
                  Start Free
                </Button>
              </a>
              <ul className="mt-8 space-y-3 text-sm">
                <PricingFeature>1 active campaign</PricingFeature>
                <PricingFeature>100 plays / month</PricingFeature>
                <PricingFeature>Wheel of Fortune only</PricingFeature>
                <PricingFeature>Basic analytics</PricingFeature>
                <PricingFeature>Win &amp; Win branding</PricingFeature>
              </ul>
            </div>

            {/* Starter */}
            <div className="rounded-2xl border bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Starter
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold">49&euro;</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                For growing businesses ready to level up engagement.
              </p>
              <a href="/sign-up" className="mt-8 block">
                <Button variant="outline" className="w-full">
                  Start Free Trial
                </Button>
              </a>
              <ul className="mt-8 space-y-3 text-sm">
                <PricingFeature>3 active campaigns</PricingFeature>
                <PricingFeature>1,000 plays / month</PricingFeature>
                <PricingFeature>All game types</PricingFeature>
                <PricingFeature>Google Review collection</PricingFeature>
                <PricingFeature>Custom branding</PricingFeature>
                <PricingFeature>QR code materials</PricingFeature>
              </ul>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl border-2 border-[#6366f1] bg-white p-8 shadow-lg shadow-[#6366f1]/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#ec4899] px-4 py-1 text-xs font-bold text-white">
                Most Popular
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-[#6366f1]">
                Pro
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold">149&euro;</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                For serious businesses that want maximum results.
              </p>
              <a href="/sign-up" className="mt-8 block">
                <Button className="w-full bg-gradient-to-r from-[#6366f1] to-[#ec4899] font-semibold shadow-lg shadow-[#6366f1]/25">
                  Start Free Trial
                </Button>
              </a>
              <ul className="mt-8 space-y-3 text-sm">
                <PricingFeature>Unlimited campaigns</PricingFeature>
                <PricingFeature>Unlimited plays</PricingFeature>
                <PricingFeature>All game types</PricingFeature>
                <PricingFeature>Advanced analytics</PricingFeature>
                <PricingFeature>Anti-fraud protection</PricingFeature>
                <PricingFeature>Priority support</PricingFeature>
                <PricingFeature>White-label branding</PricingFeature>
                <PricingFeature>API access</PricingFeature>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Gamify Your Business?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Join hundreds of businesses already using Win &amp; Win to boost reviews, grow
            followers, and increase repeat visits.
          </p>
          <a href="/sign-up" className="mt-8 inline-block">
            <Button
              size="lg"
              className="bg-white px-8 text-base font-semibold text-[#6366f1] shadow-lg hover:bg-white/90"
            >
              Start Free — No Credit Card
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <span className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-lg font-extrabold text-transparent">
                Win &amp; Win
              </span>
              <p className="mt-1 text-sm text-muted-foreground">
                Gamification marketing for physical businesses.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="transition-colors hover:text-foreground">
                Terms
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Win &amp; Win. All rights reserved.</p>
            <p className="mt-1">Made with ❤️ in France</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─── Sub-components ─── */

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: number
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="relative rounded-2xl border bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#6366f1] to-[#ec4899] text-lg font-bold text-white shadow-md">
        {number}
      </div>
      <div className="mt-4 text-3xl">{icon}</div>
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

function GameCard({
  emoji,
  title,
  description,
  color,
}: {
  emoji: string
  title: string
  description: string
  color: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div
        className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: `linear-gradient(135deg, ${color}08, ${color}15)` }}
      />
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl" style={{ backgroundColor: `${color}10` }}>
          {emoji}
        </div>
        <h3 className="mt-5 text-xl font-bold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-5">
          <span
            className="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
            style={{ color }}
          >
            Learn more
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform group-hover:translate-x-1"
            >
              <path
                d="M6 12l4-4-4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366f1]/10 text-2xl">
        {icon}
      </div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="mt-0.5 shrink-0 text-[#6366f1]"
      >
        <path
          d="M16.667 5L7.5 14.167 3.333 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{children}</span>
    </li>
  )
}
