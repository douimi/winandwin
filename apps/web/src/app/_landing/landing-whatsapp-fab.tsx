'use client'

import { MessageCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLanding } from './lang-context'
import { WHATSAPP_DISPLAY, whatsAppUrl } from './text'

/**
 * Floating WhatsApp "action button" pinned to the bottom-right of the
 * landing page. Common pattern on MA/FR service sites — prospects can
 * reach out at any point in the scroll without hunting for the contact
 * section.
 *
 * A tiny label bubble ("Une question ?") appears next to the button
 * after 3 seconds on first load to signal it's clickable, then can be
 * dismissed by the visitor.
 */
export function LandingWhatsAppFab() {
  const { txt, lang } = useLanding()
  const [showBubble, setShowBubble] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem('winandwin_wa_bubble_dismissed') === '1') {
        setDismissed(true)
        return
      }
    } catch { /* ignore */ }

    const t = setTimeout(() => setShowBubble(true), 3000)
    return () => clearTimeout(t)
  }, [])

  function dismissBubble() {
    setShowBubble(false)
    setDismissed(true)
    try {
      sessionStorage.setItem('winandwin_wa_bubble_dismissed', '1')
    } catch { /* ignore */ }
  }

  const bubbleTitle = lang === 'fr' ? 'Une question ?' : 'Any question?'
  const bubbleSub = lang === 'fr' ? 'Écrivez-nous sur WhatsApp' : 'Message us on WhatsApp'

  return (
    <div
      className="fixed bottom-5 right-5 z-40 flex items-end gap-3 sm:bottom-8 sm:right-8"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      {showBubble && !dismissed && (
        <div className="relative animate-[fadeIn_0.3s_ease-out] rounded-2xl border border-emerald-200 bg-white px-4 py-3 pr-8 shadow-lg">
          <button
            type="button"
            onClick={dismissBubble}
            aria-label="Fermer"
            className="absolute right-1.5 top-1.5 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="text-sm font-semibold text-slate-900">{bubbleTitle}</p>
          <p className="text-xs text-slate-500">{bubbleSub}</p>
          <div className="absolute -right-1.5 bottom-4 h-3 w-3 rotate-45 border-b border-r border-emerald-200 bg-white" />
        </div>
      )}

      <a
        href={whatsAppUrl(lang)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Contact Win & Win on WhatsApp — ${WHATSAPP_DISPLAY}`}
        title={`WhatsApp — ${WHATSAPP_DISPLAY}`}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl transition-all hover:scale-110 hover:bg-emerald-600 hover:shadow-emerald-500/40 active:scale-95"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-emerald-500 opacity-60"
          style={{
            animation: 'wa-fab-pulse 2.4s ease-out infinite',
          }}
        />
        <MessageCircle className="relative h-6 w-6" fill="currentColor" strokeWidth={0} />
      </a>

      <style>{`
        @keyframes wa-fab-pulse {
          0%   { transform: scale(1);    opacity: 0.5; }
          70%  { transform: scale(1.5);  opacity: 0;   }
          100% { transform: scale(1.5);  opacity: 0;   }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  )
}
