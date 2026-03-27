import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { getAuth } = await import('@/lib/auth')
  const { toNextJsHandler } = await import('better-auth/next-js')
  const handler = toNextJsHandler(getAuth())
  return handler.GET!(request)
}

export async function POST(request: NextRequest) {
  const { getAuth } = await import('@/lib/auth')
  const { toNextJsHandler } = await import('better-auth/next-js')
  const handler = toNextJsHandler(getAuth())
  return handler.POST!(request)
}
