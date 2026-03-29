'use client'

import { useEffect, useState } from 'react'
import { Button, Card, CardContent, Input, Label } from '@winandwin/ui'

function useIsLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(false)
  useEffect(() => {
    fetch('/api/auth/check')
      .then((r) => r.json())
      .then((data: { authenticated: boolean }) => setLoggedIn(data.authenticated))
      .catch(() => setLoggedIn(false))
  }, [])
  return loggedIn
}

/* ─────────────────────────  CSS Animations (inline style tag)  ───────────────────────── */
const GLOBAL_STYLES = `
  html { scroll-behavior: smooth; }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
  @keyframes heroOrb {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
    33% { transform: translate(30px, -20px) scale(1.1); opacity: 0.6; }
    66% { transform: translate(-20px, 15px) scale(0.95); opacity: 0.35; }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes spinSlow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes bounceIn {
    0% { transform: scale(0.5); opacity: 0; }
    60% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes slotScroll {
    0% { transform: translateY(0); }
    100% { transform: translateY(-60px); }
  }
  @keyframes boxBounce {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.15) rotate(-3deg); }
    50% { transform: scale(0.95) rotate(3deg); }
    75% { transform: scale(1.1) rotate(-2deg); }
  }
  @keyframes phoneWheel {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .animate-slideUp { animation: slideUp 0.7s ease-out both; }
  .animate-slideUp-d1 { animation: slideUp 0.7s ease-out 0.15s both; }
  .animate-slideUp-d2 { animation: slideUp 0.7s ease-out 0.3s both; }
  .animate-slideUp-d3 { animation: slideUp 0.7s ease-out 0.45s both; }
  .animate-slideUp-d4 { animation: slideUp 0.7s ease-out 0.6s both; }
  .animate-slideUp-d5 { animation: slideUp 0.7s ease-out 0.75s both; }

  .game-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .game-card:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); }

  .game-card:hover .wheel-spin { animation: spinSlow 1s linear infinite; }
  .game-card:hover .slot-scroll { animation: slotScroll 0.4s linear infinite; }
  .game-card:hover .box-bounce { animation: boxBounce 0.6s ease-in-out infinite; }

  .plan-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .plan-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -12px rgba(99,102,241,0.2); }
`


/* ─────────────────────────  SVG Wheel for phone mockup  ───────────────────────── */
function PhoneWheelSVG() {
  const segments = [
    { color: '#f59e0b', emoji: '🎁' },
    { color: '#6366f1', emoji: '⭐' },
    { color: '#10b981', emoji: '🎉' },
    { color: '#ec4899', emoji: '🏆' },
    { color: '#f97316', emoji: '🎁' },
    { color: '#8b5cf6', emoji: '⭐' },
    { color: '#14b8a6', emoji: '🎉' },
    { color: '#ef4444', emoji: '🏆' },
  ]
  const n = segments.length
  const r = 100
  const cx = 110
  const cy = 110

  return (
    <svg viewBox="0 0 220 220" className="w-full h-full">
      {segments.map((seg, i) => {
        const startAngle = (i * 360) / n
        const endAngle = ((i + 1) * 360) / n
        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180
        const x1 = cx + r * Math.cos(startRad)
        const y1 = cy + r * Math.sin(startRad)
        const x2 = cx + r * Math.cos(endRad)
        const y2 = cy + r * Math.sin(endRad)
        const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180)
        const tx = cx + r * 0.6 * Math.cos(midAngle)
        const ty = cy + r * 0.6 * Math.sin(midAngle)

        return (
          <g key={i}>
            <path
              d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
              fill={seg.color}
              stroke="white"
              strokeWidth="2"
            />
            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize="18">
              {seg.emoji}
            </text>
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r="14" fill="white" stroke="#6366f1" strokeWidth="3" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="bold" fill="#6366f1">
        SPIN
      </text>
    </svg>
  )
}

/* ─────────────────────────  Contact Form (client component)  ───────────────────────── */
function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [form, setForm] = useState({
    businessName: '',
    name: '',
    email: '',
    phone: '',
    businessType: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl"
          style={{ animation: 'bounceIn 0.6s ease-out both' }}
        >
          ✓
        </div>
        <h3 className="mt-6 text-2xl font-bold text-gray-900">Thanks! We'll reach out within 24 hours.</h3>
        <p className="mt-2 text-gray-500">Check your inbox for a confirmation email.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="businessName">Business Name *</Label>
          <Input id="businessName" name="businessName" required value={form.businessName} onChange={handleChange} placeholder="e.g. Café Parisien" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Your Name *</Label>
          <Input id="name" name="name" required value={form.name} onChange={handleChange} placeholder="Jean Dupont" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="jean@cafe.fr" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+33 6 12 34 56 78" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="businessType">Business Type *</Label>
        <select
          id="businessType"
          name="businessType"
          required
          value={form.businessType}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Select your business type</option>
          <option value="restaurant">Restaurant</option>
          <option value="cafe">Cafe</option>
          <option value="bar">Bar</option>
          <option value="retail">Retail</option>
          <option value="salon">Salon</option>
          <option value="gym">Gym</option>
          <option value="hotel">Hotel</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message (optional)</Label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={3}
          placeholder="Tell us about your business and goals..."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
      )}
      <Button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-gradient-to-r from-[#6366f1] to-[#ec4899] py-3 text-base font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
        size="lg"
      >
        {status === 'loading' ? 'Sending...' : 'Get Started'}
      </Button>
    </form>
  )
}

/* ═══════════════════════════  MAIN PAGE  ═══════════════════════════ */
export default function HomePage() {
  const isLoggedIn = useIsLoggedIn()
  return (
    <div className="min-h-screen bg-white">
      <style>{GLOBAL_STYLES}</style>

      {/* ───── Header / Nav ───── */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            Win &amp; Win
          </span>
          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-500 md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-gray-900">How It Works</a>
            <a href="#games" className="transition-colors hover:text-gray-900">Games</a>
            <a href="#features" className="transition-colors hover:text-gray-900">Features</a>
            <a href="#plans" className="transition-colors hover:text-gray-900">Plans</a>
            <a href="#contact" className="transition-colors hover:text-gray-900">Contact</a>
          </nav>
          <div className="flex gap-3">
            {isLoggedIn ? (
              <a href="/dashboard">
                <Button className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl">
                  My Dashboard
                </Button>
              </a>
            ) : (
              <>
                <a href="/sign-in">
                  <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
                </a>
                <a href="#contact">
                  <Button className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl">
                    Contact Us
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════  SECTION 1: HERO  ═══════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #ede9fe 0%, #fce7f3 25%, #fef3c7 50%, #d1fae5 75%, #ede9fe 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 15s ease infinite',
          }}
        />

        {/* Soft blurred orbs (Stripe-style) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              width: '400px', height: '400px',
              top: '10%', left: '5%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'heroOrb 12s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '350px', height: '350px',
              top: '50%', right: '0%',
              background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'heroOrb 15s ease-in-out 2s infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '300px', height: '300px',
              bottom: '10%', left: '30%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
              filter: 'blur(50px)',
              animation: 'heroOrb 10s ease-in-out 4s infinite',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — Copy */}
            <div className="text-center lg:text-left animate-slideUp">
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #ec4899 100%)' }}
                >
                  Your Customers Play.
                </span>
                <br />
                Your Business Wins.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-600 sm:text-xl lg:mx-0 mx-auto">
                Deploy QR code games at your business. Collect reviews, grow followers, drive return visits — all while your customers have fun.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start justify-center">
                <a href="#plans">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] px-8 text-base font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:scale-105"
                  >
                    See Plans
                  </Button>
                </a>
                <a href="#contact">
                  <Button size="lg" variant="outline" className="px-8 text-base font-semibold transition-all hover:scale-105">
                    Contact Us
                  </Button>
                </a>
              </div>
            </div>

            {/* Right — Phone mockup */}
            <div className="hidden md:flex justify-center animate-slideUp-d2">
              <div className="relative">
                {/* Phone frame */}
                <div
                  className="relative h-[560px] w-[280px] overflow-hidden rounded-[3rem] border-[6px] border-gray-900 bg-gradient-to-b from-indigo-600 to-purple-700 shadow-2xl"
                >
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-28 rounded-b-2xl bg-gray-900 z-10" />

                  {/* Screen content */}
                  <div className="flex flex-col items-center justify-center h-full px-6 pt-8">
                    <p className="text-white/90 font-bold text-lg mb-2">Spin to Win!</p>
                    <div
                      className="w-44 h-44"
                      style={{ animation: 'phoneWheel 8s linear infinite' }}
                    >
                      <PhoneWheelSVG />
                    </div>
                    <div className="mt-4 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-amber-400" style={{ marginTop: '-8px' }} />
                    <p className="mt-4 text-white/80 text-sm text-center">Tap the wheel to win a prize!</p>
                    <div className="mt-4 rounded-full bg-white/20 px-6 py-2 text-white font-semibold text-sm">
                      🎉 You won 10% off!
                    </div>
                  </div>
                </div>

                {/* Glow behind phone */}
                <div className="absolute -inset-8 rounded-full bg-indigo-400/20 blur-3xl -z-10" />
              </div>
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-16 text-center animate-slideUp-d3">
            <p className="text-sm font-medium text-gray-500 mb-4">Trusted by 500+ businesses across France</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-3xl opacity-40">
              <span title="Restaurant">🍽️</span>
              <span title="Cafe">☕</span>
              <span title="Bar">🍸</span>
              <span title="Retail">🛍️</span>
              <span title="Salon">💇</span>
              <span title="Gym">🏋️</span>
              <span title="Hotel">🏨</span>
              <span title="Bakery">🥐</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════  SECTION 2: HOW IT WORKS  ═══════════════════════ */}
      <section id="how-it-works" className="py-24 bg-gray-50/80">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">How It Works</h2>
            <p className="mt-3 text-lg text-gray-500">Three simple steps to gamify your business</p>
          </div>

          {/* Timeline connector */}
          <div className="relative">
            {/* Horizontal line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-1 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" />

            <div className="grid gap-10 md:grid-cols-3">
              {[
                { emoji: '🎮', title: 'Create Your Game', desc: 'Choose Wheel of Fortune, Slots, or Mystery Box. Set your prizes and branding in minutes.', color: 'bg-indigo-100 text-indigo-600', delay: 'animate-slideUp-d1' },
                { emoji: '📱', title: 'Share Your QR Code', desc: 'Print it on table tents, menus, or receipts. Customers scan with any phone.', color: 'bg-purple-100 text-purple-600', delay: 'animate-slideUp-d2' },
                { emoji: '🎉', title: 'Customers Play & Win', desc: 'They complete an action (Google review, Instagram follow), play your game, and win prizes.', color: 'bg-pink-100 text-pink-600', delay: 'animate-slideUp-d3' },
              ].map((step, i) => (
                <div key={i} className={`relative flex flex-col items-center text-center ${step.delay}`}>
                  {/* Circle with emoji */}
                  <div
                    className={`relative z-10 flex h-32 w-32 items-center justify-center rounded-full text-5xl ${step.color} shadow-lg`}
                    style={{ animation: `float 4s ease-in-out ${i * 0.5}s infinite` }}
                  >
                    {step.emoji}
                  </div>
                  {/* Step number */}
                  <div className="mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-gray-500 leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════  SECTION 3: GAME SHOWCASE  ═══════════════════════ */}
      <section id="games" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Three Games. Endless Fun.</h2>
            <p className="mt-3 text-lg text-gray-500">Each one designed to delight your customers</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Wheel of Fortune */}
            <div className="game-card rounded-2xl overflow-hidden shadow-lg animate-slideUp-d1">
              <div className="h-52 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <div className="wheel-spin w-32 h-32">
                  <PhoneWheelSVG />
                </div>
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold flex items-center gap-2">🎡 Wheel of Fortune</h3>
                <p className="mt-2 text-gray-500">The classic spin-to-win. Customers love the anticipation!</p>
              </div>
            </div>

            {/* Slot Machine */}
            <div className="game-card rounded-2xl overflow-hidden shadow-lg animate-slideUp-d2">
              <div className="h-52 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                <div className="flex gap-3">
                  {['🍒', '⭐', '🎁'].map((emoji, j) => (
                    <div key={j} className="w-16 h-20 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                      <div className="slot-scroll text-3xl" style={{ animationDelay: `${j * 0.1}s` }}>
                        {emoji}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold flex items-center gap-2">🎰 Slot Machine</h3>
                <p className="mt-2 text-gray-500">Match symbols to win. Pure casino-style excitement!</p>
              </div>
            </div>

            {/* Mystery Box */}
            <div className="game-card rounded-2xl overflow-hidden shadow-lg animate-slideUp-d3">
              <div className="h-52 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
                <div className="flex gap-4">
                  {['🎁', '📦', '🎁'].map((emoji, j) => (
                    <div
                      key={j}
                      className={`text-4xl ${j === 1 ? 'box-bounce' : ''}`}
                      style={j === 1 ? { animationDelay: '0s' } : {}}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold flex items-center gap-2">📦 Mystery Box</h3>
                <p className="mt-2 text-gray-500">Tap to reveal. Simple, fun, and addictive!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════  SECTION 4: FEATURES  ═══════════════════════ */}
      <section id="features" className="py-24 bg-gray-50/80">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Everything You Need to Engage Customers</h2>
            <p className="mt-3 text-lg text-gray-500">Powerful features, simple to use</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: '⭐', title: 'Google Reviews', desc: 'Customers leave reviews before playing. Watch your rating climb.', bg: 'bg-amber-50', ring: 'bg-amber-100' },
              { emoji: '📱', title: 'Social Growth', desc: 'Require Instagram follows or shares. Turn players into followers.', bg: 'bg-blue-50', ring: 'bg-blue-100' },
              { emoji: '🎟️', title: 'Smart Coupons', desc: 'Time-limited prizes that drive return visits. Sent by email.', bg: 'bg-purple-50', ring: 'bg-purple-100' },
              { emoji: '📊', title: 'Live Analytics', desc: 'Track plays, wins, and redemptions in real-time.', bg: 'bg-emerald-50', ring: 'bg-emerald-100' },
              { emoji: '🛡️', title: 'Fraud Protection', desc: 'Device fingerprinting prevents cheating. One play per customer.', bg: 'bg-red-50', ring: 'bg-red-100' },
              { emoji: '🎨', title: 'Your Brand', desc: 'Customize colors, logo, and theme to match your business.', bg: 'bg-pink-50', ring: 'bg-pink-100' },
            ].map((feature, i) => (
              <div
                key={i}
                className={`rounded-2xl border border-gray-100 ${feature.bg} p-6 transition-all hover:shadow-md hover:-translate-y-1`}
                style={{ animation: `slideUp 0.7s ease-out ${0.1 * i}s both` }}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${feature.ring} text-2xl`}>
                  {feature.emoji}
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════  SECTION 5: PLANS  ═══════════════════════ */}
      <section id="plans" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Choose Your Plan</h2>
            <p className="mt-3 text-lg text-gray-500">Simple pricing, powerful results</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Starter */}
            <div className="plan-card rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-lg font-bold text-gray-900">Starter</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900">49€</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                {['1 game', '1 QR code', 'Up to 500 plays/mo', 'Basic analytics', 'Email support'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> {f}</li>
                ))}
              </ul>
              <a href="#contact" className="block mt-8">
                <Button variant="outline" className="w-full font-semibold">Contact Us</Button>
              </a>
            </div>

            {/* Pro — highlighted */}
            <div className="plan-card relative rounded-2xl bg-white p-8 shadow-xl ring-2 ring-indigo-500">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-1 text-xs font-bold text-white">
                Most Popular
              </div>
              <h3 className="text-lg font-bold text-gray-900">Pro</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900">149€</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                {['3 games', '3 QR codes', 'Unlimited plays', 'Advanced analytics', 'Priority support', 'Custom branding', 'Smart coupons'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> {f}</li>
                ))}
              </ul>
              <a href="#contact" className="block mt-8">
                <Button className="w-full bg-gradient-to-r from-[#6366f1] to-[#ec4899] font-semibold shadow-lg shadow-indigo-500/25">
                  Contact Us
                </Button>
              </a>
            </div>

            {/* Enterprise */}
            <div className="plan-card rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-lg font-bold text-gray-900">Enterprise</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900">Custom</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                {['Unlimited games', 'Unlimited QR codes', 'Unlimited plays', 'White-label solution', 'Dedicated account manager', 'API access', 'Custom integrations'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> {f}</li>
                ))}
              </ul>
              <a href="#contact" className="block mt-8">
                <Button variant="outline" className="w-full font-semibold">Contact Us</Button>
              </a>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">All plans include a 14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* ═══════════════════════  SECTION 6: CONTACT  ═══════════════════════ */}
      <section id="contact" className="py-24 bg-gray-50/80">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to Get Started?</h2>
            <p className="mt-3 text-lg text-gray-500">Fill out the form and we'll set you up within 24 hours.</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══════════════════════  SECTION 7: FOOTER  ═══════════════════════ */}
      <footer className="border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
              Win &amp; Win
            </span>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>
            <p className="text-sm text-gray-400">Made with ❤️ in France</p>
            <p className="text-xs text-gray-300">© 2026 Win & Win. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
