import { NextRequest, NextResponse } from 'next/server'

const publicPaths = ['/', '/sign-in', '/sign-up', '/forgot-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths, /validate/* routes, and API/static routes
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith('/validate') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  // Check for session cookie existence first (fast check)
  const sessionToken =
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('better-auth.session_data') ||
    request.cookies.get('__Secure-better-auth.session_token')

  if (!sessionToken) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Validate session by checking the session_data cookie which contains expiry
  const sessionData = request.cookies.get('better-auth.session_data')
  if (sessionData?.value) {
    try {
      const decoded = JSON.parse(atob(sessionData.value.split('.')[0] || '{}'))
      const expiresAt = decoded?.expiresAt || decoded?.session?.session?.expiresAt
      if (expiresAt && new Date(expiresAt) < new Date()) {
        // Session expired — clear cookies and redirect
        const signInUrl = new URL('/sign-in', request.url)
        signInUrl.searchParams.set('callbackUrl', pathname)
        const response = NextResponse.redirect(signInUrl)
        response.cookies.delete('better-auth.session_token')
        response.cookies.delete('better-auth.session_data')
        return response
      }
    } catch {
      // Can't parse — let the server-side auth handle validation
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
