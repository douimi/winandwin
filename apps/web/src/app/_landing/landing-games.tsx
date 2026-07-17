'use client'

import { Gift, Play, Sparkles, Star } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useScrollReveal } from './hooks'
import { useLanding } from './lang-context'

/**
 * Games showcase — three fully interactive game cards.
 *
 *   - Wheel of Fortune: spins on tap, lands on a coloured segment
 *   - Slot Machine:     three reels spin and stop with a rolling delay,
 *                       a "777" hit triggers a jackpot flash
 *   - Mystery Box:      lid pops, prize floats out, confetti bursts
 *
 * All three cards auto-idle (slow rotation / gentle wiggle / drifting
 * reels) so the section feels alive even without user input. Hover
 * accelerates the idle motion, tap runs the full play animation.
 */
export function LandingGames() {
  const { txt } = useLanding()
  const reveal = useScrollReveal()

  return (
    <section id="games" className="relative overflow-hidden py-24 sm:py-32">
      {/* Ambient background — soft radial glows that drift slowly */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        style={{ animation: 'wnw-orbit 18s ease-in-out infinite' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl"
        style={{ animation: 'wnw-orbit 24s ease-in-out infinite reverse' }}
      />

      <div ref={reveal.ref} className={`relative mx-auto max-w-6xl px-4 sm:px-6 ${reveal.className}`}>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" />
            {txt.gamesEyebrow ?? 'Interactif — testez-les'}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {txt.games}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{txt.gamesSubtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <WheelGameCard title={txt.gameWheel} desc={txt.gameWheelDesc} tapLabel={txt.gamesTapToPlay ?? 'Cliquez pour tourner'} />
          <SlotsGameCard title={txt.gameSlots} desc={txt.gameSlotsDesc} tapLabel={txt.gamesTapToPlay ?? 'Cliquez pour jouer'} />
          <MysteryGameCard title={txt.gameMystery} desc={txt.gameMysteryDesc} tapLabel={txt.gamesTapToPlay ?? 'Cliquez pour ouvrir'} />
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// Shared card chrome — one visual skeleton for all three games
// ─────────────────────────────────────────────────────────────
interface GameCardProps {
  title: string
  desc: string
  tapLabel: string
  background: string
  onPlay: () => void
  isPlaying: boolean
  children: React.ReactNode
}

function GameCard({ title, desc, tapLabel, background, onPlay, isPlaying, children }: GameCardProps) {
  return (
    <article className="group wnw-anim relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <button
        type="button"
        onClick={onPlay}
        aria-label={tapLabel}
        className="relative flex h-64 w-full items-center justify-center overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        style={{ background }}
      >
        {/* Twinkling sparkle field */}
        <Sparkle top="12%" left="18%" delay="0s" size={10} />
        <Sparkle top="26%" left="82%" delay="0.9s" size={8} />
        <Sparkle top="72%" left="14%" delay="1.6s" size={12} />
        <Sparkle top="60%" left="78%" delay="0.4s" size={9} />
        <Sparkle top="88%" left="46%" delay="2.1s" size={7} />

        {/* Slowly rotating conic ring */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: 'conic-gradient(from 0deg, rgba(255,255,255,0.35), transparent 20%, transparent 80%, rgba(255,255,255,0.35))',
            animation: 'wnw-conic-spin 22s linear infinite',
          }}
        />

        {children}

        {/* Interactive nudge — hides once played */}
        {!isPlaying && (
          <span
            className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-md"
            style={{ animation: 'wnw-pulse-cta 2.4s ease-in-out infinite' }}
          >
            <Play className="mr-1 inline h-2.5 w-2.5 fill-current" strokeWidth={0} />
            {tapLabel}
          </span>
        )}
      </button>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      </div>
    </article>
  )
}

// Little decorative twinkle used on every card — position + delay per instance.
function Sparkle({ top, left, delay, size }: { top: string; left: string; delay: string; size: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute rounded-full bg-white"
      style={{
        top,
        left,
        width: size,
        height: size,
        animation: `wnw-twinkle 3s ease-in-out ${delay} infinite`,
        boxShadow: '0 0 8px 2px rgba(255,255,255,0.6)',
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 1) Wheel of Fortune
// ─────────────────────────────────────────────────────────────
const WHEEL_SEGMENTS = [
  { color: '#f59e0b', label: '10%' },
  { color: '#6366f1', label: 'FREE' },
  { color: '#10b981', label: '20%' },
  { color: '#ec4899', label: '★' },
  { color: '#f97316', label: '15%' },
  { color: '#8b5cf6', label: 'BONUS' },
  { color: '#14b8a6', label: '5%' },
  { color: '#ef4444', label: '★' },
]

function WheelGameCard({ title, desc, tapLabel }: { title: string; desc: string; tapLabel: string }) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)

  function handleSpin() {
    if (spinning) return
    setSpinning(true)
    // Random landing angle to feel organic; base rotation stacks so the wheel
    // never rewinds visually. Duration matches the .wnw-wheel-spin keyframe.
    const finalDelta = 1260 + Math.floor(Math.random() * 360)
    setRotation((prev) => prev + finalDelta)
    window.setTimeout(() => setSpinning(false), 3200)
  }

  const idleStyle = useMemo(
    () =>
      spinning
        ? {
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 3.2s cubic-bezier(0.17, 0.67, 0.16, 0.99)',
          }
        : {
            transform: `rotate(${rotation}deg)`,
            animation: 'wnw-wheel-idle 32s linear infinite',
          },
    [spinning, rotation],
  )

  return (
    <GameCard
      title={title}
      desc={desc}
      tapLabel={tapLabel}
      background="linear-gradient(135deg, #0369A1 0%, #38bdf8 55%, #0ea5e9 100%)"
      onPlay={handleSpin}
      isPlaying={spinning}
    >
      <div className="relative">
        {/* Pointer arrow — sits above the wheel */}
        <div
          aria-hidden
          className="absolute -top-4 left-1/2 z-10 -translate-x-1/2"
          style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.35))' }}
        >
          <svg width="26" height="26" viewBox="0 0 26 26">
            <path d="M13 24 L2 4 H24 Z" fill="#fef3c7" stroke="#78350f" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>

        {/* The wheel itself */}
        <div className="relative h-40 w-40 rounded-full shadow-2xl ring-4 ring-white/40" style={idleStyle}>
          <WheelSVG />
        </div>

        {/* Hub badge — stays put while the wheel spins */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[10px] font-extrabold uppercase tracking-wider text-primary shadow-lg ring-2 ring-primary/30">
          Spin
        </div>
      </div>
    </GameCard>
  )
}

function WheelSVG() {
  const n = WHEEL_SEGMENTS.length
  const r = 100
  const cx = 110
  const cy = 110

  return (
    <svg viewBox="0 0 220 220" className="h-full w-full">
      {WHEEL_SEGMENTS.map((seg, i) => {
        const startAngle = (i * 360) / n
        const endAngle = ((i + 1) * 360) / n
        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180
        const x1 = cx + r * Math.cos(startRad)
        const y1 = cy + r * Math.sin(startRad)
        const x2 = cx + r * Math.cos(endRad)
        const y2 = cy + r * Math.sin(endRad)

        // Label placement — centre of the segment
        const midAngle = (startAngle + endAngle) / 2
        const midRad = (midAngle * Math.PI) / 180
        const lx = cx + r * 0.62 * Math.cos(midRad)
        const ly = cy + r * 0.62 * Math.sin(midRad)

        return (
          <g key={i}>
            <path
              d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
              fill={seg.color}
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fontWeight="700"
              fill="white"
              transform={`rotate(${midAngle + 90} ${lx} ${ly})`}
              style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.35)', strokeWidth: 1.5, strokeLinejoin: 'round' }}
            >
              {seg.label}
            </text>
          </g>
        )
      })}
      {/* Dashed border ring for extra flair */}
      <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// 2) Slot Machine
// ─────────────────────────────────────────────────────────────
const REEL_SYMBOLS = ['7', '★', '♣', '💎', '🍒', '🔔', '⭐']
type ReelStop = string

function SlotsGameCard({ title, desc, tapLabel }: { title: string; desc: string; tapLabel: string }) {
  const [spinning, setSpinning] = useState(false)
  const [flash, setFlash] = useState(false)
  const [reels, setReels] = useState<ReelStop[]>(['7', '★', '♣'])
  const spinTimers = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    spinTimers.current.forEach((id) => window.clearTimeout(id))
    spinTimers.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  function handleSpin() {
    if (spinning) return
    clearTimers()
    setSpinning(true)
    setFlash(false)

    // ~1 in 5 chance of a 7-7-7 jackpot to keep the demo joyful.
    const jackpot = Math.random() < 0.22
    const final: ReelStop[] = jackpot
      ? ['7', '7', '7']
      : [
          pick(REEL_SYMBOLS),
          pick(REEL_SYMBOLS),
          pick(REEL_SYMBOLS),
        ]

    // Each reel stops on its own timer to feel real.
    const stops = [1400, 1900, 2400]
    stops.forEach((delay, idx) => {
      const t = window.setTimeout(() => {
        setReels((prev) => {
          const next = [...prev]
          next[idx] = final[idx]!
          return next
        })
        if (idx === stops.length - 1) {
          setSpinning(false)
          if (jackpot) {
            setFlash(true)
            window.setTimeout(() => setFlash(false), 1200)
          }
        }
      }, delay)
      spinTimers.current.push(t)
    })
  }

  return (
    <GameCard
      title={title}
      desc={desc}
      tapLabel={tapLabel}
      background="linear-gradient(135deg, #d97706 0%, #f59e0b 55%, #fbbf24 100%)"
      onPlay={handleSpin}
      isPlaying={spinning}
    >
      <div className="relative">
        {/* Machine chassis */}
        <div className="relative rounded-2xl bg-gradient-to-b from-amber-700 to-amber-900 p-3 shadow-2xl ring-2 ring-amber-500/30">
          {/* Top marquee bulbs */}
          <div className="mb-2 flex justify-center gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-amber-300"
                style={{
                  animation: 'wnw-twinkle 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.18}s`,
                  boxShadow: '0 0 6px rgba(253, 224, 71, 0.9)',
                }}
              />
            ))}
          </div>

          {/* Reels */}
          <div className="flex gap-1.5 rounded-lg bg-amber-950/80 p-2 ring-1 ring-amber-800">
            {reels.map((symbol, i) => (
              <SlotReel key={i} symbol={symbol} spinning={spinning} index={i} />
            ))}
          </div>

          {/* Handle & win line */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-300">Win Line</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-300">×3</span>
          </div>
        </div>

        {/* Jackpot flash */}
        {flash && (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[-40px] rounded-full bg-white"
              style={{ animation: 'wnw-flash 1.2s ease-out' }}
            />
            <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-600 shadow-lg" style={{ animation: 'bounceIn 0.6s ease-out' }}>
                <Star className="mr-1 inline h-3 w-3 fill-current" /> Jackpot!
              </span>
            </div>
          </>
        )}
      </div>
    </GameCard>
  )
}

// One reel — during spin it renders a tall symbol strip that scrolls
// upward; at rest it renders the final locked symbol.
function SlotReel({ symbol, spinning, index }: { symbol: string; spinning: boolean; index: number }) {
  // Extended strip = symbols × 2 so the CSS translate(-50%) loops seamlessly.
  const strip = useMemo(() => {
    // Extra shuffle per reel so all three don't scroll in lockstep.
    const seed = [REEL_SYMBOLS[index % REEL_SYMBOLS.length]!, ...REEL_SYMBOLS]
    return [...seed, ...seed]
  }, [index])

  const spinDuration = 0.18 + index * 0.08

  return (
    <div className="relative h-16 w-14 overflow-hidden rounded-md bg-gradient-to-b from-amber-50 to-amber-100 shadow-inner ring-1 ring-amber-800/40">
      {/* Top/bottom fade — reads like a physical drum */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10" style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.35) 100%)',
      }} />

      {spinning ? (
        <div
          className="absolute inset-x-0 top-0 flex flex-col items-center will-change-transform"
          style={{ animation: `wnw-reel-idle ${spinDuration}s linear infinite` }}
        >
          {strip.map((s, i) => (
            <span key={i} className="flex h-16 shrink-0 items-center justify-center text-3xl font-bold text-amber-950">
              {s}
            </span>
          ))}
        </div>
      ) : (
        <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-amber-950">
          {symbol}
        </span>
      )}
    </div>
  )
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

// ─────────────────────────────────────────────────────────────
// 3) Mystery Box
// ─────────────────────────────────────────────────────────────
const PRIZE_OPTIONS = [
  { icon: '☕', label: 'Coffee' },
  { icon: '🍰', label: 'Dessert' },
  { icon: '🎁', label: 'Bonus' },
  { icon: '💎', label: 'Prize' },
]
const CONFETTI_COLORS = ['#f59e0b', '#ec4899', '#38bdf8', '#10b981', '#8b5cf6', '#f97316']

function MysteryGameCard({ title, desc, tapLabel }: { title: string; desc: string; tapLabel: string }) {
  const [open, setOpen] = useState(false)
  const [prize, setPrize] = useState<(typeof PRIZE_OPTIONS)[number] | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => {
    timers.current.forEach((id) => window.clearTimeout(id))
  }, [])

  function handleOpen() {
    if (open) {
      // Reset if already opened, so the user can play again.
      setOpen(false)
      setPrize(null)
      return
    }
    setOpen(true)
    // Slight delay so the lid pops before the prize appears.
    const t = window.setTimeout(() => {
      setPrize(pick(PRIZE_OPTIONS))
    }, 260)
    timers.current.push(t)
  }

  // Pre-compute 14 confetti bits so their random x/y deltas stay stable
  // through re-renders while the box is open.
  const confetti = useMemo(() => generateConfetti(14), [open])

  return (
    <GameCard
      title={title}
      desc={desc}
      tapLabel={tapLabel}
      background="linear-gradient(135deg, #10b981 0%, #14b8a6 55%, #0ea5e9 100%)"
      onPlay={handleOpen}
      isPlaying={open}
    >
      <div className="relative flex h-full w-full items-end justify-center pb-3">
        {/* Confetti layer — only visible while open */}
        {open && (
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {confetti.map((c) => (
              <span
                key={c.id}
                className="absolute h-2 w-2 rounded-sm"
                style={{
                  background: c.color,
                  left: '50%',
                  top: '50%',
                  ['--wnw-x' as string]: `${c.x}px`,
                  ['--wnw-y' as string]: `${c.y}px`,
                  ['--wnw-rot' as string]: `${c.rot}deg`,
                  animation: `wnw-confetti 1.2s ease-out ${c.delay}s forwards`,
                }}
              />
            ))}
          </div>
        )}

        {/* Prize popping out */}
        {prize && (
          <div
            className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
            style={{ animation: 'wnw-prize-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
          >
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white px-4 py-3 shadow-2xl ring-2 ring-emerald-300">
              <span className="text-4xl leading-none">{prize.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{prize.label}</span>
            </div>
          </div>
        )}

        {/* The box itself */}
        <div
          className="relative"
          style={{ animation: open ? undefined : 'wnw-box-wiggle 2.6s ease-in-out infinite' }}
        >
          {/* Lid */}
          <div
            className="relative z-10 mx-auto h-6 w-[132px] rounded-md bg-gradient-to-b from-rose-600 to-rose-800 shadow-md ring-1 ring-rose-900/40"
            style={{
              transformOrigin: 'left center',
              animation: open ? 'wnw-lid-open 0.35s ease-out forwards' : undefined,
            }}
          >
            {/* Ribbon top */}
            <div className="absolute -top-4 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-yellow-400 shadow-inner ring-1 ring-yellow-600" />
            <div className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 bg-yellow-400" />
          </div>

          {/* Box body */}
          <div className="relative h-24 w-32 rounded-lg bg-gradient-to-b from-rose-500 to-rose-700 shadow-xl ring-1 ring-rose-900/40">
            {/* Vertical ribbon */}
            <div aria-hidden className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-yellow-400" />
            {/* Gift icon front */}
            {!open && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Gift className="h-8 w-8 text-white drop-shadow" />
              </div>
            )}
            {/* Inner glow visible after open */}
            {open && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-2 top-0 h-6 rounded-t-md"
                style={{ background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.9), transparent 70%)' }}
              />
            )}
          </div>
        </div>
      </div>
    </GameCard>
  )
}

interface ConfettiBit {
  id: number
  color: string
  x: number
  y: number
  rot: number
  delay: number
}

function generateConfetti(count: number): ConfettiBit[] {
  const bits: ConfettiBit[] = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6
    const distance = 80 + Math.random() * 60
    bits.push({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]!,
      x: Math.cos(angle) * distance,
      // Bias upward so confetti flies out of the box.
      y: Math.sin(angle) * distance - 40,
      rot: 360 + Math.random() * 720,
      delay: Math.random() * 0.15,
    })
  }
  return bits
}
