'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { LANDING_TEXT, type Lang, type LandingText } from './text'

const STORAGE_KEY = 'winandwin_landing_lang'

interface Ctx {
  lang: Lang
  txt: LandingText
  setLang: (l: Lang) => void
}

const LangContext = createContext<Ctx | null>(null)

// Reads a persisted language choice from localStorage, then from the
// `?lang=fr|en` URL param (allows shareable links pinned to a language).
// Default = French — the primary market.
function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'fr'
  try {
    const url = new URL(window.location.href)
    const q = url.searchParams.get('lang')
    if (q === 'fr' || q === 'en') return q
  } catch { /* ignore */ }
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'fr' || v === 'en') return v as Lang
  } catch { /* ignore */ }
  return 'fr'
}

export function LandingLangProvider({ children }: { children: ReactNode }) {
  // SSR always renders French (the primary), then the effect below flips
  // to the stored/URL-requested language on the client. The transition is
  // instantaneous — happens before the user notices anything.
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    const initial = readInitialLang()
    if (initial !== 'fr') setLangState(initial)
  }, [])

  useEffect(() => {
    // Keep <html lang="…"> in sync for accessibility + SEO.
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }, [lang])

  function setLang(next: Lang) {
    setLangState(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
  }

  const value: Ctx = { lang, txt: LANDING_TEXT[lang], setLang }
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLanding() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLanding must be used inside <LandingLangProvider>')
  return ctx
}
