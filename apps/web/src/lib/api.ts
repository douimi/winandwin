import type {
  ApiResponse,
  Coupon,
  Game,
  Merchant,
  PaginatedResponse,
} from '@winandwin/shared'

// ---------------------------------------------------------------------------
// API client for the Win & Win dashboard
// ---------------------------------------------------------------------------

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE}${path}`

  let res: Response
  try {
    res = await fetch(url, { ...options, headers })
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Unable to reach the API server', 0)
  }

  if (!res.ok) {
    let body: ApiResponse<unknown> | undefined
    try {
      body = (await res.json()) as ApiResponse<unknown>
    } catch {
      /* ignore parse errors */
    }
    throw new ApiError(
      body?.error?.code ?? 'UNKNOWN',
      body?.error?.message ?? `Request failed with status ${res.status}`,
      res.status,
      body?.error?.details,
    )
  }

  const json = (await res.json()) as ApiResponse<T>
  if (!json.success) {
    throw new ApiError(
      json.error?.code ?? 'UNKNOWN',
      json.error?.message ?? 'Unknown error',
      res.status,
      json.error?.details,
    )
  }
  return json.data as T
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export interface StatsOverview {
  activePlayersToday: number
  gamesPlayed: number
  actionsCompleted: number
  couponsRedeemed: number
}

export interface AnalyticsData {
  kpis: {
    totalPlayers: number
    totalPlayersChange: string
    gamesPlayed: number
    gamesPlayedChange: string
    actionsCompleted: number
    actionsCompletedChange: string
    couponsRedeemed: number
    couponsRedeemedChange: string
  }
  funnel: {
    label: string
    value: number
    percentage: number
  }[]
  topActions: {
    label: string
    icon: string
    percentage: number
    count: number
  }[]
  prizePopularity: {
    label: string
    icon: string
    percentage: number
    count: number
  }[]
}

export interface CouponStats {
  active: number
  redeemedThisWeek: number
  redemptionRate: number
}

export async function fetchStatsOverview(
  merchantId: string,
  token?: string,
): Promise<StatsOverview> {
  return request<StatsOverview>(
    `/api/v1/stats/overview?merchantId=${encodeURIComponent(merchantId)}`,
    {},
    token,
  )
}

export async function fetchAnalytics(
  merchantId: string,
  token?: string,
): Promise<AnalyticsData> {
  return request<AnalyticsData>(
    `/api/v1/stats/analytics?merchantId=${encodeURIComponent(merchantId)}`,
    {},
    token,
  )
}

export async function fetchCouponStats(
  merchantId: string,
  token?: string,
): Promise<CouponStats> {
  return request<CouponStats>(
    `/api/v1/stats/coupons?merchantId=${encodeURIComponent(merchantId)}`,
    {},
    token,
  )
}

// ---------------------------------------------------------------------------
// Merchants
// ---------------------------------------------------------------------------

export interface CreateMerchantPayload {
  name: string
  category: string
  email: string
  userId?: string
  address?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
}

export async function createMerchant(
  payload: CreateMerchantPayload,
  token?: string,
): Promise<Merchant> {
  return request<Merchant>(
    '/api/v1/merchants',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  )
}

export async function fetchMerchant(
  merchantId: string,
  token?: string,
): Promise<Merchant> {
  return request<Merchant>(
    `/api/v1/merchants/${encodeURIComponent(merchantId)}`,
    {},
    token,
  )
}

export async function updateMerchant(
  merchantId: string,
  payload: Partial<{
    name: string
    category: string
    timezone: string
    phone: string
    address: {
      street: string
      city: string
      postalCode: string
      country: string
    }
  }>,
  token?: string,
): Promise<Merchant> {
  return request<Merchant>(
    `/api/v1/merchants/${encodeURIComponent(merchantId)}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    token,
  )
}

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------

export interface GameWithStats {
  id: string
  name: string
  type: string
  status: string
  totalPlays: number
  totalWins: number
  prizes: number
  createdAt: string
}

export async function fetchGames(
  merchantId: string,
  token?: string,
): Promise<GameWithStats[]> {
  return request<GameWithStats[]>(
    `/api/v1/games?merchantId=${encodeURIComponent(merchantId)}`,
    {},
    token,
  )
}

export interface CreateGamePayload {
  merchantId: string
  type: string
  name: string
  config: {
    prizes: {
      name: string
      emoji?: string
      winRate: number
      couponValidityDays: number
      couponActivationDelayHours?: number
    }[]
    globalWinRate: number
    scheduling?: Record<string, unknown>
    frequencyLimit?: Record<string, unknown>
    branding?: Record<string, unknown>
  }
}

export async function createGame(
  payload: CreateGamePayload,
  token?: string,
): Promise<Game> {
  return request<Game>(
    '/api/v1/games',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  )
}

export interface GameDetail {
  id: string
  name: string
  type: string
  status: string
  globalWinRate: string
  scheduling: Record<string, unknown>
  frequencyLimit: { maxPlaysPerDay: number }
  branding: { primaryColor: string; secondaryColor: string }
  prizes: {
    id: string
    name: string
    emoji?: string
    winRate: number
    maxTotal?: number
    maxPerDay?: number
    totalWon: number
    couponValidityDays: number
    couponActivationDelayHours: number
  }[]
  createdAt: string
}

export interface UpdateGamePayload {
  name?: string
  status?: string
  globalWinRate?: number
  branding?: { primaryColor: string; secondaryColor: string }
  frequencyLimit?: { maxPlaysPerDay: number }
}

export async function fetchGame(
  gameId: string,
  token?: string,
): Promise<GameDetail> {
  return request<GameDetail>(
    `/api/v1/games/${encodeURIComponent(gameId)}`,
    {},
    token,
  )
}

export async function updateGame(
  gameId: string,
  payload: UpdateGamePayload,
  token?: string,
): Promise<Game> {
  return request<Game>(
    `/api/v1/games/${encodeURIComponent(gameId)}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    token,
  )
}

export async function deleteGame(
  gameId: string,
  token?: string,
): Promise<void> {
  return request<void>(
    `/api/v1/games/${encodeURIComponent(gameId)}`,
    { method: 'DELETE' },
    token,
  )
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export interface CouponWithDetails {
  id: string
  code: string
  prizeName: string
  status: string
  validUntil: string
  playerEmail: string | null
}

export async function fetchCoupons(
  merchantId: string,
  token?: string,
): Promise<CouponWithDetails[]> {
  return request<CouponWithDetails[]>(
    `/api/v1/coupons?merchantId=${encodeURIComponent(merchantId)}`,
    {},
    token,
  )
}

export async function redeemCoupon(
  couponId: string,
  token?: string,
): Promise<Coupon> {
  return request<Coupon>(
    `/api/v1/coupons/${encodeURIComponent(couponId)}/redeem`,
    { method: 'POST' },
    token,
  )
}

export async function revokeCoupon(
  couponId: string,
  token?: string,
): Promise<Coupon> {
  return request<Coupon>(
    `/api/v1/coupons/${encodeURIComponent(couponId)}/revoke`,
    { method: 'POST' },
    token,
  )
}

// ---------------------------------------------------------------------------
// CTAs
// ---------------------------------------------------------------------------

export interface CtaItem {
  id: string
  merchantId: string
  type: string
  enabled: boolean
  weight: number
  config: Record<string, unknown>
  createdAt: string
}

export async function fetchCtas(
  merchantId: string,
  token?: string,
): Promise<CtaItem[]> {
  return request<CtaItem[]>(
    `/api/v1/ctas?merchantId=${encodeURIComponent(merchantId)}`,
    {},
    token,
  )
}

export async function createCta(
  payload: {
    merchantId: string
    type: string
    enabled?: boolean
    weight?: number
    config?: Record<string, unknown>
  },
  token?: string,
): Promise<CtaItem> {
  return request<CtaItem>(
    '/api/v1/ctas',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  )
}

export async function updateCta(
  ctaId: string,
  payload: {
    enabled?: boolean
    weight?: number
    config?: Record<string, unknown>
  },
  token?: string,
): Promise<CtaItem> {
  return request<CtaItem>(
    `/api/v1/ctas/${encodeURIComponent(ctaId)}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    token,
  )
}

export async function deleteCta(
  ctaId: string,
  token?: string,
): Promise<{ id: string; deleted: boolean }> {
  return request<{ id: string; deleted: boolean }>(
    `/api/v1/ctas/${encodeURIComponent(ctaId)}`,
    { method: 'DELETE' },
    token,
  )
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export interface PlayerData {
  id: string
  name: string | null
  email: string | null
  totalPlays: number
  totalWins: number
  lastSeenAt: string
  createdAt: string
}

export async function fetchPlayers(
  merchantId: string,
  search?: string,
  token?: string,
): Promise<PlayerData[]> {
  let path = `/api/v1/players?merchantId=${encodeURIComponent(merchantId)}`
  if (search) {
    path += `&search=${encodeURIComponent(search)}`
  }
  return request<PlayerData[]>(path, {}, token)
}

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------

export interface UsageStats {
  playsThisMonth: number
  monthlyLimit: number | null
  tier: string
  percentUsed: number
}

export async function fetchUsageStats(
  merchantId: string,
  token?: string,
): Promise<UsageStats> {
  return request<UsageStats>(
    `/api/v1/stats/usage?merchantId=${encodeURIComponent(merchantId)}`,
    {},
    token,
  )
}
