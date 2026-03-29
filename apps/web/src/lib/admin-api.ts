const ADMIN_PROXY_BASE = '/api/admin'

export class AdminApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'AdminApiError'
  }
}

export async function adminRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  // Always go through the Next.js proxy — it adds the admin key server-side
  const proxyPath = path.replace('/api/v1/admin/', '')
  const url = `${ADMIN_PROXY_BASE}/${proxyPath}`

  let res: Response
  try {
    res = await fetch(url, { ...options, headers, cache: 'no-store' })
  } catch {
    throw new AdminApiError('NETWORK_ERROR', 'Unable to reach the API server', 0)
  }

  if (!res.ok) {
    let body: { success?: boolean; error?: { code?: string; message?: string } } | undefined
    try {
      body = await res.json()
    } catch {
      /* ignore */
    }
    throw new AdminApiError(
      body?.error?.code ?? 'UNKNOWN',
      body?.error?.message ?? `Request failed with status ${res.status}`,
      res.status,
    )
  }

  const json = await res.json()
  if (!json.success) {
    throw new AdminApiError(
      json.error?.code ?? 'UNKNOWN',
      json.error?.message ?? 'Unknown error',
      0,
    )
  }
  return json.data as T
}

// ---------------------------------------------------------------------------
// Admin API types
// ---------------------------------------------------------------------------

export interface AdminStats {
  totalMerchants: number
  totalPlayers: number
  gamesPlayedToday: number
  gamesPlayedThisWeek: number
  gamesPlayedThisMonth: number
  totalCouponsGenerated: number
  totalCouponsRedeemed: number
  revenue: number
  newMerchantsThisWeek: number
  disabledMerchants: number
  topMerchants: { id: string; name: string; plays: number }[]
  recentActivity: {
    id: string
    merchantId: string
    merchantName: string
    result: string
    playedAt: string
  }[]
}

export interface AdminMerchantRow {
  id: string
  name: string
  slug: string
  email: string
  category: string
  subscriptionTier: string
  disabled: boolean
  totalPlayers: number
  totalGamesPlayed: number
  playsThisMonth: number
  monthlyLimit: number | null
  createdAt: string
}

export interface AdminMerchantDetail {
  merchant: {
    id: string
    name: string
    slug: string
    email: string
    category: string
    phone: string | null
    subscriptionTier: string
    disabled: boolean
    createdAt: string
  }
  usage: {
    playsThisMonth: number
    monthlyLimit: number | null
    tier: string
  }
  games: {
    id: string
    name: string
    type: string
    status: string
    playsCount: number
    createdAt: string
  }[]
  coupons: {
    id: string
    code: string
    prizeName: string
    status: string
    validUntil: string
    createdAt: string
  }[]
  playerCount: number
  recentPlayers: {
    id: string
    name: string | null
    email: string | null
    totalPlays: number
    totalWins: number
    lastSeenAt: string
  }[]
  ctas: {
    id: string
    type: string
    enabled: boolean
    weight: number
  }[]
}

// ---------------------------------------------------------------------------
// Admin API functions
// ---------------------------------------------------------------------------

export function fetchAdminStats(): Promise<AdminStats> {
  return adminRequest<AdminStats>('/api/v1/admin/stats')
}

export function fetchAdminMerchants(search?: string): Promise<AdminMerchantRow[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  return adminRequest<AdminMerchantRow[]>(`/api/v1/admin/merchants${params}`)
}

export function fetchAdminMerchantDetail(id: string): Promise<AdminMerchantDetail> {
  return adminRequest<AdminMerchantDetail>(`/api/v1/admin/merchants/${encodeURIComponent(id)}`)
}

export function updateAdminMerchant(
  id: string,
  payload: { subscriptionTier?: string; disabled?: boolean },
): Promise<unknown> {
  return adminRequest(`/api/v1/admin/merchants/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function resetMerchantPlays(id: string): Promise<{ deletedCount: number }> {
  return adminRequest<{ deletedCount: number }>(
    `/api/v1/admin/merchants/${encodeURIComponent(id)}/reset-plays`,
    { method: 'POST' },
  )
}

export function deleteMerchant(id: string): Promise<{ deleted: boolean }> {
  return adminRequest<{ deleted: boolean }>(
    `/api/v1/admin/merchants/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  )
}

export function fetchAdminSettings(): Promise<{ key: string; value: unknown; updatedAt: string }[]> {
  return adminRequest<{ key: string; value: unknown; updatedAt: string }[]>('/api/v1/admin/settings')
}

export function updateAdminSetting(key: string, value: unknown): Promise<unknown> {
  return adminRequest(`/api/v1/admin/settings/${encodeURIComponent(key)}`, {
    method: 'PATCH',
    body: JSON.stringify({ value }),
  })
}
