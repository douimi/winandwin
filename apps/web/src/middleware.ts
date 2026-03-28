import { NextRequest, NextResponse } from 'next/server'

const publicPaths = ['/', '/sign-in', '/sign-up', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths, /validate/* routes, and API/static routes
  if (publicPaths.includes(pathname) || pathname.startsWith('/validate') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionToken = request.cookies.get('better-auth.session_token')

  if (!sessionToken) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
