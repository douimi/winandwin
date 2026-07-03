'use client'

import { useEffect, useRef, useState } from 'react'

// Tracks whether the current visitor has an active session, used by the nav
// to swap "Sign In / Contact" for "My Dashboard".
//
// The nav renders the anon-user CTAs optimistically (see landing-nav.tsx),
// so this hook only needs to correct the render for signed-in visitors.
//
// Caching strategy: we ONLY cache the `true` state in sessionStorage.
// - When a logged-in visitor comes back to the landing (e.g. via the logo
//   link from /dashboard, or a browser back after signing in), the cached
//   `true` makes the nav paint the Dashboard button on the very first
//   render — no flash of "Sign In".
// - We never cache `false` because that was the bug in the previous
//   version: a stale `false` from an earlier anon visit would win, and
//   even after logging in, the landing would keep showing "Sign In".
// - We also always re-verify with the server in the background so that
//   if the cached `true` is stale (session expired, logged out from
//   another tab), we correct the nav.
//
// Bonus: pageshow listener catches bfcache restores (browser back / forward
// navigation), so the nav updates without a hard refresh.
const CACHE_KEY = 'winandwin_auth_state_v1'

function readCache(): boolean | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(CACHE_KEY) === '1' ? true : null
  } catch {
    return null
  }
}

function writeCache(loggedIn: boolean) {
  try {
    if (loggedIn) sessionStorage.setItem(CACHE_KEY, '1')
    else sessionStorage.removeItem(CACHE_KEY)
  } catch { /* ignore */ }
}

export function useIsLoggedIn() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(() => readCache())

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const res = await fetch('/api/auth/check', { credentials: 'include' })
        const data = (await res.json()) as { authenticated: boolean }
        if (cancelled) return
        writeCache(data.authenticated)
        setLoggedIn(data.authenticated)
      } catch {
        if (cancelled) return
        writeCache(false)
        setLoggedIn(false)
      }
    }

    check()

    // Re-check when the page is restored from bfcache (browser back /
    // forward after signing in on another route).
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) check()
    }
    window.addEventListener('pageshow', onPageShow)

    return () => {
      cancelled = true
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [])

  return loggedIn
}

// IntersectionObserver-based fade-in on scroll. Returns a ref to attach to
// the section root and a className that flips between the hidden and shown
// states. Kept subtle on purpose — no big translate, just opacity + 8px.
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return {
    ref,
    className: visible
      ? 'transition-all duration-700 ease-out opacity-100 translate-y-0'
      : 'opacity-0 translate-y-2 transition-all duration-700 ease-out',
  }
}
