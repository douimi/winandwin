// ============================================================
// Constants — Win & Win MVP
// ============================================================

export const APP_NAME = 'Win & Win'

// --- Subscription Tier Limits ---

export const TIER_LIMITS = {
  free: {
    monthlyPlays: 200,
    gameTypes: ['wheel', 'mystery_box'] as const,
    maxPrizes: 3,
    maxCtas: 3,
    maxLocations: 1,
    abTesting: false,
    apiAccess: false,
    analytics: 'basic' as const,
  },
  starter: {
    monthlyPlays: 2_000,
    gameTypes: ['wheel', 'mystery_box', 'slots'] as const,
    maxPrizes: 10,
    maxCtas: Infinity,
    maxLocations: 1,
    abTesting: false,
    apiAccess: 'readonly' as const,
    analytics: 'detailed' as const,
  },
  pro: {
    monthlyPlays: 20_000,
    gameTypes: ['wheel', 'mystery_box', 'slots'] as const,
    maxPrizes: Infinity,
    maxCtas: Infinity,
    maxLocations: 5,
    abTesting: true,
    apiAccess: 'full' as const,
    analytics: 'advanced' as const,
  },
  enterprise: {
    monthlyPlays: Infinity,
    gameTypes: ['wheel', 'mystery_box', 'slots'] as const,
    maxPrizes: Infinity,
    maxCtas: Infinity,
    maxLocations: Infinity,
    abTesting: true,
    apiAccess: 'full' as const,
    analytics: 'advanced' as const,
  },
} as const

// --- Default Game Config ---

export const DEFAULT_WIN_RATE = 30
export const DEFAULT_COUPON_VALIDITY_DAYS = 7
export const DEFAULT_COUPON_ACTIVATION_DELAY_HOURS = 24
export const DEFAULT_MAX_PLAYS_PER_DAY = 1

// --- Coupon ---

export const COUPON_CODE_LENGTH = 8

// --- Fingerprinting ---

export const FINGERPRINT_CONFIDENCE_HIGH = 85
export const FINGERPRINT_CONFIDENCE_MEDIUM = 60

// --- API ---

export const API_VERSION = 'v1'
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
