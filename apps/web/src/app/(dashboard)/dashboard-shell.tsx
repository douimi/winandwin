'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from '@/lib/auth-client'

interface User {
  id: string
  name: string
  email: string
  image?: string | null
}

interface DashboardShellProps {
  user: User
  merchantName?: string
  merchantSlug?: string
  merchantTier?: string
  isAdmin?: boolean
  children: React.ReactNode
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '\uD83D\uDCCA' },
  { href: '/dashboard/games', label: 'Games', icon: '\uD83C\uDFAE' },
  { href: '/dashboard/coupons', label: 'Coupons', icon: '\uD83C\uDF9F\uFE0F' },
  { href: '/dashboard/players', label: 'Players', icon: '\uD83D\uDC65' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '\uD83D\uDCC8' },
  { href: '/dashboard/ctas', label: 'CTAs', icon: '\uD83D\uDD17' },
  { href: '/dashboard/settings', label: 'Settings', icon: '\u2699\uFE0F' },
]

export function DashboardShell({ user, merchantName, merchantSlug, merchantTier, isAdmin, children }: DashboardShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const playerUrl = merchantSlug
    ? `${process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001'}/${merchantSlug}`
    : null

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const currentPageLabel =
    navItems.find((item) => isActive(item.href))?.label || 'Dashboard'

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-4">
        <a href="/dashboard" className="block">
          <img src="/logo.png" alt="Win & Win" className="h-16 w-auto" />
        </a>
        {merchantName && (
          <p className="mt-2 text-xs text-muted-foreground truncate">{merchantName}</p>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto space-y-1 p-4">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-white shadow-md'
                  : 'text-muted-foreground hover:bg-indigo-50 hover:text-foreground'
              }`}
              style={active ? { background: 'linear-gradient(135deg, #6366f1, #06b6d4)' } : undefined}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </a>
          )
        })}

        {playerUrl && (
          <a
            href={playerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <span className="text-base">{'\uD83D\uDD17'}</span>
            View Player Page
            <svg
              className="ml-auto h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}

        {merchantTier !== 'enterprise' && (
          <a
            href="/dashboard/upgrade"
            className="mx-3 mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="text-base">{'\u2B06\uFE0F'}</span>
            Upgrade Plan
          </a>
        )}
      </nav>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        {isAdmin && (
          <a
            href="/admin"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            🛡️ Super Admin
          </a>
        )}
        <button
          type="button"
          onClick={() =>
            signOut({ fetchOptions: { onSuccess: () => window.location.assign('/sign-in') } })
          }
          className="mt-3 w-full rounded-lg border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
        >
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r lg:flex sticky top-0 h-screen" style={{ background: 'linear-gradient(180deg, #f8f7ff 0%, #ffffff 100%)', borderTop: '2px solid transparent', borderImage: 'linear-gradient(90deg, #94ffe5, #06b6d4) 1' }}>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={() => {}}
            role="presentation"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card shadow-lg">
            {sidebarContent}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <header className="flex h-14 items-center px-6 gap-3" style={{ borderBottom: '2px solid transparent', borderImage: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899) 1' }}>
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-md p-1.5 hover:bg-accent"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="text-xl font-black tracking-tight">{currentPageLabel}</h2>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
