import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { getAuth } = await import('@/lib/auth')
    const { headers } = await import('next/headers')
    const auth = getAuth()
    const session = await auth.api.getSession({ headers: await headers() })

    if (session?.user) {
      return NextResponse.json({ authenticated: true, user: { name: session.user.name } })
    }
    return NextResponse.json({ authenticated: false })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}
