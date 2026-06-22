'use client'

import { useEffect, useRef, useState } from 'react'

// Tracks whether the current visitor has an active session, used by the nav
// to swap "Sign in / Contact" for "My Dashboard".
export function useIsLoggedIn() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null) // null = loading
  useEffect(() => {
    fetch('/api/auth/check')
      .then((r) => r.json())
      .then((data: { authenticated: boolean }) => setLoggedIn(data.authenticated))
      .catch(() => setLoggedIn(false))
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
