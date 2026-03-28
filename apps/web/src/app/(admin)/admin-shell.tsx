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

interface AdminShellProps {
  user: User
  children: React.ReactNode
}

const navItems = [
  { href: '/admin', label: 'Overview', icon: '\uD83D\uDCCA' },
  { href: '/admin/merchants', label: 'Merchants', icon: '\uD83C\uDFEA' },
  { href: '/admin/contacts', label: 'Contacts', icon: '\uD83D\uDCEC' },
  { href: '/admin/settings', label: 'Settings', icon: '\u2699\uFE0F' },
]

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const currentPageLabel =
    navItems.find((item) => isActive(item.href))?.label || 'Admin'

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center px-6" style={{ borderBottom: '1px solid rgba(99, 102, 241, 0.15)' }}>
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-2.5 text-lg font-bold text-white truncate">
            <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent text-xl font-extrabold">
              Win & Win
            </span>
            <span className="inline-flex items-center rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 ring-1 ring-indigo-500/30">
              Admin
            </span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="px-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Navigation</span>
        </div>
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-indigo-500/10 text-indigo-300 border-l-[3px] border-indigo-400 shadow-sm shadow-indigo-500/5'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-[3px] border-transparent'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-base w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === 'Contacts' && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300">
                  {'\u2022'}
                </span>
              )}
            </a>
          )
        })}

        <div className="my-4 mx-3" style={{ borderTop: '1px solid rgba(99, 102, 241, 0.1)' }} />

        <a
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-white/5 hover:text-slate-300 border-l-[3px] border-transparent"
        >
          <span className="text-base w-6 text-center">{'\u2190'}</span>
          <span>Back to Dashboard</span>
        </a>
      </nav>

      {/* User card */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(99, 102, 241, 0.1)' }}>
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-200">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            signOut({ fetchOptions: { onSuccess: () => window.location.assign('/sign-in') } })
          }
          className="mt-3 w-full rounded-xl border border-slate-700/50 px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:border-slate-600 transition-all duration-200"
        >
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Desktop sidebar */}
      <aside
        className="hidden w-[260px] flex-col lg:flex"
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={() => {}}
            role="presentation"
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col shadow-2xl shadow-black/50"
            style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <header className="flex h-16 items-center border-b border-slate-800/50 px-6 gap-3 bg-slate-900/30 backdrop-blur-md">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-lg p-2 hover:bg-slate-800 text-slate-400 transition-colors"
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
          <h2 className="text-lg font-semibold text-slate-100">{currentPageLabel}</h2>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
