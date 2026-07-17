'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ADMIN_TEXT, type AdminText, type Lang } from './admin-text'

// Same storage key as the landing page so a merchant who set the site to
// English on the marketing side lands in an English admin, and vice versa.
const STORAGE_KEY = 'winandwin_landing_lang'

interface Ctx {
  lang: Lang
  txt: AdminText
  setLang: (l: Lang) => void
}

const AdminLangContext = createContext<Ctx | null>(null)

function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'fr'
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'fr' || v === 'en') return v as Lang
  } catch { /* ignore */ }
  return 'fr'
}

export function AdminLangProvider({ children }: { children: ReactNode }) {
  // SSR renders French (the default); the effect flips to the stored
  // language on mount. The transition is instantaneous.
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

  const value: Ctx = { lang, txt: ADMIN_TEXT[lang], setLang }
  return <AdminLangContext.Provider value={value}>{children}</AdminLangContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminLangContext)
  if (!ctx) throw new Error('useAdmin must be used inside <AdminLangProvider>')
  return ctx
}

// FR / EN pill toggle for the admin top bar. Same visual grammar as the
// landing LanguageToggle — kept as a separate component so admin can evolve
// independently.
export function AdminLanguageToggle() {
  const { lang, setLang } = useAdmin()
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
