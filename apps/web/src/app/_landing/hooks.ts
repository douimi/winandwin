'use client'

import { useEffect, useRef, useState } from 'react'

// Tracks whether the current visitor has an active session, used by the nav
// to swap "Sign in / Contact" for "My Dashboard".
//
// The nav renders the "Sign In" state optimistically (see landing-nav.tsx),
// so this hook only needs to fetch quickly enough to correct the render for
// signed-in users. Two optimisations vs. the previous fetch:
//   1. Read a client-visible marker cookie first — if it's absent we KNOW
//      the visitor isn't logged in and can skip the network round-trip
//      entirely. Cookie name matches the marker set by
//      /api/auth/check on the last successful session read.
//   2. sessionStorage cache the result for the tab — repeat page loads
//      inside the same session don't re-fetch.
const CACHE_KEY = 'winandwin_auth_state_v1'

function readCache(): boolean | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (raw === '1') return true
    if (raw === '0') return false
  } catch { /* ignore */ }
  return null
}

function writeCache(v: boolean) {
  try { sessionStorage.setItem(CACHE_KEY, v ? '1' : '0') } catch { /* ignore */ }
}

function hasSessionCookie(): boolean {
  if (typeof document === 'undefined') return false
  const c = document.cookie
  // better-auth stores session_data (non-httpOnly) alongside session_token.
  // Presence of either is a strong signal the visitor has an active session.
  return /(?:^|;\s*)better-auth\.session_data=/.test(c) ||
    /(?:^|;\s*)better-auth\.session_token=/.test(c)
}

export function useIsLoggedIn() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(() => readCache())

  useEffect(() => {
    // Fast path: no session cookie → definitely logged out. Skip the
    // network entirely. This turns the common (anonymous visitor) case
    // into a zero-latency check.
    if (!hasSessionCookie()) {
      writeCache(false)
      setLoggedIn(false)
      return
    }

    // Cookie is present — verify with the server. Result is cached for
    // subsequent renders within the same tab.
    fetch('/api/auth/check', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: { authenticated: boolean }) => {
        writeCache(data.authenticated)
        setLoggedIn(data.authenticated)
      })
      .catch(() => {
        writeCache(false)
        setLoggedIn(false)
      })
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
