'use client'

import { useLanding } from './lang-context'

/**
 * FR / EN pill toggle rendered inside the landing nav. Two labels with a
 * sliding indicator behind the active one. Clicking swaps the language
 * immediately — the entire landing re-renders via context.
 */
export function LanguageToggle() {
  const { lang, setLang } = useLanding()

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
