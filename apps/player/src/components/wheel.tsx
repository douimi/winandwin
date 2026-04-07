import { useEffect, useRef, useState } from 'preact/hooks'
import { useT } from '../lib/i18n'
import type { BusinessTheme } from '../lib/business-themes'

interface WheelProps {
  prizes: { id: string; name: string; emoji?: string }[]
  branding: { primaryColor: string; secondaryColor: string }
  onSpinComplete: (targetIndex: number) => void
  spinning: boolean
  onSpin: () => void
  /** Index in the DISPLAY segments array (includes "Try Again" segments) */
  targetIndex: number | null
  /** Atmosphere wheel colors — overrides default palette */
  wheelColors?: string[]
  /** Atmosphere wheel border color */
  wheelBorder?: string
  /** Atmosphere wheel center hub color */
  wheelCenter?: string
  /** Atmosphere wheel text color */
  wheelText?: string
  /** Business theme for themed text */
  businessTheme?: BusinessTheme
}

export interface WheelSegment {
  id: string
  name: string
  emoji?: string
  isPrize: boolean
}

/**
 * Build display segments: interleave real prizes with "Try Again" segments.
 * This ensures the wheel always has somewhere to land on a loss.
 */
export function buildWheelSegments(
  prizes: { id: string; name: string; emoji?: string }[],
  tryAgainText = 'Try Again',
  tryAgainEmoji = '\u{1F340}',
): WheelSegment[] {
  if (prizes.length === 0) return []

  const segments: WheelSegment[] = []
  // Ensure minimum 6 segments for visual appeal
  const tryAgainCount = Math.max(prizes.length, 3)

  for (let i = 0; i < prizes.length; i++) {
    // Prize segment
    segments.push({ ...prizes[i]!, isPrize: true })
    // "Try Again" segment after each prize
    segments.push({
      id: `try-again-${i}`,
      name: tryAgainText,
      emoji: tryAgainEmoji,
      isPrize: false,
    })
  }

  // If only 1 prize (2 segments), pad to at least 6
  while (segments.length < 6) {
    const idx = segments.length
    if (idx % 2 === 0) {
      // Duplicate prize display (but it's just visual)
      const prizeIdx = Math.floor((idx / 2) % prizes.length)
      segments.push({ ...prizes[prizeIdx]!, id: `dup-${idx}`, isPrize: true })
    } else {
      segments.push({
        id: `try-again-extra-${idx}`,
        name: tryAgainText,
        emoji: tryAgainEmoji,
        isPrize: false,
      })
    }
  }

  return segments
}

/**
 * Find a valid target index for the given outcome.
 * Win: lands on a segment matching the prize name.
 * Lose: lands on a "Try Again" segment.
 */
export function findTargetIndex(
  segments: WheelSegment[],
  outcome: 'win' | 'lose',
  prizeName?: string,
): number {
  if (outcome === 'win' && prizeName) {
    const idx = segments.findIndex((s) => s.isPrize && s.name === prizeName)
    if (idx >= 0) return idx
  }
  // Lose — pick a random "Try Again" segment
  const tryAgainIndices = segments
    .map((s, i) => (s.isPrize ? -1 : i))
    .filter((i) => i >= 0)
  if (tryAgainIndices.length > 0) {
    return tryAgainIndices[Math.floor(Math.random() * tryAgainIndices.length)]!
  }
  return 0
}

const SPIN_DURATION = 4500
const MIN_ROTATIONS = 6

/** Generate rich segment colors */
function segmentColor(index: number, isPrize: boolean, primary: string, secondary: string, atmosphereColors?: string[]): string {
  if (atmosphereColors && atmosphereColors.length > 0) {
    // Use atmosphere colors for all segments
    return atmosphereColors[index % atmosphereColors.length]!
  }
  if (!isPrize) return '#2d2d3d' // Dark muted for "Try Again"
  const palette = [primary, secondary, '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316']
  return palette[Math.floor(index / 2) % palette.length]!
}

/** Lighten a hex/rgb color */
function lighten(color: string, amount = 0.3): string {
  if (color.startsWith('#')) {
    const c = color.replace('#', '')
    const r = Math.min(255, Math.round(parseInt(c.substring(0, 2), 16) * (1 + amount)))
    const g = Math.min(255, Math.round(parseInt(c.substring(2, 4), 16) * (1 + amount)))
    const b = Math.min(255, Math.round(parseInt(c.substring(4, 6), 16) * (1 + amount)))
    return `rgb(${r},${g},${b})`
  }
  return color
}

function darken(color: string, amount = 0.25): string {
  if (color.startsWith('#')) {
    const c = color.replace('#', '')
    const r = Math.max(0, Math.round(parseInt(c.substring(0, 2), 16) * (1 - amount)))
    const g = Math.max(0, Math.round(parseInt(c.substring(2, 4), 16) * (1 - amount)))
    const b = Math.max(0, Math.round(parseInt(c.substring(4, 6), 16) * (1 - amount)))
    return `rgb(${r},${g},${b})`
  }
  return color
}

export function Wheel({ prizes, branding, onSpinComplete, spinning, onSpin, targetIndex, wheelColors, wheelBorder, wheelCenter, wheelText, businessTheme }: WheelProps) {
  const t = useT()
  const [rotation, setRotation] = useState(0)
  const isAnimating = useRef(false)

  // Build display segments with themed "Try Again" text
  const segments = buildWheelSegments(
    prizes,
    businessTheme?.tryAgainText,
    businessTheme?.tryAgainEmoji,
  )
  const segmentAngle = 360 / segments.length

  // Reset rotation when not spinning (allows re-spin in test mode)
  useEffect(() => {
    if (!spinning && rotation !== 0) {
      // After spin completes, reset for next spin (without transition)
      const timer = setTimeout(() => {
        isAnimating.current = false
        setRotation(0)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [spinning])

  function handleSpin() {
    if (spinning || isAnimating.current) return
    onSpin()
  }

  // When targetIndex is set and we're spinning, calculate the rotation
  if (spinning && targetIndex !== null && !isAnimating.current) {
    isAnimating.current = true
    const targetMiddle = targetIndex * segmentAngle + segmentAngle / 2
    const stopAt = 360 - targetMiddle
    const totalDegrees = MIN_ROTATIONS * 360 + stopAt
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setRotation(totalDegrees)
      })
    })

    setTimeout(() => {
      onSpinComplete(targetIndex)
    }, SPIN_DURATION + 200)
  }

  const SIZE = 340
  const CENTER = SIZE / 2
  const RADIUS = SIZE / 2 - 16
  const OUTER_R = SIZE / 2

  // Light bulb dots
  const bulbs: { cx: number; cy: number; isGold: boolean }[] = []
  const bulbCount = Math.max(segments.length * 2, 24)
  for (let i = 0; i < bulbCount; i++) {
    const angle = ((i * 360) / bulbCount - 90) * (Math.PI / 180)
    const r = OUTER_R - 8
    bulbs.push({
      cx: CENTER + r * Math.cos(angle),
      cy: CENTER + r * Math.sin(angle),
      isGold: i % 2 === 0,
    })
  }

  return (
    <div class="wheel-container">
      {/* Pointer */}
      <div class="wheel-pointer">
        <svg width="40" height="44" viewBox="0 0 40 44">
          <defs>
            <linearGradient id="pointer-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FFD700" />
              <stop offset="40%" stop-color="#e53e3e" />
              <stop offset="100%" stop-color="#9b2c2c" />
            </linearGradient>
            <filter id="pointer-shadow">
              <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.4" />
            </filter>
          </defs>
          <polygon
            points="20,42 4,4 36,4"
            fill="url(#pointer-grad)"
            stroke="#FFD700"
            stroke-width="1.5"
            filter="url(#pointer-shadow)"
          />
          <polygon
            points="20,36 10,8 26,8"
            fill="rgba(255,255,255,0.15)"
          />
        </svg>
      </div>

      {/* Wheel */}
      <div class="wheel-wrapper">
        <div
          class={`wheel-svg-wrap${spinning ? ' spinning' : ''}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height="100%">
            <defs>
              {segments.map((seg, i) => {
                const color = segmentColor(i, seg.isPrize, branding.primaryColor, branding.secondaryColor, wheelColors)
                return (
                  <radialGradient key={`grad-${i}`} id={`seg-grad-${i}`} cx="50%" cy="50%" r="55%">
                    <stop offset="0%" stop-color={lighten(color, seg.isPrize ? 0.15 : 0.05)} />
                    <stop offset="60%" stop-color={color} />
                    <stop offset="100%" stop-color={darken(color, 0.3)} />
                  </radialGradient>
                )
              })}
              <radialGradient id="ring-grad" cx="50%" cy="35%" r="55%">
                <stop offset="0%" stop-color="#5a4a2a" />
                <stop offset="40%" stop-color="#2a1f0f" />
                <stop offset="100%" stop-color="#1a1408" />
              </radialGradient>
              <radialGradient id="hub-grad" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="50%" stop-color="#e0e0e0" />
                <stop offset="100%" stop-color="#a0a0a0" />
              </radialGradient>
              <filter id="hub-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.35" />
              </filter>
            </defs>

            {/* Outer ring */}
            <circle cx={CENTER} cy={CENTER} r={OUTER_R - 1} fill="url(#ring-grad)" stroke={wheelBorder || '#FFD700'} stroke-width="2" />
            <circle cx={CENTER} cy={CENTER} r={OUTER_R - 3} fill="none" stroke={wheelBorder ? `${wheelBorder}4d` : 'rgba(255,215,0,0.3)'} stroke-width="1" />

            {/* Segments */}
            {segments.map((seg, i) => {
              const startAngle = i * segmentAngle - 90
              const endAngle = startAngle + segmentAngle
              const startRad = (startAngle * Math.PI) / 180
              const endRad = (endAngle * Math.PI) / 180
              const x1 = CENTER + RADIUS * Math.cos(startRad)
              const y1 = CENTER + RADIUS * Math.sin(startRad)
              const x2 = CENTER + RADIUS * Math.cos(endRad)
              const y2 = CENTER + RADIUS * Math.sin(endRad)
              const largeArc = segmentAngle > 180 ? 1 : 0

              const midAngleRad = ((startAngle + endAngle) / 2) * (Math.PI / 180)
              const labelR = RADIUS * 0.58
              const labelX = CENTER + labelR * Math.cos(midAngleRad)
              const labelY = CENTER + labelR * Math.sin(midAngleRad)
              const textRot = (startAngle + endAngle) / 2 + 90

              const emojiR = RADIUS * 0.78
              const emojiX = CENTER + emojiR * Math.cos(midAngleRad)
              const emojiY = CENTER + emojiR * Math.sin(midAngleRad)

              const nameStr = seg.name.length > 10 ? `${seg.name.slice(0, 9)}...` : seg.name

              return (
                <g key={seg.id}>
                  <path
                    d={`M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={`url(#seg-grad-${i})`}
                  />
                  <line x1={CENTER} y1={CENTER} x2={x1} y2={y1} stroke="rgba(255,215,0,0.6)" stroke-width="2" />
                  {seg.emoji && (
                    <text
                      x={emojiX} y={emojiY}
                      text-anchor="middle" dominant-baseline="central"
                      font-size={seg.isPrize ? '20' : '14'}
                      transform={`rotate(${textRot}, ${emojiX}, ${emojiY})`}
                    >
                      {seg.emoji}
                    </text>
                  )}
                  <text
                    x={labelX} y={labelY}
                    text-anchor="middle" dominant-baseline="central"
                    fill={seg.isPrize ? (wheelText || '#fff') : `${wheelText || 'rgba(255,255,255,0.6)'}`}
                    font-size={seg.isPrize ? '13' : '10'}
                    font-weight={seg.isPrize ? '800' : '500'}
                    font-style={seg.isPrize ? 'normal' : 'italic'}
                    stroke={seg.isPrize ? 'rgba(0,0,0,0.4)' : 'none'}
                    stroke-width={seg.isPrize ? '0.3' : '0'}
                    paint-order="stroke"
                    transform={`rotate(${textRot}, ${labelX}, ${labelY})`}
                  >
                    {nameStr}
                  </text>
                </g>
              )
            })}

            {/* Light bulbs */}
            {bulbs.map((b, i) => (
              <g key={`bulb-${i}`}>
                <circle cx={b.cx} cy={b.cy} r={b.isGold ? 4 : 3} fill={b.isGold ? '#FFD700' : '#fff'} opacity={b.isGold ? 0.9 : 0.6} />
                {b.isGold && <circle cx={b.cx} cy={b.cy} r={6} fill="rgba(255,215,0,0.2)" />}
              </g>
            ))}

            {/* Center hub */}
            <circle cx={CENTER} cy={CENTER} r={30} fill={wheelCenter || 'url(#hub-grad)'} stroke={wheelCenter ? darken(wheelCenter, 0.2) : '#c0c0c0'} stroke-width="2" filter="url(#hub-shadow)" />
            <circle cx={CENTER} cy={CENTER} r={26} fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1" />
            <text x={CENTER} y={CENTER} text-anchor="middle" dominant-baseline="central" fill={wheelText || '#6366f1'} font-size={businessTheme ? '18' : '12'} font-weight="800" letter-spacing={businessTheme ? '0' : '2'}>{businessTheme?.spinButtonIcon || t.player.spin.replace('!', '')}</text>
          </svg>
        </div>
      </div>

      <button
        class={`spin-button${spinning ? ' disabled' : ''}`}
        onClick={handleSpin}
        disabled={spinning}
        type="button"
      >
        {spinning ? t.player.spinning : (businessTheme?.spinButtonText || t.player.spin)}
      </button>
    </div>
  )
}
