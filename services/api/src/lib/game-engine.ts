/**
 * Game Engine — Win/Lose determination and prize allocation
 *
 * The game outcome is determined server-side (provably fair).
 * 1. Roll against globalWinRate to determine win/lose
 * 2. If win: select a prize using weighted random selection
 * 3. Verify prize availability (max total, max per day)
 * 4. Generate coupon if won
 */

export interface PrizeConfig {
  id: string
  name: string
  description?: string
  emoji?: string
  winRate: number
  maxTotal?: number
  maxPerDay?: number
  totalWon: number
  todayWon: number
  couponValidityDays: number
  couponActivationDelayHours: number
}

export interface GameResult {
  outcome: 'win' | 'lose'
  prize?: {
    id: string
    name: string
    description?: string
    emoji?: string
    couponValidityDays: number
    couponActivationDelayHours: number
  }
}

export function determineGameOutcome(
  globalWinRate: number,
  prizes: PrizeConfig[],
): GameResult {
  // Step 1: Roll against global win rate
  const roll = Math.random() * 100
  if (roll >= globalWinRate) {
    return { outcome: 'lose' }
  }

  // Step 2: Filter to available prizes
  const availablePrizes = prizes.filter((p) => {
    if (p.maxTotal !== undefined && p.maxTotal !== null && p.totalWon >= p.maxTotal) return false
    if (p.maxPerDay !== undefined && p.maxPerDay !== null && p.todayWon >= p.maxPerDay) return false
    return true
  })

  if (availablePrizes.length === 0) {
    return { outcome: 'lose' }
  }

  // Step 3: Weighted random prize selection
  const totalWeight = availablePrizes.reduce((sum, p) => sum + p.winRate, 0)
  let prizeRoll = Math.random() * totalWeight
  let selectedPrize = availablePrizes[0]!

  for (const prize of availablePrizes) {
    prizeRoll -= prize.winRate
    if (prizeRoll <= 0) {
      selectedPrize = prize
      break
    }
  }

  return {
    outcome: 'win',
    prize: {
      id: selectedPrize.id,
      name: selectedPrize.name,
      description: selectedPrize.description,
      emoji: selectedPrize.emoji,
      couponValidityDays: selectedPrize.couponValidityDays,
      couponActivationDelayHours: selectedPrize.couponActivationDelayHours,
    },
  }
}

/**
 * Generate a unique coupon code (8 chars, alphanumeric uppercase)
 */
export function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I/O/1/0 to avoid confusion
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Calculate coupon validity dates
 */
export function calculateCouponDates(
  activationDelayHours: number,
  validityDays: number,
): { validFrom: Date; validUntil: Date } {
  const now = new Date()
  const validFrom = new Date(now.getTime() + activationDelayHours * 60 * 60 * 1000)
  const validUntil = new Date(validFrom.getTime() + validityDays * 24 * 60 * 60 * 1000)
  return { validFrom, validUntil }
}
