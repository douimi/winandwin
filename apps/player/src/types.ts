export interface GameConfig {
  merchantName: string
  merchantLogo?: string
  merchantDescription?: string
  atmosphere?: string
  customColors?: { c1: string; c2: string; c3: string }
  game: {
    id: string
    type: 'wheel' | 'slots' | 'mystery_box'
    name: string
    branding: {
      primaryColor: string
      secondaryColor: string
      backgroundUrl?: string | null
      logoUrl?: string | null
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
  completedActionsEver: string[]
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

export type PlayerScreen = 'loading' | 'welcome' | 'action' | 'actions' | 'register' | 'game' | 'result' | 'already-played'
