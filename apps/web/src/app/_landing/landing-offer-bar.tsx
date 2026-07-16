'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLanding } from './lang-context'
import { whatsAppUrl } from './text'

/**
 * Thin urgency bar rendered above the sticky nav. Dismissable — the
 * chosen state is kept in localStorage so we don't badger the visitor on
 * every page load once they've dismissed it.
 */
const DISMISS_KEY = 'winandwin_offer_bar_dismissed_v1'

export function LandingOfferBar() {
  const { txt, lang } = useLanding()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return
    } catch { /* ignore */ }
    setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div className="relative z-40 border-b border-primary/20 bg-primary/95 text-primary-foreground backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-center text-xs font-medium sm:px-6 sm:text-sm">
        <span className="hidden sm:inline">{txt.offerBar}</span>
        <span className="sm:hidden">{txt.offerBar.replace(/^[^\s]+\s/, '')}</span>
        <a
          href={whatsAppUrl(lang)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/10 px-3 py-0.5 text-xs font-semibold ring-1 ring-primary-foreground/20 backdrop-blur-sm transition-all hover:bg-primary-foreground/20"
        >
          {txt.offerBarCta} →
        </a>
        <button
          type="button"
          onClick={() => {
            setVisible(false)
            try { sessionStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
          }}
          aria-label="Dismiss"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground sm:right-4"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
