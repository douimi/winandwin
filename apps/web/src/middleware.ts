import { NextRequest, NextResponse } from 'next/server'

// Only the authenticated surfaces need a session. Everything else — the
// landing page, city-specific landings, legal pages (privacy, terms,
// confidentiality), auth pages, validate, static assets — is public and
// must never be gated. Guarding by a *deny*list (rather than an ever-
// growing allowlist) means new marketing pages ship without ever having
// to touch this file again.
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/onboarding']

function requiresAuth(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!requiresAuth(pathname)) {
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
