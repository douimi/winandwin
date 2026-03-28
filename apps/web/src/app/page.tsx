'use client'

import { useState, useEffect, useRef } from 'react'
import { Button, Input, Label } from '@winandwin/ui'

/* ─── Floating emoji background ─── */
const FLOAT_EMOJIS = [
  { emoji: '\uD83C\uDFA1', delay: 0, x: 5, size: 32 },
  { emoji: '\uD83C\uDFB0', delay: 2, x: 15, size: 28 },
  { emoji: '\uD83D\uDCE6', delay: 4, x: 25, size: 24 },
  { emoji: '\uD83C\uDF81', delay: 1, x: 35, size: 30 },
  { emoji: '\u2B50', delay: 3, x: 48, size: 26 },
  { emoji: '\uD83C\uDF89', delay: 5, x: 58, size: 32 },
  { emoji: '\uD83C\uDFA1', delay: 2.5, x: 68, size: 22 },
  { emoji: '\uD83C\uDFB0', delay: 0.5, x: 78, size: 28 },
  { emoji: '\uD83C\uDF81', delay: 3.5, x: 88, size: 26 },
  { emoji: '\u2B50', delay: 1.5, x: 95, size: 20 },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.15; }
          25% { transform: translateY(-30px) rotate(5deg); opacity: 0.25; }
          50% { transform: translateY(-15px) rotate(-3deg); opacity: 0.2; }
          75% { transform: translateY(-40px) rotate(8deg); opacity: 0.18; }
        }
        @keyframes floatUp {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes tilt3d {
          0%, 100% { transform: perspective(600px) rotateY(0deg) rotateX(0deg); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fadeInUp-d1 { animation: fadeInUp 0.8s ease-out 0.1s forwards; opacity: 0; }
        .animate-fadeInUp-d2 { animation: fadeInUp 0.8s ease-out 0.2s forwards; opacity: 0; }
        .animate-fadeInUp-d3 { animation: fadeInUp 0.8s ease-out 0.3s forwards; opacity: 0; }
        .animate-fadeInUp-d4 { animation: fadeInUp 0.8s ease-out 0.4s forwards; opacity: 0; }
        .animate-fadeInUp-d5 { animation: fadeInUp 0.8s ease-out 0.5s forwards; opacity: 0; }
        .animate-fadeInUp-d6 { animation: fadeInUp 0.8s ease-out 0.6s forwards; opacity: 0; }
        .animate-fadeInUp-d7 { animation: fadeInUp 0.8s ease-out 0.7s forwards; opacity: 0; }
        .animate-fadeInUp-d8 { animation: fadeInUp 0.8s ease-out 0.8s forwards; opacity: 0; }
        .animate-slideInLeft { animation: slideInLeft 0.8s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.8s ease-out 0.3s forwards; opacity: 0; }
        .hover-bounce:hover { animation: bounce 0.5s ease-in-out; }
        .hover-tilt { transition: transform 0.3s ease; }
        .hover-tilt:hover { transform: perspective(600px) rotateY(5deg) rotateX(5deg) translateY(-5px); }
        .game-card-glow:hover { box-shadow: 0 20px 60px -15px rgba(99, 102, 241, 0.25); }
        .gradient-border { background: linear-gradient(135deg, #6366f1, #ec4899); padding: 2px; border-radius: 1rem; }
        .gradient-border > div { background: white; border-radius: calc(1rem - 2px); }
      `}</style>

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
            <a href="#contact" className="transition-colors hover:text-foreground">
              Contact
            </a>
          </nav>
          <div className="flex gap-3">
            <a href="/sign-in">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </a>
            <a href="#contact">
              <Button className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] font-semibold shadow-lg shadow-[#6366f1]/25 hover:shadow-xl hover:shadow-[#6366f1]/30">
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated floating emojis */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {FLOAT_EMOJIS.map((item, i) => (
            <span
              key={i}
              className="absolute"
              style={{
                left: `${item.x}%`,
                top: '50%',
                fontSize: `${item.size}px`,
                animation: `float 6s ease-in-out ${item.delay}s infinite`,
              }}
            >
              {item.emoji}
            </span>
          ))}
        </div>

        {/* Background gradients */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 via-transparent to-[#ec4899]/5" />
        <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-[#6366f1]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-[#ec4899]/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8b5cf6]/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 lg:pt-32">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left - Copy */}
            <div className="text-center lg:text-left animate-slideInLeft">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#6366f1]/20 bg-[#6366f1]/5 px-4 py-1.5 text-sm font-medium text-[#6366f1]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6366f1] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6366f1]" />
                </span>
                Gamification marketing for restaurants &amp; businesses
              </div>

              <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Turn Your Customers Into{' '}
                <span className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
                  Loyal Fans
                </span>
                {' '}&mdash; With Games They Love
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Deploy QR-code games in your restaurant or shop. Collect Google reviews, grow social
                media, and drive repeat visits with smart, time-limited prizes.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                <a href="#contact">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] px-8 text-base font-semibold shadow-lg shadow-[#6366f1]/25 transition-all hover:shadow-xl hover:shadow-[#6366f1]/30 hover:scale-105"
                  >
                    Contact Us
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="px-8 text-base font-semibold transition-all hover:scale-105">
                    See How It Works
                  </Button>
                </a>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-4 rounded-2xl border bg-white/60 p-6 shadow-sm backdrop-blur-sm">
                <StatItem value="+200" label="reviews / month" delay={0} />
                <StatItem value="+25%" label="return rate" delay={0.2} border />
                <StatItem value="<10 min" label="setup time" delay={0.4} />
              </div>
            </div>

            {/* Right - Phone Mockup */}
            <div className="flex justify-center animate-slideInRight">
              <div className="relative">
                <div
                  className="relative h-[580px] w-[290px] overflow-hidden rounded-[3rem] border-[8px] border-gray-900 bg-gradient-to-b from-[#6366f1] to-[#4f46e5] shadow-2xl shadow-[#6366f1]/30"
                  style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
                >
                  <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-gray-900" />
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
                        <path d="M100,100 L100,5 A95,95 0 0,1 182,52 Z" fill="#f472b6" />
                        <path d="M100,100 L182,52 A95,95 0 0,1 182,148 Z" fill="#818cf8" />
                        <path d="M100,100 L182,148 A95,95 0 0,1 100,195 Z" fill="#f472b6" />
                        <path d="M100,100 L100,195 A95,95 0 0,1 18,148 Z" fill="#a78bfa" />
                        <path d="M100,100 L18,148 A95,95 0 0,1 18,52 Z" fill="#f472b6" />
                        <path d="M100,100 L18,52 A95,95 0 0,1 100,5 Z" fill="#818cf8" />
                        <circle cx="100" cy="100" r="18" fill="white" />
                        <text x="100" y="105" textAnchor="middle" fontSize="16" fill="#6366f1" fontWeight="bold">GO</text>
                        <text x="125" y="45" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" transform="rotate(30 125 45)">10%</text>
                        <text x="165" y="100" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" transform="rotate(90 165 100)">FREE</text>
                        <text x="125" y="160" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" transform="rotate(150 125 160)">5%</text>
                        <text x="75" y="160" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" transform="rotate(210 75 160)">20%</text>
                        <text x="35" y="100" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" transform="rotate(270 35 100)">GIFT</text>
                        <text x="75" y="45" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" transform="rotate(330 75 45)">15%</text>
                      </svg>
                    </div>

                    <div className="mt-6 w-full space-y-2">
                      <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-white">
                        <span>{'\uD83C\uDF81'}</span><span>Free dessert</span>
                        <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px]">10%</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-white">
                        <span>{'\u2615'}</span><span>Free coffee</span>
                        <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px]">25%</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-white">
                        <span>{'\uD83D\uDCB0'}</span><span>20% off next visit</span>
                        <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px]">15%</span>
                      </div>
                    </div>

                    <div className="mt-auto mb-4 flex w-full items-center justify-center gap-1 text-[10px] text-white/40">
                      Powered by <span className="font-bold text-white/60">Win &amp; Win</span>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#ec4899]/20 blur-xl" />
                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-[#6366f1]/20 blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gradient-to-b from-muted/30 to-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center animate-fadeInUp">
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
              icon={'\uD83C\uDFAE'}
              title="Create Your Game"
              description="Configure prizes, branding, and rules in minutes. Choose from Wheel of Fortune, Slot Machine, or Mystery Box."
              delay="animate-fadeInUp-d2"
            />
            <StepCard
              number={2}
              icon={'\uD83D\uDCF1'}
              title="Print QR Code"
              description="Place on tables, counters, or menus. Customers scan and play instantly -- no app download needed."
              delay="animate-fadeInUp-d4"
            />
            <StepCard
              number={3}
              icon={'\uD83C\uDF89'}
              title="Customers Play & Win"
              description="They engage, you grow. Collect Google reviews, gain followers, and drive return visits automatically."
              delay="animate-fadeInUp-d6"
            />
          </div>
        </div>
      </section>

      {/* Game Types */}
      <section id="games" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center animate-fadeInUp">
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
              emoji={'\uD83C\uDFA1'}
              title="Wheel of Fortune"
              description="The classic spin-to-win experience. Customers spin the wheel and land on exciting prizes. Highly visual and addictive."
              gradient="from-[#6366f1] to-[#818cf8]"
              delay="animate-fadeInUp-d2"
            />
            <GameCard
              emoji={'\uD83C\uDFB0'}
              title="Slot Machine"
              description="Match symbols to win rewards. The anticipation of each reel stopping creates unforgettable excitement."
              gradient="from-[#ec4899] to-[#f472b6]"
              delay="animate-fadeInUp-d4"
            />
            <GameCard
              emoji={'\uD83D\uDCE6'}
              title="Mystery Box"
              description="Tap to reveal a hidden prize. Simple, elegant, and perfect for quick interactions at the counter."
              gradient="from-[#8b5cf6] to-[#a78bfa]"
              delay="animate-fadeInUp-d6"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gradient-to-b from-muted/30 to-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center animate-fadeInUp">
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
            <FeatureCard icon={'\u2B50'} title="Collect Google Reviews" description="Deep-link customers to your Google review page before they play. Track new reviews and watch your rating climb." delay="animate-fadeInUp-d1" />
            <FeatureCard icon={'\uD83D\uDCF1'} title="Grow Social Media" description="Require Instagram follows or story shares as entry conditions. Turn every player into a follower." delay="animate-fadeInUp-d2" />
            <FeatureCard icon={'\uD83C\uDF9F\uFE0F'} title="Smart Coupons" description="Time-limited, device-bound, fraud-proof coupons that expire to drive urgency and return visits." delay="animate-fadeInUp-d3" />
            <FeatureCard icon={'\uD83D\uDCCA'} title="Real-Time Analytics" description="Track plays, wins, redemptions, and conversion rates. Know exactly what's working and optimize." delay="animate-fadeInUp-d4" />
            <FeatureCard icon={'\uD83D\uDDA8\uFE0F'} title="QR Code Materials" description="Download print-ready posters, table tents, and stickers. Professional designs ready to deploy." delay="animate-fadeInUp-d5" />
            <FeatureCard icon={'\uD83D\uDEE1\uFE0F'} title="Anti-Fraud Protection" description="Device fingerprinting prevents abuse. One play per customer, no cheating, no duplicate entries." delay="animate-fadeInUp-d6" />
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center animate-fadeInUp">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Get Started{' '}
              <span className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-transparent">
                Today
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Tell us about your business and we&apos;ll get you set up with a personalized demo.
            </p>
          </div>

          <div className="mt-12 animate-fadeInUp-d2">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Transform Your Business?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Join hundreds of businesses already using Win &amp; Win to boost reviews, grow
            followers, and increase repeat visits.
          </p>
          <a href="#contact" className="mt-8 inline-block">
            <Button
              size="lg"
              className="bg-white px-8 text-base font-semibold text-[#6366f1] shadow-lg hover:bg-white/90 transition-all hover:scale-105"
            >
              Contact Us
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
              <a href="#contact" className="transition-colors hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Win &amp; Win. All rights reserved.</p>
            <p className="mt-1">Made with {'\u2764\uFE0F'} in France</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─── Sub-components ─── */

function StatItem({ value, label, delay, border }: { value: string; label: string; delay: number; border?: boolean }) {
  return (
    <div className={`text-center ${border ? 'border-x' : ''}`} style={{ animation: `countUp 0.6s ease-out ${delay}s forwards` }}>
      <div className="text-2xl font-extrabold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</div>
    </div>
  )
}

function StepCard({
  number,
  icon,
  title,
  description,
  delay,
}: {
  number: number
  icon: string
  title: string
  description: string
  delay: string
}) {
  return (
    <div className={`relative rounded-2xl border bg-white p-8 text-center shadow-sm transition-all hover:shadow-lg hover:-translate-y-2 hover-bounce cursor-default ${delay}`}>
      {/* Connector line */}
      {number < 3 && (
        <div className="absolute -right-4 top-1/2 hidden h-0.5 w-8 bg-gradient-to-r from-[#6366f1] to-[#ec4899] md:block" />
      )}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#6366f1] to-[#ec4899] text-lg font-bold text-white shadow-lg shadow-[#6366f1]/25">
        {number}
      </div>
      <div className="mt-4 text-4xl" style={{ animation: `bounce 2s ease-in-out ${number * 0.3}s infinite` }}>
        {icon}
      </div>
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

function GameCard({
  emoji,
  title,
  description,
  gradient,
  delay,
}: {
  emoji: string
  title: string
  description: string
  gradient: string
  delay: string
}) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 hover-tilt game-card-glow ${delay}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#6366f1]/5 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-5xl shadow-lg`}>
          <span className="drop-shadow-lg">{emoji}</span>
        </div>
        <h3 className="mt-5 text-xl font-bold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-5">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#6366f1] transition-all group-hover:gap-2">
            Learn more
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-1">
              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  delay,
}: {
  icon: string
  title: string
  description: string
  delay: string
}) {
  return (
    <div className={`gradient-border transition-all hover:-translate-y-1 hover:shadow-lg ${delay}`}>
      <div className="rounded-[calc(1rem-2px)] bg-white p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366f1]/10 to-[#ec4899]/10 text-2xl">
          {icon}
        </div>
        <h3 className="mt-4 font-bold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function ContactForm() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('submitting')
    setErrorMsg('')

    const formData = new FormData(e.currentTarget)
    const body = {
      businessName: formData.get('businessName') as string,
      contactName: formData.get('contactName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      businessType: formData.get('businessType') as string,
      message: formData.get('message') as string,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong')
      }

      setFormState('success')
      formRef.current?.reset()
    } catch (err) {
      setFormState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (formState === 'success') {
    return (
      <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-12 text-center">
        <div className="text-5xl">{'\uD83C\uDF89'}</div>
        <h3 className="mt-4 text-2xl font-bold text-green-800">Thanks! We&apos;ll reach out within 24 hours.</h3>
        <p className="mt-2 text-green-600">
          Check your email for a confirmation. We&apos;re excited to help you grow your business!
        </p>
        <button
          type="button"
          onClick={() => setFormState('idle')}
          className="mt-6 text-sm font-medium text-green-700 underline hover:text-green-900"
        >
          Submit another request
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="rounded-2xl border bg-white p-8 shadow-lg shadow-[#6366f1]/5">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name *</Label>
          <Input id="businessName" name="businessName" required placeholder="Restaurant Le Petit" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name *</Label>
          <Input id="contactName" name="contactName" required placeholder="Jean Dupont" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required placeholder="jean@restaurant.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+33 6 12 34 56 78" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="businessType">Business Type</Label>
          <select
            id="businessType"
            name="businessType"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select your business type...</option>
            <option value="restaurant">Restaurant</option>
            <option value="cafe">Cafe</option>
            <option value="bar">Bar</option>
            <option value="retail">Retail Store</option>
            <option value="salon">Hair / Beauty Salon</option>
            <option value="gym">Gym / Fitness</option>
            <option value="hotel">Hotel</option>
            <option value="entertainment">Entertainment</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Tell us about your business and what you're looking for..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      {formState === 'error' && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {errorMsg || 'Something went wrong. Please try again.'}
        </div>
      )}

      <div className="mt-6">
        <Button
          type="submit"
          size="lg"
          disabled={formState === 'submitting'}
          className="w-full bg-gradient-to-r from-[#6366f1] to-[#ec4899] text-base font-semibold shadow-lg shadow-[#6366f1]/25 transition-all hover:shadow-xl hover:shadow-[#6366f1]/30 hover:scale-[1.02] disabled:opacity-50"
        >
          {formState === 'submitting' ? 'Sending...' : 'Get Started'}
        </Button>
      </div>
    </form>
  )
}
