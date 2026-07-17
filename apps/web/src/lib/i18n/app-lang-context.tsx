'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { APP_TEXT, type AppText, type Lang } from './app-text'

// Shared client-side language context for auth + dashboard.
// Deliberately uses the SAME localStorage key the landing and admin surfaces
// use, so a language pick in one place propagates to every other surface.
const STORAGE_KEY = 'winandwin_landing_lang'

interface Ctx {
  lang: Lang
  txt: AppText
  setLang: (l: Lang) => void
}

const AppLangContext = createContext<Ctx | null>(null)

function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'fr'
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'fr' || v === 'en') return v as Lang
  } catch { /* ignore */ }
  return 'fr'
}

export function AppLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    const initial = readInitialLang()
    if (initial !== 'fr') setLangState(initial)
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }, [lang])

  function setLang(next: Lang) {
    setLangState(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
  }

  const value: Ctx = { lang, txt: APP_TEXT[lang], setLang }
  return <AppLangContext.Provider value={value}>{children}</AppLangContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppLangContext)
  if (!ctx) throw new Error('useApp must be used inside <AppLangProvider>')
  return ctx
}

// Same FR / EN pill toggle used elsewhere. Drop it into any topbar / header
// under an <AppLangProvider>.
export function AppLanguageToggle() {
  const { lang, setLang } = useApp()
  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold shadow-xs"
    >
      <button
        type="button"
        onClick={() => setLang('fr')}
        aria-pressed={lang === 'fr'}
        className={`rounded-full px-2.5 py-1 transition-all ${
          lang === 'fr'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={`rounded-full px-2.5 py-1 transition-all ${
          lang === 'en'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        EN
      </button>
    </div>
  )
}
