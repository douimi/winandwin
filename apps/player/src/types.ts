export interface GameConfig {
  merchantName: string
  game: {
    id: string
    type: 'wheel' | 'slots' | 'mystery_box'
    name: string
    branding: {
      primaryColor: string
      secondaryColor: string
    }
    prizes: { id: string; name: string; emoji?: string }[]
  }
  requiredActions: { type: string; label: string; weight: number; config?: Record<string, string> }[]
  minActionsRequired: number
}

export interface SpinResult {
  outcome: 'win' | 'lose'
  prize?: {
    name: string
    description?: string
    emoji?: string
  }
  coupon?: {
    code: string
    validFrom: string
    validUntil: string
  }
  message?: string
}

export interface PlayerState {
  playerId: string | null
  completedActionsToday: string[]
  playsToday: number
  maxPlaysPerDay: number
  canPlay: boolean
  lastPlayResult: 'win' | 'lose' | null
  lastCoupon: {
    code: string
    validFrom: string
    validUntil: string
  } | null
}

export type PlayerScreen = 'loading' | 'actions' | 'game' | 'result' | 'already-played'
