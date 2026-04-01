import { useEffect, useRef, useState } from 'preact/hooks'

interface SlotsProps {
  prizes: { id: string; name: string; emoji?: string }[]
  branding: { primaryColor: string; secondaryColor: string }
  spinning: boolean
  onSpin: () => void
  onSpinComplete: (targetIndex: number) => void
  targetIndex: number | null
}

const MISS_SYMBOLS = ['\uD83C\uDF52', '\uD83D\uDD14', '\uD83D\uDC8E', '\u2B50', '7\uFE0F\u20E3']
const REEL_SIZE = 20
const SPIN_DURATION = 3000

function buildReelSymbols(
  prizes: { id: string; name: string; emoji?: string }[],
): string[] {
  const symbols: string[] = []
  for (const p of prizes) {
    symbols.push(p.emoji || '\uD83C\uDF81')
  }
  for (const m of MISS_SYMBOLS) {
    symbols.push(m)
  }
  // Fill up to REEL_SIZE by repeating
  const pool = [...symbols]
  while (symbols.length < REEL_SIZE) {
    symbols.push(pool[symbols.length % pool.length]!)
  }
  return symbols
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export function Slots({
  prizes,
  branding,
  spinning,
  onSpin,
  onSpinComplete,
  targetIndex,
}: SlotsProps) {
  const hasSpun = useRef(false)
  const [reelSymbols] = useState(() => {
    const base = buildReelSymbols(prizes)
    return [shuffleArray(base), shuffleArray(base), shuffleArray(base)]
  })
  const [reelOffsets, setReelOffsets] = useState([0, 0, 0])
  const [stopped, setStopped] = useState([false, false, false])
  const [finalSymbols, setFinalSymbols] = useState<string[]>([])
  const animRef = useRef<number | null>(null)
  const startTimeRef = useRef(0)

  // Reset hasSpun when not spinning (allows replay after try again)
  useEffect(() => {
    if (!spinning && targetIndex === null) {
      hasSpun.current = false
      setStopped([false, false, false])
      setFinalSymbols([])
    }
  }, [spinning, targetIndex])

  function handlePull() {
    if (spinning || hasSpun.current) return
    hasSpun.current = true
    onSpin()
  }

  // When targetIndex is set, run the animation
  useEffect(() => {
    if (!spinning || targetIndex === null) return

    // Determine win/lose and which emoji to show
    const isWin = targetIndex < prizes.length
    let winEmoji = ''
    if (isWin) {
      winEmoji = prizes[targetIndex]?.emoji || '\uD83C\uDF81'
    }

    // Pick final symbols for each reel
    const finals: string[] = []
    if (isWin) {
      finals.push(winEmoji, winEmoji, winEmoji)
    } else {
      // Make sure they don't all match
      const pool = [...MISS_SYMBOLS]
      finals.push(pool[0]!, pool[1]!, pool[2]!)
    }
    setFinalSymbols(finals)

    // Animate reels
    const speeds = [0.15, 0.12, 0.1] // reel speed (lower = faster)
    const stopDelays = [SPIN_DURATION * 0.5, SPIN_DURATION * 0.7, SPIN_DURATION]
    startTimeRef.current = performance.now()

    function animate(now: number) {
      const elapsed = now - startTimeRef.current
      const newOffsets = [0, 0, 0]
      const newStopped = [false, false, false]

      for (let i = 0; i < 3; i++) {
        if (elapsed >= stopDelays[i]!) {
          newStopped[i] = true
          newOffsets[i] = 0
        } else {
          newOffsets[i] = (elapsed / (speeds[i]! * 60)) % REEL_SIZE
        }
      }

      setReelOffsets([...newOffsets])
      setStopped([...newStopped])

      if (elapsed < SPIN_DURATION) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setStopped([true, true, true])
        setReelOffsets([0, 0, 0])
        setTimeout(() => {
          onSpinComplete(targetIndex!)
        }, 200)
      }
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [spinning, targetIndex])

  function getVisibleSymbol(reelIdx: number): string {
    if (stopped[reelIdx] && finalSymbols.length > 0) {
      return finalSymbols[reelIdx]!
    }
    const reel = reelSymbols[reelIdx]!
    const offset = Math.floor(reelOffsets[reelIdx]!) % reel.length
    return reel[offset]!
  }

  function getAboveSymbol(reelIdx: number): string {
    if (stopped[reelIdx] && finalSymbols.length > 0) {
      const reel = reelSymbols[reelIdx]!
      return reel[Math.floor(Math.random() * reel.length)]!
    }
    const reel = reelSymbols[reelIdx]!
    const offset = (Math.floor(reelOffsets[reelIdx]!) + 1) % reel.length
    return reel[offset]!
  }

  function getBelowSymbol(reelIdx: number): string {
    if (stopped[reelIdx] && finalSymbols.length > 0) {
      const reel = reelSymbols[reelIdx]!
      return reel[Math.floor(Math.random() * reel.length)]!
    }
    const reel = reelSymbols[reelIdx]!
    const offset = (Math.floor(reelOffsets[reelIdx]!) - 1 + reel.length) % reel.length
    return reel[offset]!
  }

  const allStopped = stopped[0] && stopped[1] && stopped[2]
  const isSpinning = spinning && !allStopped

  return (
    <div class="slots-container">
      {/* Slot Machine Frame */}
      <div class="slots-frame" style={{
        borderColor: branding.primaryColor,
      }}>
        <div class="slots-header">
          <span class="slots-star">{'\u2B50'}</span>
          <span class="slots-title-text">SLOTS</span>
          <span class="slots-star">{'\u2B50'}</span>
        </div>

        <div class="slot-window">
          {[0, 1, 2].map((reelIdx) => (
            <div key={reelIdx} class={`slot-reel${stopped[reelIdx] && finalSymbols.length > 0 ? ' stopped' : ''}${isSpinning ? ' spinning' : ''}`}>
              <div class="slot-symbol slot-symbol-dim">{getAboveSymbol(reelIdx)}</div>
              <div class={`slot-symbol slot-symbol-main${stopped[reelIdx] && finalSymbols.length > 0 ? ' landed' : ''}`}>
                {getVisibleSymbol(reelIdx)}
              </div>
              <div class="slot-symbol slot-symbol-dim">{getBelowSymbol(reelIdx)}</div>
            </div>
          ))}

          {/* Win line indicator */}
          <div class="slot-win-line" />
        </div>

        {/* Decorative lights */}
        <div class="slots-lights">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              class={`slots-light${i % 2 === 0 ? ' gold' : ''}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      <button
        class={`spin-button${spinning ? ' disabled' : ''}`}
        onClick={handlePull}
        disabled={spinning}
        type="button"
      >
        {spinning ? 'Pulling...' : 'PULL!'}
      </button>
    </div>
  )
}
