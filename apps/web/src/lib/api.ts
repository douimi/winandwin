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

/** Default request timeout in milliseconds */
const REQUEST_TIMEOUT_MS = 15_000

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

  // AbortController for timeout handling
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(url, { ...options, headers, signal: controller.signal })
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('TIMEOUT', 'Request timed out — the server took too long to respond', 0)
    }
    throw new ApiError('NETWORK_ERROR', 'Unable to reach the API server', 0)
  } finally {
    clearTimeout(timeoutId)
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
  weeklyActivity: {
    day: string
    date: string
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

export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'all'

export async function fetchAnalytics(
  merchantId: string,
  period?: AnalyticsPeriod,
  token?: string,
): Promise<AnalyticsData> {
  const params = new URLSearchParams({ merchantId })
  if (period) params.set('period', period)
  return request<AnalyticsData>(
    `/api/v1/stats/analytics?${params.toString()}`,
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
    validationPin: string
    primaryColor: string
    secondaryColor: string
    backgroundUrl: string
    description: string
    logoUrl: string
    atmosphere: string
    language: string
    showLogo: boolean
    showName: boolean
    customColor1: string
    customColor2: string
    customColor3: string
    ctaMode: string
    cooldownHours: number
    maxWinsPerPeriod: number
    winPeriodDays: number
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
  description?: string
  config: {
    prizes: {
      name: string
      emoji?: string
      winRate: number
      couponValidityDays: number
      couponActivationDelayHours?: number
      maxTotal?: number
      maxPerDay?: number
      redemptionConditions?: string[]
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
  description?: string
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
    redemptionConditions?: string[]
  }[]
  createdAt: string
}

export interface UpdateGamePayload {
  name?: string
  description?: string
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
// Prizes (per-prize management on an existing game)
// ---------------------------------------------------------------------------

export interface PrizeDetail {
  id: string
  gameId?: string
  name: string
  description?: string | null
  emoji?: string | null
  winRate: number
  maxTotal?: number | null
  maxPerDay?: number | null
  totalWon: number
  couponValidityDays: number
  couponActivationDelayHours: number
  redemptionConditions?: string[]
}

export interface AddPrizePayload {
  name: string
  description?: string
  emoji?: string
  winRate: number
  couponValidityDays: number
  couponActivationDelayHours: number
  maxTotal?: number
  maxPerDay?: number
  redemptionConditions?: string[]
}

export interface UpdatePrizePayload {
  name?: string
  description?: string | null
  emoji?: string | null
  winRate?: number
  couponValidityDays?: number
  couponActivationDelayHours?: number
  maxTotal?: number | null
  maxPerDay?: number | null
  redemptionConditions?: string[]
}

export async function addPrize(
  gameId: string,
  payload: AddPrizePayload,
  token?: string,
): Promise<PrizeDetail> {
  return request<PrizeDetail>(
    `/api/v1/games/${encodeURIComponent(gameId)}/prizes`,
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  )
}

export async function updatePrize(
  prizeId: string,
  payload: UpdatePrizePayload,
  token?: string,
): Promise<PrizeDetail> {
  return request<PrizeDetail>(
    `/api/v1/prizes/${encodeURIComponent(prizeId)}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    token,
  )
}

export async function deletePrize(
  prizeId: string,
  token?: string,
): Promise<void> {
  return request<void>(
    `/api/v1/prizes/${encodeURIComponent(prizeId)}`,
    { method: 'DELETE' },
    token,
  )
}

export async function resetPrize(
  prizeId: string,
  token?: string,
): Promise<PrizeDetail> {
  return request<PrizeDetail>(
    `/api/v1/prizes/${encodeURIComponent(prizeId)}/reset`,
    { method: 'POST' },
    token,
  )
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export interface CouponWithDetails {
  id: string
  code: string
  status: string
  prizeName: string
  prizeDescription: string | null
  redemptionConditions: string[]
  validFrom: string
  validUntil: string
  redeemedAt: string | null
  createdAt: string
  playerId: string | null
  playerName: string | null
  playerEmail: string | null
}

export type CouponSortField =
  | 'code'
  | 'prizeName'
  | 'status'
  | 'validFrom'
  | 'validUntil'
  | 'redeemedAt'
  | 'createdAt'
  | 'playerName'
  | 'playerEmail'

export type CouponStatusFilter = 'active' | 'redeemed' | 'expired' | 'revoked'

export interface CouponListPage {
  data: CouponWithDetails[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
  sort: { field: CouponSortField; dir: 'asc' | 'desc' }
}

export interface FetchCouponsParams {
  merchantId: string
  page?: number
  pageSize?: number
  sort?: CouponSortField
  dir?: 'asc' | 'desc'
  search?: string
  status?: CouponStatusFilter
}

// Custom fetch that returns the full envelope (data + pagination + sort).
// The shared `request()` helper only returns `json.data`, so we mirror its
// error handling here but keep the metadata.
export async function fetchCoupons(
  params: FetchCouponsParams,
  token?: string,
): Promise<CouponListPage> {
  const search = new URLSearchParams({ merchantId: params.merchantId })
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  if (params.sort) search.set('sort', params.sort)
  if (params.dir) search.set('dir', params.dir)
  if (params.search) search.set('search', params.search)
  if (params.status) search.set('status', params.status)

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15_000)

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/v1/coupons?${search.toString()}`, {
      headers,
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('TIMEOUT', 'Request timed out', 0)
    }
    throw new ApiError('NETWORK_ERROR', 'Unable to reach the API server', 0)
  } finally {
    clearTimeout(timeoutId)
  }

  const json = (await res.json()) as {
    success: boolean
    data?: CouponWithDetails[]
    pagination?: CouponListPage['pagination']
    sort?: CouponListPage['sort']
    error?: { code?: string; message?: string; details?: Record<string, unknown> }
  }

  if (!res.ok || !json.success) {
    throw new ApiError(
      json.error?.code ?? 'UNKNOWN',
      json.error?.message ?? `Request failed with status ${res.status}`,
      res.status,
      json.error?.details,
    )
  }

  return {
    data: json.data ?? [],
    pagination: json.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    sort: json.sort ?? { field: 'createdAt', dir: 'desc' },
  }
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

export interface CouponLookup {
  code: string
  status: string
  prizeName: string
  prizeDescription: string | null
  merchantName: string
  validFrom: string
  validUntil: string
  redeemedAt: string | null
}

export async function lookupCoupon(code: string): Promise<CouponLookup> {
  return request<CouponLookup>(
    `/api/v1/coupons/lookup/${encodeURIComponent(code)}`,
  )
}

export async function validateCoupon(
  code: string,
  pin: string,
): Promise<{ code: string; status: string; prizeName: string; merchantName: string; redeemedAt: string }> {
  return request<{ code: string; status: string; prizeName: string; merchantName: string; redeemedAt: string }>(
    '/api/v1/coupons/validate',
    { method: 'POST', body: JSON.stringify({ code, pin }) },
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
  points: number
  totalPlays: number
  totalWins: number
  lastSeenAt: string
  createdAt: string
}

export type PlayerSortField =
  | 'name'
  | 'email'
  | 'points'
  | 'totalPlays'
  | 'totalWins'
  | 'lastSeenAt'
  | 'createdAt'

export interface PlayerListPage {
  data: PlayerData[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
  sort: { field: PlayerSortField; dir: 'asc' | 'desc' }
  stats: { totalPlayers: number; totalPlays: number; totalWins: number }
}

export interface FetchPlayersParams {
  merchantId: string
  page?: number
  pageSize?: number
  sort?: PlayerSortField
  dir?: 'asc' | 'desc'
  search?: string
}

// Returns the full envelope (data + pagination + sort + aggregate stats).
// The shared `request()` helper only forwards `json.data`, so we mirror its
// error handling here but keep the metadata.
export async function fetchPlayers(
  params: FetchPlayersParams,
  token?: string,
): Promise<PlayerListPage> {
  const search = new URLSearchParams({ merchantId: params.merchantId })
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  if (params.sort) search.set('sort', params.sort)
  if (params.dir) search.set('dir', params.dir)
  if (params.search) search.set('search', params.search)

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15_000)

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/v1/players?${search.toString()}`, {
      headers,
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('TIMEOUT', 'Request timed out', 0)
    }
    throw new ApiError('NETWORK_ERROR', 'Unable to reach the API server', 0)
  } finally {
    clearTimeout(timeoutId)
  }

  const json = (await res.json()) as {
    success: boolean
    data?: PlayerData[]
    pagination?: PlayerListPage['pagination']
    sort?: PlayerListPage['sort']
    stats?: PlayerListPage['stats']
    error?: { code?: string; message?: string; details?: Record<string, unknown> }
  }

  if (!res.ok || !json.success) {
    throw new ApiError(
      json.error?.code ?? 'UNKNOWN',
      json.error?.message ?? `Request failed with status ${res.status}`,
      res.status,
      json.error?.details,
    )
  }

  return {
    data: json.data ?? [],
    pagination: json.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    sort: json.sort ?? { field: 'lastSeenAt', dir: 'desc' },
    stats: json.stats ?? { totalPlayers: 0, totalPlays: 0, totalWins: 0 },
  }
}

export interface PlayerRanking {
  rank: number
  id: string
  name: string | null
  email: string | null
  points: number
  totalPlays: number
  totalWins: number
  lastSeenAt: string
}

export async function fetchPlayerRanking(
  merchantId: string,
  limit = 20,
  token?: string,
): Promise<PlayerRanking[]> {
  return request<PlayerRanking[]>(
    `/api/v1/players/ranking?merchantId=${encodeURIComponent(merchantId)}&limit=${limit}`,
    {},
    token,
  )
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
