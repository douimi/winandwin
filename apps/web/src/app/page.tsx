'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Button, Card, CardContent, Input, Label } from '@winandwin/ui'

function useIsLoggedIn() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null) // null = loading
  useEffect(() => {
    fetch('/api/auth/check')
      .then((r) => r.json())
      .then((data: { authenticated: boolean }) => setLoggedIn(data.authenticated))
      .catch(() => setLoggedIn(false))
  }, [])
  return loggedIn
}

/* CSS animations are now in globals.css to avoid re-renders */

/* ─────────────────────────  Animated Counter  ───────────────────────── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        let start = 0
        const duration = 2000
        const step = (timestamp: number) => {
          if (!start) start = timestamp
          const progress = Math.min((timestamp - start) / duration, 1)
          setCount(Math.floor(progress * target))
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        observer.disconnect()
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ─────────────────────────  Scroll Reveal Hook  ───────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, className: visible ? 'transition-all duration-700 ease-out opacity-100 translate-y-0' : 'opacity-0 translate-y-8 transition-all duration-700 ease-out' }
}

/* ─────────────────────────  Floating Particles  ───────────────────────── */
const PARTICLE_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#22c55e']
const PARTICLES = Array.from({ length: 15 }).map((_, i) => ({
  width: 3 + ((i * 7 + 3) % 4),
  height: 3 + ((i * 7 + 3) % 4),
  background: PARTICLE_COLORS[i % 5]!,
  top: `${((i * 37 + 11) % 100)}%`,
  left: `${((i * 53 + 7) % 100)}%`,
  duration: 5 + ((i * 3) % 5),
  delay: ((i * 2) % 5),
}))


/* ─────────────────────────  SVG Wheel for phone mockup  ───────────────────────── */
function PhoneWheelSVG() {
  const segments = [
    { color: '#f59e0b', emoji: '\u{1F381}' },
    { color: '#6366f1', emoji: '\u{2B50}' },
    { color: '#10b981', emoji: '\u{1F389}' },
    { color: '#ec4899', emoji: '\u{1F3C6}' },
    { color: '#f97316', emoji: '\u{1F381}' },
    { color: '#8b5cf6', emoji: '\u{2B50}' },
    { color: '#14b8a6', emoji: '\u{1F389}' },
    { color: '#ef4444', emoji: '\u{1F3C6}' },
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

/* ─────────────────────────  Interactive Game Demo  ───────────────────────── */
function GameDemo() {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<string | null>(null)

  const prizes = ['Free Coffee \u2615', '10% Off \u{1F389}', 'Free Dessert \u{1F370}', 'Try Again \u{1F340}', 'VIP Treatment \u2B50', 'Try Again \u{1F340}']
  const colors = ['#6366f1', '#f59e0b', '#10b981', '#94a3b8', '#ec4899', '#94a3b8']

  function spin() {
    if (spinning) return
    setSpinning(true)
    setResult(null)
    const winIndex = Math.floor(Math.random() * prizes.length)
    const segAngle = 360 / prizes.length
    const target = 360 * 5 + (360 - (winIndex * segAngle + segAngle / 2))
    setRotation(prev => prev + target)
    setTimeout(() => {
      setSpinning(false)
      setResult(prizes[winIndex]!)
    }, 3500)
  }

  const n = prizes.length
  const r = 110
  const cx = 125
  const cy = 125

  return (
    <div className="flex flex-col items-center">
      {/* Phone frame mockup */}
      <div className="relative">
        <div className="relative h-[480px] w-[250px] overflow-hidden rounded-[2.5rem] border-[5px] border-gray-900 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl"
          style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 rounded-b-xl bg-gray-900 z-10" />

          {/* Screen content */}
          <div className="flex flex-col items-center justify-center h-full px-4 pt-6 bg-gradient-to-b from-indigo-600 to-purple-700">
            {/* Brand & Logo inside phone */}
            <div className="text-center mb-2">
              <div className="mx-auto w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white/80 border border-white/30">
                Logo
              </div>
              <p className="text-white/70 text-xs mt-1 font-medium">Your Brand</p>
            </div>
            <p className="text-white/90 font-bold text-sm mb-3">Spin to Win!</p>

            {/* SVG Wheel */}
            <div className="w-[210px] h-[210px]" style={{ position: 'relative' }}>
              {/* Pointer arrow at top */}
              <svg style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }} width="30" height="24" viewBox="0 0 30 24">
                <polygon points="15,24 0,0 30,0" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
              </svg>
              <svg viewBox="0 0 250 250" className="w-full h-full">
                <g
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: `${cx}px ${cy}px`,
                    transition: spinning ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                  }}
                >
                  {prizes.map((prize, i) => {
                    const startAngle = (i * 360) / n
                    const endAngle = ((i + 1) * 360) / n
                    const startRad = (startAngle * Math.PI) / 180
                    const endRad = (endAngle * Math.PI) / 180
                    const rd = (n: number) => Math.round(n * 100) / 100
                    const x1 = rd(cx + r * Math.cos(startRad))
                    const y1 = rd(cy + r * Math.sin(startRad))
                    const x2 = rd(cx + r * Math.cos(endRad))
                    const y2 = rd(cy + r * Math.sin(endRad))
                    const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180)
                    const tx = rd(cx + r * 0.55 * Math.cos(midAngle))
                    const ty = rd(cy + r * 0.55 * Math.sin(midAngle))
                    const labelRotation = rd((startAngle + endAngle) / 2)

                    return (
                      <g key={i}>
                        <path
                          d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
                          fill={colors[i]}
                          stroke="white"
                          strokeWidth="2"
                        />
                        <text
                          x={tx}
                          y={ty}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="8"
                          fontWeight="bold"
                          fill="white"
                          transform={`rotate(${labelRotation}, ${tx}, ${ty})`}
                        >
                          {prize.split(' ').slice(0, -1).join(' ')}
                        </text>
                      </g>
                    )
                  })}
                </g>
                <circle cx={cx} cy={cy} r="18" fill="white" stroke="#6366f1" strokeWidth="3" />
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="bold" fill="#6366f1">
                  SPIN
                </text>
              </svg>
            </div>

            {/* Result / Button */}
            {result ? (
              <div className="mt-3 flex flex-col items-center gap-2 animate-slideUp">
                <div className="rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 text-white font-semibold text-sm text-center">
                  {result.includes('Try Again') ? `Try Again! \u{1F340}` : `You won ${result}!`}
                </div>
                <button
                  onClick={() => { setResult(null) }}
                  className="text-white/80 text-xs underline hover:text-white transition-colors"
                >
                  Spin Again
                </button>
              </div>
            ) : (
              <button
                onClick={spin}
                disabled={spinning}
                className="mt-3 rounded-full bg-amber-400 hover:bg-amber-300 px-8 py-2.5 text-sm font-bold text-gray-900 shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {spinning ? 'Spinning...' : 'SPIN!'}
              </button>
            )}
          </div>
        </div>

        {/* Glow behind phone */}
        <div className="absolute -inset-8 rounded-full bg-indigo-400/20 blur-3xl -z-10" />
      </div>
    </div>
  )
}

/* ─────────────────────────  Scratch Card Demo  ───────────────────────── */
function ScratchCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [revealed, setRevealed] = useState(false)
  const [scratching, setScratching] = useState(false)
  const scratchedRef = useRef(0)
  const totalRef = useRef(0)

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    totalRef.current = w * h
    scratchedRef.current = 0
    setRevealed(false)

    // Golden gradient overlay
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, '#f59e0b')
    grad.addColorStop(0.5, '#fbbf24')
    grad.addColorStop(1, '#d97706')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Decorative text — bold and clearly visible
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('✨ SCRATCH HERE ✨', w / 2, h / 2 - 8)
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = 'bold 13px sans-serif'
    ctx.fillText('Use your finger or mouse', w / 2, h / 2 + 16)

    // Sparkle dots
    for (let i = 0; i < 30; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2 + 1, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3 + 0.1})`
      ctx.fill()
    }
  }, [])

  useEffect(() => {
    initCanvas()
  }, [initCanvas])

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'

    // Check percentage scratched
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let cleared = 0
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) cleared++
    }
    const pct = cleared / (canvas.width * canvas.height)
    if (pct > 0.5 && !revealed) {
      setRevealed(true)
    }
  }

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const touch = e.touches[0]
      if (!touch) return null
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setScratching(true)
    const pos = getPos(e)
    if (pos) scratch(pos.x, pos.y)
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!scratching) return
    e.preventDefault()
    const pos = getPos(e)
    if (pos) scratch(pos.x, pos.y)
  }

  const handleEnd = () => setScratching(false)

  const reset = () => {
    initCanvas()
  }

  return (
    <div className="flex flex-col items-center">
      {/* Phone frame mockup */}
      <div className="relative">
        <div
          className="relative h-[480px] w-[250px] overflow-hidden rounded-[2.5rem] border-[5px] border-gray-800 bg-gradient-to-b from-[#1a1040] to-[#0d1117] shadow-2xl"
          style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 rounded-b-xl bg-gray-800 z-10" />

          {/* Screen content */}
          <div className="flex flex-col items-center justify-center h-full px-4 pt-6">
            {/* Brand & Logo inside phone */}
            <div className="text-center mb-2">
              <div className="mx-auto w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-300 border border-amber-500/30">
                Logo
              </div>
              <p className="text-gray-400 text-xs mt-1 font-medium">Your Brand</p>
            </div>
            <p className="text-white/90 font-bold text-sm mb-3">Scratch to Win!</p>

            {/* Scratch card area */}
            <div className="relative w-[200px] h-[140px] rounded-xl overflow-hidden shadow-lg">
              {/* Prize underneath */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800">
                <span className="text-3xl mb-1">{'\u2615'}</span>
                <span className="text-white font-bold text-sm">You won a</span>
                <span className="text-amber-300 font-extrabold text-lg">Free Coffee!</span>
              </div>
              {/* Scratch canvas overlay */}
              <canvas
                ref={canvasRef}
                width={200}
                height={140}
                className="absolute inset-0 cursor-pointer touch-none"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
            </div>

            {/* Result / Reset */}
            {revealed ? (
              <div className="mt-3 flex flex-col items-center gap-2 animate-slideUp">
                <div className="rounded-xl bg-emerald-500/20 backdrop-blur-sm px-4 py-2 text-emerald-300 font-semibold text-sm text-center border border-emerald-500/30">
                  Congratulations!
                </div>
                <button
                  onClick={reset}
                  className="text-gray-400 text-xs underline hover:text-white transition-colors"
                >
                  Reset & Try Again
                </button>
              </div>
            ) : (
              <p className="mt-3 text-gray-400 text-xs text-center">
                Scratch the golden card above!
              </p>
            )}
          </div>
        </div>

        {/* Glow behind phone */}
        <div className="absolute -inset-8 rounded-full bg-amber-500/15 blur-3xl -z-10" />
      </div>
    </div>
  )
}

/* ═══════════════════════════  TRANSLATIONS  ═══════════════════════════ */
const LANDING_TEXT = {
  en: {
    heroTitle1: 'Your Customers Play.',
    heroTitle2: 'Your Business Wins.',
    heroSubtitle: 'Boost engagement and drive growth with fun',
    heroHighlight1: 'QR code games',
    heroMid: 'at your business. Collect reviews, grow followers, and drive',
    heroHighlight2: 'return visits',
    seePlans: 'See Plans',
    contactUs: 'Contact Us',
    tryNow: 'Try it now — scratch to see what your customers experience',
    // Nav (short labels)
    navHow: 'How It Works',
    navGames: 'Games',
    navFeatures: 'Why Us',
    navPlans: 'Pricing',
    navContact: 'Get Started',
    // Section headings
    howItWorks: '3 Steps. That\'s It.',
    howItWorksSubtitle: 'From setup to first play in under 10 minutes.',
    step1: 'Create Your Game',
    step1Desc: 'Choose Wheel of Fortune, Slots, or Mystery Box. Set your prizes and branding in minutes.',
    step2: 'Share Your QR Code',
    step2Desc: 'Print it on table tents, menus, or receipts. Customers scan with any phone.',
    step3: 'Customers Play & Win',
    step3Desc: 'They complete an action (Google review, Instagram follow), play your game, and win prizes.',
    games: 'Pick Your Game',
    features: 'Why Businesses Love Us',
    plans: 'Simple Pricing. Big Results.',
    trialNote: '14-day free trial included. No credit card required.',
    getStarted: 'Let\'s Build Something Fun',
    getStartedSub: 'Tell us about your business. We\'ll have you live in 24 hours.',
    businessName: 'Business Name',
    yourName: 'Your Name',
    email: 'Email',
    phone: 'Phone',
    businessType: 'Business Type',
    message: 'Message',
    sendBtn: 'Get Started',
    sending: 'Sending...',
    thankYou: 'Thanks! We\'ll reach out within 24 hours.',
    basedIn: 'Based in Casablanca, Morocco',
    madeWith: 'Made with',
    inMorocco: 'in Morocco',
    signIn: 'Sign In',
    myDashboard: 'My Dashboard',
    trusted: 'Trusted by 500+ businesses across Morocco',
    faq: 'FAQ',
    faq1q: 'Is there a free trial?',
    faq1a: 'Yes, all plans include a 14-day free trial. No credit card required.',
    faq2q: 'Can I change plans?',
    faq2a: 'Yes, you can upgrade or downgrade at any time by contacting us.',
    faq3q: 'How long does setup take?',
    faq3a: 'Most businesses are live within 10 minutes.',
    perMonth: '/mo',
    custom: 'Custom',
    businesses: 'Businesses',
    gamesPlayed: 'Games Played',
    satisfaction: 'Satisfaction',
    howItWorksSubtitle2: 'Three simple steps to gamify your business',
    gamesSubtitle: 'Spin, scratch, or tap — your customers choose the thrill.',
    featuresSubtitle: 'More reviews. More followers. More return visits.',
    plansSubtitle: 'Start free. Scale when you\'re ready.',
    faqHeading: 'Got Questions?',
    terms: 'Terms',
    privacy: 'Privacy',
    contact: 'Contact',
    copyright: '\u00A9 2026 Win & Win. All rights reserved.',
    selectBusinessType: 'Select your business type',
    phoneSuffix: '(optional)',
    messageSuffix: '(optional)',
    messagePlaceholder: 'Tell us about your business and goals...',
    confirmEmail: 'Check your inbox for a confirmation email.',
    errorMsg: 'Something went wrong. Please try again.',
  },
  fr: {
    heroTitle1: 'Vos Clients Jouent.',
    heroTitle2: 'Votre Business Gagne.',
    heroSubtitle: 'Boostez l\'engagement et la croissance avec des',
    heroHighlight1: 'jeux QR code',
    heroMid: 'dans votre \u00E9tablissement. Collectez des avis, gagnez des abonn\u00E9s et g\u00E9n\u00E9rez des',
    heroHighlight2: 'visites r\u00E9currentes',
    seePlans: 'Voir les Plans',
    contactUs: 'Contactez-nous',
    tryNow: 'Essayez \u2014 grattez pour voir ce que vos clients vivent',
    navHow: 'Comment',
    navGames: 'Jeux',
    navFeatures: 'Fonctions',
    navPlans: 'Plans',
    navContact: 'Contact',
    howItWorks: 'Comment \u00C7a Marche',
    howItWorksSubtitle: 'Engagez vos clients, collectez des retours pr\u00E9cieux et d\u00E9veloppez votre activit\u00E9 en trois \u00E9tapes simples :',
    step1: 'Cr\u00E9ez Votre Jeu',
    step1Desc: 'Choisissez la Roue de la Fortune, les Machines \u00E0 Sous ou la Bo\u00EEte Myst\u00E8re. Configurez vos prix et votre branding en quelques minutes.',
    step2: 'Partagez Votre QR Code',
    step2Desc: 'Imprimez-le sur des chevalets de table, menus ou re\u00E7us. Les clients scannent avec n\'importe quel t\u00E9l\u00E9phone.',
    step3: 'Les Clients Jouent & Gagnent',
    step3Desc: 'Ils compl\u00E8tent une action (avis Google, suivi Instagram), jouent et gagnent des prix.',
    games: 'Trois Jeux. Un Plaisir Infini.',
    features: 'Tout Ce Dont Vous Avez Besoin Pour Engager Vos Clients',
    plans: 'Choisissez Votre Plan',
    trialNote: 'Essai gratuit de 14 jours inclus. Aucune carte de cr\u00E9dit requise.',
    getStarted: 'Pr\u00EAt \u00E0 Commencer ?',
    getStartedSub: 'Remplissez le formulaire et nous vous configurerons sous 24 heures.',
    businessName: 'Nom de l\'entreprise',
    yourName: 'Votre Nom',
    email: 'Email',
    phone: 'T\u00E9l\u00E9phone',
    businessType: 'Type d\'activit\u00E9',
    message: 'Message',
    sendBtn: 'Commencer',
    sending: 'Envoi...',
    thankYou: 'Merci ! Nous vous contacterons sous 24 heures.',
    basedIn: 'Bas\u00E9 \u00E0 Casablanca, Maroc',
    madeWith: 'Fait avec',
    inMorocco: 'au Maroc',
    signIn: 'Connexion',
    myDashboard: 'Mon Tableau de Bord',
    trusted: 'Approuv\u00E9 par plus de 500 entreprises au Maroc',
    faq: 'FAQ',
    faq1q: 'Y a-t-il un essai gratuit ?',
    faq1a: 'Oui, tous les plans incluent un essai gratuit de 14 jours. Aucune carte de cr\u00E9dit requise.',
    faq2q: 'Puis-je changer de plan ?',
    faq2a: 'Oui, vous pouvez passer \u00E0 un plan sup\u00E9rieur ou inf\u00E9rieur \u00E0 tout moment en nous contactant.',
    faq3q: 'Combien de temps prend la configuration ?',
    faq3a: 'La plupart des entreprises sont en ligne en moins de 10 minutes.',
    perMonth: '/mois',
    custom: 'Sur mesure',
    businesses: 'Entreprises',
    gamesPlayed: 'Parties Jou\u00E9es',
    satisfaction: 'Satisfaction',
    howItWorksSubtitle2: 'Trois \u00E9tapes simples pour gamifier votre business',
    gamesSubtitle: 'Chacun con\u00E7u pour ravir vos clients',
    featuresSubtitle: 'Des fonctionnalit\u00E9s puissantes, simples \u00E0 utiliser',
    plansSubtitle: 'Tarification simple, r\u00E9sultats puissants',
    faqHeading: 'Questions Fr\u00E9quentes',
    terms: 'Conditions',
    privacy: 'Confidentialit\u00E9',
    contact: 'Contact',
    copyright: '\u00A9 2026 Win & Win. Tous droits r\u00E9serv\u00E9s.',
    selectBusinessType: 'S\u00E9lectionnez votre type d\'activit\u00E9',
    phoneSuffix: '(optionnel)',
    messageSuffix: '(optionnel)',
    messagePlaceholder: 'Parlez-nous de votre activit\u00E9 et de vos objectifs...',
    confirmEmail: 'V\u00E9rifiez votre bo\u00EEte de r\u00E9ception pour un email de confirmation.',
    errorMsg: 'Une erreur est survenue. Veuillez r\u00E9essayer.',
  },
}

/* ─────────────────────────  Contact Form (client component)  ───────────────────────── */
function ContactForm({ lang }: { lang: 'en' | 'fr' }) {
  const txt = LANDING_TEXT[lang]
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
        body: JSON.stringify({
          businessName: form.businessName,
          contactName: form.name,
          email: form.email,
          phone: form.phone,
          businessType: form.businessType,
          message: form.message,
        }),
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
          className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-4xl"
          style={{ animation: 'bounceIn 0.6s ease-out both' }}
        >
          ✓
        </div>
        <h3 className="mt-6 text-2xl font-bold text-white">{txt.thankYou}</h3>
        <p className="mt-2 text-gray-400">{txt.confirmEmail}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="businessName">{txt.businessName} *</Label>
          <Input id="businessName" name="businessName" required value={form.businessName} onChange={handleChange} placeholder="e.g. Café Atlas" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">{txt.yourName} *</Label>
          <Input id="name" name="name" required value={form.name} onChange={handleChange} placeholder="Amine El Idrissi" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">{txt.email} *</Label>
          <Input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="amine@cafe.ma" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">{txt.phone} {txt.phoneSuffix}</Label>
          <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+212 6XX XXX XXX" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="businessType">{txt.businessType} *</Label>
        <select
          id="businessType"
          name="businessType"
          required
          value={form.businessType}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">{txt.selectBusinessType}</option>
          <option value="restaurant">Restaurant</option>
          <option value="cafe">Cafe</option>
          <option value="bar">Bar</option>
          <option value="retail">Retail</option>
          <option value="salon">Salon</option>
          <option value="gym">Gym</option>
          <option value="hotel">Hotel</option>
          <option value="riad">Riad</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">{txt.message} {txt.messageSuffix}</Label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={3}
          placeholder={txt.messagePlaceholder}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-600">{txt.errorMsg}</p>
      )}
      <Button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3 text-base font-bold shadow-lg transition-all hover:shadow-xl hover:shadow-[#94ffe5]/30"
        style={{ background: '#94ffe5', color: '#0a0a1a' }}
        size="lg"
      >
        {status === 'loading' ? txt.sending : txt.sendBtn}
      </Button>
    </form>
  )
}

/* ═══════════════════════════  MAIN PAGE  ═══════════════════════════ */
export default function HomePage() {
  const isLoggedIn = useIsLoggedIn()
  const lang = 'en' as const
  const txt = LANDING_TEXT[lang]
  const howItWorksReveal = useScrollReveal()
  const gamesReveal = useScrollReveal()
  const featuresReveal = useScrollReveal()
  const plansReveal = useScrollReveal()
  const contactReveal = useScrollReveal()
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-gray-100">
      {/* ───── Header / Nav ───── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/">
            <img src="/logo.png" alt="Win & Win" className="h-28 w-auto" />
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-400 md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-white">{txt.navHow}</a>
            <a href="#games" className="transition-colors hover:text-white">{txt.navGames}</a>
            <a href="#features" className="transition-colors hover:text-white">{txt.navFeatures}</a>
            <a href="#plans" className="transition-colors hover:text-white">{txt.navPlans}</a>
            <a href="#contact" className="transition-colors hover:text-white">{txt.navContact}</a>
          </nav>
          <div className="flex gap-3" style={{ minWidth: 140 }}>
            {isLoggedIn === null ? (
              /* Loading — show a subtle placeholder to prevent layout shift */
              <div className="h-10 w-32 animate-pulse rounded-lg bg-white/10" />
            ) : isLoggedIn ? (
              <Link href="/dashboard" prefetch={true}>
                <Button className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl active:scale-95 transition-transform">
                  {txt.myDashboard}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in" prefetch={true}>
                  <Button variant="ghost" className="text-gray-300 hover:text-white active:scale-95 transition-transform">{txt.signIn}</Button>
                </Link>
                <a href="#contact">
                  <Button className="font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                    {txt.contactUs}
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
            background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 25%, #1e0a2e 50%, #0d1117 75%, #0f0c29 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 15s ease infinite',
          }}
        />

        {/* Soft blurred orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              width: '400px', height: '400px',
              top: '10%', left: '5%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'heroOrb 12s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '350px', height: '350px',
              top: '50%', right: '0%',
              background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'heroOrb 15s ease-in-out 2s infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '300px', height: '300px',
              bottom: '10%', left: '30%',
              background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
              filter: 'blur(50px)',
              animation: 'heroOrb 10s ease-in-out 4s infinite',
            }}
          />
        </div>

        {/* Floating particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {PARTICLES.map((p, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: `${p.width}px`,
              height: `${p.height}px`,
              borderRadius: '50%',
              background: p.background,
              top: p.top,
              left: p.left,
              opacity: 0.3,
              animation: `subtleFloat ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }} />
          ))}
        </div>

        {/* Decorative stickers */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div style={{ position: 'absolute', top: '15%', right: '8%', width: 60, height: 60, borderRadius: '50%', border: '3px solid #94ffe5', opacity: 0.3, animation: 'sticker-float 6s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 40, height: 40, background: '#a855f7', borderRadius: 8, transform: 'rotate(45deg)', opacity: 0.15, animation: 'sticker-float 8s ease-in-out infinite 1s' }} />
          <div style={{ position: 'absolute', top: '60%', right: '15%', width: 30, height: 30, background: '#f59e0b', borderRadius: '50%', opacity: 0.2, animation: 'sticker-float 7s ease-in-out infinite 0.5s' }} />
          <div style={{ position: 'absolute', top: '40%', left: '12%', width: 50, height: 50, border: '3px solid #ec4899', borderRadius: 12, transform: 'rotate(15deg)', opacity: 0.2, animation: 'sticker-float 9s ease-in-out infinite 2s' }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-20 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — Copy */}
            <div className="text-center lg:text-left animate-slideUp">
              <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1.05, fontWeight: 900, letterSpacing: '-0.03em' }}>
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #94ffe5 50%, #ec4899 100%)' }}
                >
                  {txt.heroTitle1}
                </span>
                <br />
                <span className="text-white">{txt.heroTitle2}</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-400 sm:text-xl lg:mx-0 mx-auto">
                {txt.heroSubtitle} <span style={{ color: '#94ffe5', fontWeight: 600 }}>{txt.heroHighlight1}</span> {txt.heroMid} <span style={{ color: '#94ffe5', fontWeight: 600 }}>{txt.heroHighlight2}</span>.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start justify-center">
                <a href="#plans">
                  <Button
                    size="lg"
                    className="px-8 text-base font-bold shadow-lg transition-all hover:shadow-xl hover:shadow-[#94ffe5]/30 hover:scale-105"
                    style={{ background: '#94ffe5', color: '#0a0a1a' }}
                  >
                    {txt.seePlans}
                  </Button>
                </a>
                <a href="#contact">
                  <Button size="lg" className="px-8 text-base font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                    {txt.contactUs}
                  </Button>
                </a>
              </div>

              {/* Stats row */}
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md lg:mx-0 mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-transparent">
                    <AnimatedCounter target={500} suffix="+" />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{txt.businesses}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-transparent">
                    <AnimatedCounter target={2} suffix="M+" />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{txt.gamesPlayed}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-transparent">
                    <AnimatedCounter target={4} suffix=".8/5" />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{txt.satisfaction}</div>
                </div>
              </div>
            </div>

            {/* Right — Phone mockup with Scratch Card */}
            <div className="hidden md:flex flex-col items-center gap-4 animate-slideUp-d2">
              <ScratchCard />
              <p className="text-sm text-gray-400 text-center max-w-[280px]">
                {txt.tryNow}
              </p>
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-16 text-center animate-slideUp-d3">
            <p className="text-sm font-medium text-gray-400 mb-4">{txt.trusted}</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-3xl opacity-40">
              <span title="Restaurant">{'\u{1F37D}\u{FE0F}'}</span>
              <span title="Cafe">{'\u2615'}</span>
              <span title="Bar">{'\u{1F378}'}</span>
              <span title="Retail">{'\u{1F6CD}\u{FE0F}'}</span>
              <span title="Salon">{'\u{1F487}'}</span>
              <span title="Gym">{'\u{1F3CB}\u{FE0F}'}</span>
              <span title="Hotel">{'\u{1F3E8}'}</span>
              <span title="Bakery">{'\u{1F950}'}</span>
            </div>
            {/* Trust logos */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {['Riad Jardin', 'Café Hafa', 'Restaurant Al Fassia', 'Salon Beauté', 'Pâtisserie Amoud', 'Gym Atlas'].map((name, i) => (
                <span
                  key={i}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-400 shadow-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════════════════════  SECTION 2: HOW IT WORKS  ═══════════════════════ */}
      <section id="how-it-works" className="py-32 bg-white/[0.02]">
        <div ref={howItWorksReveal.ref} className={`mx-auto max-w-5xl px-6 ${howItWorksReveal.className}`}>
          <div className="text-center mb-16">
            <h2 className="text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em' }}>{txt.howItWorks}</h2>
            <p className="mt-3 text-lg text-gray-400">{txt.howItWorksSubtitle2}</p>
          </div>

          {/* Timeline connector */}
          <div className="relative">
            {/* Horizontal line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-1 rounded-full bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-pink-500/50" />

            <div className="grid gap-10 md:grid-cols-3">
              {[
                { emoji: '\u{1F3AE}', title: txt.step1, desc: txt.step1Desc, color: 'bg-indigo-500/20 text-indigo-400', iconBg: 'bg-indigo-500', delay: 'animate-slideUp-d1' },
                { emoji: '\u{1F517}', title: txt.step2, desc: txt.step2Desc, color: 'bg-purple-500/20 text-purple-400', iconBg: 'bg-purple-500', delay: 'animate-slideUp-d2' },
                { emoji: '\u{1F389}', title: txt.step3, desc: txt.step3Desc, color: 'bg-pink-500/20 text-pink-400', iconBg: 'bg-pink-500', delay: 'animate-slideUp-d3' },
              ].map((step, i) => (
                <div key={i} className={`relative flex flex-col items-center text-center ${step.delay}`} style={{ transform: i === 1 ? 'translateY(30px)' : 'none' }}>
                  {/* Circle with emoji + colored ring */}
                  <div
                    className={`relative z-10 flex h-32 w-32 items-center justify-center rounded-full ${step.color} shadow-lg ring-4 ring-white/10`}
                    style={{ animation: `float 4s ease-in-out ${i * 0.5}s infinite` }}
                  >
                    <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white/80 text-4xl shadow-inner">
                      {i === 1 ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                          <rect x="2" y="2" width="8" height="8" rx="1" />
                          <rect x="14" y="2" width="8" height="8" rx="1" />
                          <rect x="2" y="14" width="8" height="8" rx="1" />
                          <rect x="14" y="14" width="4" height="4" rx="0.5" />
                          <rect x="20" y="14" width="2" height="2" rx="0.3" />
                          <rect x="14" y="20" width="2" height="2" rx="0.3" />
                          <rect x="18" y="18" width="4" height="4" rx="0.5" />
                          <rect x="5" y="5" width="2" height="2" fill="currentColor" rx="0.3" />
                          <rect x="17" y="5" width="2" height="2" fill="currentColor" rx="0.3" />
                          <rect x="5" y="17" width="2" height="2" fill="currentColor" rx="0.3" />
                        </svg>
                      ) : step.emoji}
                    </div>
                  </div>
                  {/* Step number */}
                  <div className="mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-gray-400 leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════════════════════  SECTION 3: GAME SHOWCASE  ═══════════════════════ */}
      <section id="games" className="py-32">
        <div ref={gamesReveal.ref} className={`mx-auto max-w-6xl px-6 ${gamesReveal.className}`}>
          <div className="text-center mb-16">
            <h2 className="text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em' }}>{txt.games}</h2>
            <p className="mt-3 text-lg text-gray-400">{txt.gamesSubtitle}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Wheel of Fortune */}
            <div className="game-card rounded-2xl overflow-hidden shadow-lg border border-white/10 animate-slideUp-d1 transition-transform duration-300 hover:shadow-2xl" style={{ transformStyle: 'preserve-3d' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateY(5deg) translateY(-4px)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateY(0deg) translateY(0px)' }}>
              <div className="h-64 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <div className="wheel-spin w-36 h-36">
                  <PhoneWheelSVG />
                </div>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm">
                <h3 className="text-2xl font-black flex items-center gap-2">{'\u{1F3A1}'} Wheel of Fortune</h3>
                <p className="mt-2 text-base text-gray-400">The classic spin-to-win. Customers love the anticipation!</p>
              </div>
            </div>

            {/* Slot Machine */}
            <div className="game-card rounded-2xl overflow-hidden shadow-lg border border-white/10 animate-slideUp-d2 transition-transform duration-300 hover:shadow-2xl" style={{ transformStyle: 'preserve-3d' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateY(5deg) translateY(-4px)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateY(0deg) translateY(0px)' }}>
              <div className="h-64 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                <div className="flex gap-3">
                  {['\u{1F352}', '\u2B50', '\u{1F381}'].map((emoji, j) => (
                    <div key={j} className="w-18 h-22 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                      <div className="slot-scroll text-5xl" style={{ animationDelay: `${j * 0.1}s` }}>
                        {emoji}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm">
                <h3 className="text-2xl font-black flex items-center gap-2">{'\u{1F3B0}'} Slot Machine</h3>
                <p className="mt-2 text-base text-gray-400">Match symbols to win. Pure casino-style excitement!</p>
              </div>
            </div>

            {/* Mystery Box */}
            <div className="game-card rounded-2xl overflow-hidden shadow-lg border border-white/10 animate-slideUp-d3 transition-transform duration-300 hover:shadow-2xl" style={{ transformStyle: 'preserve-3d' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateY(5deg) translateY(-4px)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateY(0deg) translateY(0px)' }}>
              <div className="h-64 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
                <div className="flex gap-4">
                  {['\u{1F381}', '\u{1F4E6}', '\u{1F381}'].map((emoji, j) => (
                    <div
                      key={j}
                      className={`text-5xl ${j === 1 ? 'box-bounce' : ''}`}
                      style={j === 1 ? { animationDelay: '0s' } : {}}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm">
                <h3 className="text-2xl font-black flex items-center gap-2">{'\u{1F4E6}'} Mystery Box</h3>
                <p className="mt-2 text-base text-gray-400">Tap to reveal. Simple, fun, and addictive!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════════════════════  SECTION 4: FEATURES  ═══════════════════════ */}
      <section id="features" className="py-32 bg-white/[0.02]">
        <div ref={featuresReveal.ref} className={`mx-auto max-w-6xl px-6 ${featuresReveal.className}`}>
          <div className="text-center mb-16">
            <h2 className="text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em' }}>{txt.features}</h2>
            <p className="mt-3 text-lg text-gray-400">{txt.featuresSubtitle}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: '\u2B50', title: 'Google Reviews', desc: 'Customers leave reviews before playing. Watch your rating climb.', bg: 'bg-amber-500/10 border border-amber-500/20', ring: 'bg-amber-500/20' },
              { emoji: '\u{1F4F1}', title: 'Social Growth', desc: 'Require Instagram follows or shares. Turn players into followers.', bg: 'bg-blue-500/10 border border-blue-500/20', ring: 'bg-blue-500/20' },
              { emoji: '\u{1F39F}\u{FE0F}', title: 'Smart Coupons', desc: 'Time-limited prizes that drive return visits. Sent by email.', bg: 'bg-purple-500/10 border border-purple-500/20', ring: 'bg-purple-500/20' },
              { emoji: '\u{1F4CA}', title: 'Live Analytics', desc: 'Track plays, wins, and redemptions in real-time.', bg: 'bg-emerald-500/10 border border-emerald-500/20', ring: 'bg-emerald-500/20' },
              { emoji: '\u{1F6E1}\u{FE0F}', title: 'Fraud Protection', desc: 'Device fingerprinting prevents cheating. One play per customer.', bg: 'bg-red-500/10 border border-red-500/20', ring: 'bg-red-500/20' },
              { emoji: '\u{1F3A8}', title: 'Your Brand', desc: 'Customize colors, logo, and theme to match your business.', bg: 'bg-pink-500/10 border border-pink-500/20', ring: 'bg-pink-500/20' },
              { emoji: '\u{1F30D}', title: 'Multi-Language', desc: 'Support for French, English, and more. Your game speaks your customers\' language.', bg: 'bg-indigo-500/10 border border-indigo-500/20', ring: 'bg-indigo-500/20' },
            ].map((feature, i) => (
              <div
                key={i}
                className={`rounded-2xl ${feature.bg} p-6 transition-all hover:shadow-md hover:shadow-white/5 hover:-translate-y-1`}
                style={{ animation: `slideUp 0.7s ease-out ${0.1 * i}s both` }}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${feature.ring} text-2xl`}>
                  {feature.emoji}
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════════════════════  SECTION 5: PLANS  ═══════════════════════ */}
      <section id="plans" className="py-32 bg-white/[0.02]">
        <div ref={plansReveal.ref} className={`mx-auto max-w-5xl px-6 ${plansReveal.className}`}>
          <div className="text-center mb-16">
            <h2 className="text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em' }}>{txt.plans}</h2>
            <p className="mt-3 text-lg text-gray-400">{txt.plansSubtitle}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Starter */}
            <div className="plan-card rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8" style={{ borderTop: '4px solid #94ffe5' }}>
              <h3 className="text-lg font-bold text-white">Starter</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">299</span>
                <span className="text-gray-400">MAD{txt.perMonth}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-300">
                {['500 plays/month', '1 active game', '3 prizes per game', '3 CTA types', 'Basic QR code', 'Email coupons', 'Basic analytics'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-emerald-500 font-bold">{'\u2713'}</span> {f}</li>
                ))}
              </ul>
              <a href="#contact" className="block mt-8">
                <Button className="w-full font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>{txt.contactUs}</Button>
              </a>
            </div>

            {/* Pro — highlighted */}
            <div className="plan-card relative rounded-2xl bg-white/10 backdrop-blur-sm p-8 shadow-xl ring-2 ring-indigo-500" style={{ borderTop: '4px solid #f59e0b', animation: 'pulse-glow 2s ease-in-out infinite' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-1 text-xs font-bold text-white animate-pulse">
                RECOMMENDED
              </div>
              <h3 className="text-lg font-bold text-white">Pro</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">599</span>
                <span className="text-gray-400">MAD{txt.perMonth}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-300">
                {['2,000 plays/month', '3 active games', '10 prizes per game', 'All CTA types', 'Branded QR materials', 'Full analytics', 'Marketing automation', 'WhatsApp support'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-emerald-500 font-bold">{'\u2713'}</span> {f}</li>
                ))}
              </ul>
              <a href="#contact" className="block mt-8">
                <Button className="w-full font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                  {txt.contactUs}
                </Button>
              </a>
            </div>

            {/* Enterprise */}
            <div className="plan-card rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8" style={{ borderTop: '4px solid #a855f7' }}>
              <h3 className="text-lg font-bold text-white">Enterprise</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">{txt.custom}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-gray-300">
                {['Unlimited plays', 'Unlimited games', 'Multi-location support', 'White-label option', 'Dedicated account manager', 'Custom integrations', 'Priority support'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-emerald-500 font-bold">{'\u2713'}</span> {f}</li>
                ))}
              </ul>
              <a href="#contact" className="block mt-8">
                <Button className="w-full font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>{txt.contactUs}</Button>
              </a>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">{txt.trialNote}</p>

          {/* FAQ */}
          <div className="mt-16 mx-auto max-w-2xl">
            <h3 className="text-center text-xl font-bold text-white mb-8">{txt.faqHeading}</h3>
            <div className="space-y-6">
              {[
                { q: txt.faq1q, a: txt.faq1a },
                { q: txt.faq2q, a: txt.faq2a },
                { q: txt.faq3q, a: txt.faq3a },
              ].map((faq, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <h4 className="font-semibold text-white">{faq.q}</h4>
                  <p className="mt-2 text-sm text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════════════════════  SECTION 6: CONTACT  ═══════════════════════ */}
      <section id="contact" className="py-32">
        <div ref={contactReveal.ref} className={`mx-auto max-w-2xl px-6 ${contactReveal.className}`}>
          <div className="text-center mb-12">
            <h2 className="text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em' }}>{txt.getStarted}</h2>
            <p className="mt-3 text-lg text-gray-400">{txt.getStartedSub}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-2 text-sm text-blue-300 font-medium">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
              {txt.basedIn} {'\u{1F1F2}\u{1F1E6}'}
            </div>
          </div>

          <Card className="shadow-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-[#94ffe5]/30 hover:shadow-[#94ffe5]/10">
            <CardContent className="p-8">
              <ContactForm lang={lang} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══════════════════════  SECTION 7: FOOTER  ═══════════════════════ */}
      <footer className="bg-[#060612] py-12" style={{ borderTop: '2px solid #94ffe5' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="bg-gradient-to-r from-[#6366f1] to-[#ec4899] bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
              Win &amp; Win
            </span>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">{txt.terms}</a>
              <a href="#" className="hover:text-white transition-colors">{txt.privacy}</a>
              <a href="#contact" className="hover:text-white transition-colors">{txt.contact}</a>
            </div>
            <p className="text-sm text-gray-500">{txt.madeWith} {'\u2764\u{FE0F}'} {txt.inMorocco}</p>
            <p className="text-xs text-gray-600">{txt.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
