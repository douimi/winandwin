// ============================================================
// Core Domain Types — Win & Win MVP
// ============================================================

// --- Merchant ---

export interface Merchant {
  id: string
  name: string
  slug: string
  category: MerchantCategory
  email: string
  phone?: string
  logoUrl?: string
  address: Address
  timezone: string
  primaryColor?: string
  secondaryColor?: string
  backgroundUrl?: string
  description?: string
  subscriptionTier: SubscriptionTier
  createdAt: Date
  updatedAt: Date
}

export type MerchantCategory =
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'retail'
  | 'salon'
  | 'gym'
  | 'entertainment'
  | 'hotel'
  | 'other'

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise'

export interface Address {
  street: string
  city: string
  postalCode: string
  country: string
  latitude?: number
  longitude?: number
}

// --- Games ---

export type GameType =
  | 'wheel'
  | 'slots'
  | 'mystery_box'

export type GameStatus = 'draft' | 'active' | 'paused' | 'ended'

export interface Game {
  id: string
  merchantId: string
  type: GameType
  name: string
  status: GameStatus
  config: GameConfig
  createdAt: Date
  updatedAt: Date
}

export interface GameConfig {
  prizes: Prize[]
  globalWinRate: number
  scheduling: GameSchedule
  frequencyLimit: FrequencyLimit
  branding: GameBranding
}

export interface Prize {
  id: string
  name: string
  description?: string
  emoji?: string
  winRate: number
  maxTotal?: number
  maxPerDay?: number
  couponValidityDays: number
  couponActivationDelayHours: number
}

export interface GameSchedule {
  startDate?: string
  endDate?: string
  activeDays: number[] // 0=Sun, 6=Sat
  activeHoursStart?: string // HH:mm
  activeHoursEnd?: string // HH:mm
}

export interface FrequencyLimit {
  maxPlaysPerDay: number
  maxPlaysPerWeek?: number
  cooldownMinutes?: number
}

export interface GameBranding {
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
  backgroundUrl?: string
}

// --- CTAs ---

export type CtaType =
  | 'google_review'
  | 'instagram_follow'
  | 'email_collect'
  | 'visit_stamp'
  | 'receipt_photo'
  | 'tripadvisor_review'
  | 'facebook_like'
  | 'tiktok_follow'
  | 'book_appointment'
  | 'whatsapp_join'
  | 'refer_friend'
  | 'survey_feedback'

export interface Cta {
  id: string
  merchantId: string
  type: CtaType
  enabled: boolean
  weight: number
  config: Record<string, unknown>
}

// --- Coupons ---

export type CouponStatus = 'active' | 'redeemed' | 'expired' | 'revoked'

export interface Coupon {
  id: string
  merchantId: string
  gameId: string
  prizeId: string
  playerId: string
  code: string
  status: CouponStatus
  prizeName: string
  prizeDescription?: string
  validFrom: Date
  validUntil: Date
  redeemedAt?: Date
  createdAt: Date
}

// --- Players ---

export interface Player {
  id: string
  fingerprintId: string
  email?: string
  phone?: string
  totalPlays: number
  totalWins: number
  createdAt: Date
  lastSeenAt: Date
}

// --- Game Play ---

export interface GamePlay {
  id: string
  gameId: string
  merchantId: string
  playerId: string
  result: 'win' | 'lose'
  prizeId?: string
  couponId?: string
  completedActions: CtaType[]
  playedAt: Date
}

// --- API ---

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
