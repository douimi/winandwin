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
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="min-w-0 flex-1">
          <span className="block text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
            Win & Win
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="px-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Navigation</span>
        </div>
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-indigo-50 text-indigo-700 border-l-[3px] border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-[3px] border-transparent'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-base w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          )
        })}

        <div className="my-4 mx-3 border-t border-gray-200" />

        <a
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-gray-50 hover:text-gray-700 border-l-[3px] border-transparent"
        >
          <span className="text-base w-6 text-center">{'\u2190'}</span>
          <span>Dashboard</span>
        </a>
      </nav>

      {/* User card */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            signOut({ fetchOptions: { onSuccess: () => window.location.assign('/sign-in') } })
          }
          className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all duration-200"
        >
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] flex-col border-r border-gray-200 bg-white lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={() => {}}
            role="presentation"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <header className="flex h-16 items-center border-b border-gray-200 px-6 gap-3 bg-white">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-lg p-2 hover:bg-gray-100 text-gray-500 transition-colors"
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
          <h2 className="text-lg font-semibold text-gray-900">{currentPageLabel}</h2>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
