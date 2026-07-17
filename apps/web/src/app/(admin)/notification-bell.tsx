'use client'

import { Bell, Inbox, UserPlus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  fetchAdminNotificationCounts,
  type AdminNotificationCounts,
} from '@/lib/admin-api'
import { useAdmin } from './admin-lang-context'

const POLL_INTERVAL_MS = 30_000

/**
 * Admin topbar bell. Polls /notifications/counts every 30 s and shows a
 * badge with the total number of items that need attention (pending
 * sign-ups + new contact requests). Click opens a dropdown with each
 * category and a shortcut to the matching admin page.
 */
export function NotificationBell() {
  const { txt } = useAdmin()
  const [counts, setCounts] = useState<AdminNotificationCounts | null>(null)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const next = await fetchAdminNotificationCounts()
        if (!cancelled) setCounts(next)
      } catch {
        // Fail quiet — bell renders as if there's nothing to review.
        if (!cancelled) setCounts({ pendingUsers: 0, newContacts: 0, total: 0 })
      }
    }

    load()
    const id = window.setInterval(load, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const total = counts?.total ?? 0
  const pending = counts?.pendingUsers ?? 0
  const contacts = counts?.newContacts ?? 0

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={txt.notifBellTitle}
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Bell className="h-4 w-4" />
        {total > 0 && (
          <span
            className="pointer-events-none absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground shadow-sm ring-2 ring-background"
            aria-hidden
          >
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={txt.notifBellTitle}
          className="absolute right-0 top-11 z-40 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{txt.notifBellTitle}</p>
          </div>

          {total === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">{txt.notifBellEmpty}</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {pending > 0 && (
                <NotifRow
                  Icon={UserPlus}
                  iconClass="bg-primary/10 text-primary"
                  count={pending}
                  label={pending === 1 ? txt.notifBellPending : txt.notifBellPendingMany}
                  cta={txt.notifBellViewPending}
                  href="/admin/pending"
                />
              )}
              {contacts > 0 && (
                <NotifRow
                  Icon={Inbox}
                  iconClass="bg-emerald-50 text-emerald-700"
                  count={contacts}
                  label={contacts === 1 ? txt.notifBellContact : txt.notifBellContactMany}
                  cta={txt.notifBellViewContacts}
                  href="/admin/contacts"
                />
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

interface NotifRowProps {
  Icon: React.ComponentType<{ className?: string }>
  iconClass: string
  count: number
  label: string
  cta: string
  href: string
}

function NotifRow({ Icon, iconClass, count, label, cta, href }: NotifRowProps) {
  return (
    <li>
      <a
        href={href}
        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
      >
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            <span className="tabular-nums font-bold text-primary">{count}</span> {label}
          </p>
          <p className="mt-0.5 text-xs text-primary hover:underline">{cta} →</p>
        </div>
      </a>
    </li>
  )
}
