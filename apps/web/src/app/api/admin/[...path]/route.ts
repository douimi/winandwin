import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'
const ADMIN_KEY = process.env.ADMIN_API_KEY || ''

/**
 * Proxy admin API requests through Next.js so the ADMIN_API_KEY
 * stays server-side and never reaches the browser.
 *
 * /api/admin/stats → GET ${API_BASE}/api/v1/admin/stats
 * /api/admin/merchants/123 → GET ${API_BASE}/api/v1/admin/merchants/123
 */
async function proxyRequest(request: NextRequest, params: Promise<{ path: string[] }>) {
  const { path } = await params
  const apiPath = `/api/v1/admin/${path.join('/')}`
  const url = new URL(apiPath, API_BASE)

  // Forward query params
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value)
  })

  const headers: Record<string, string> = {
    'x-admin-key': ADMIN_KEY,
    'Content-Type': 'application/json',
  }

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      fetchOptions.body = await request.text()
    } catch {
      // no body
    }
  }

  const res = await fetch(url.toString(), fetchOptions)
  const body = await res.text()

  return new NextResponse(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, ctx.params)
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, ctx.params)
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, ctx.params)
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, ctx.params)
}
