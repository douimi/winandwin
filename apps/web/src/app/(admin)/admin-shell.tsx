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
  { href: '/admin', label: 'Overview', icon: 'O' },
  { href: '/admin/merchants', label: 'Merchants', icon: 'M' },
  { href: '/admin/settings', label: 'Settings', icon: 'S' },
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
      <div className="flex h-14 items-center border-b border-purple-800/30 px-6 bg-purple-950/50">
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-lg font-bold text-white truncate">
            Win & Win
            <span className="inline-flex items-center rounded-md bg-purple-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              Admin
            </span>
          </span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-purple-600/20 text-purple-300 border-l-2 border-purple-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-800 text-xs font-bold text-purple-300">
                {item.icon}
              </span>
              {item.label}
            </a>
          )
        })}

        <div className="my-4 border-t border-gray-800" />

        <a
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-800 text-xs font-bold text-gray-400">
            &larr;
          </span>
          Merchant Dashboard
        </a>
      </nav>
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-xs font-medium text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-200">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            signOut({ fetchOptions: { onSuccess: () => window.location.assign('/sign-in') } })
          }
          className="mt-3 w-full rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800"
        >
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-gray-800 bg-gray-900 lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={() => {}}
            role="presentation"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 shadow-lg">
            {sidebarContent}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <header className="flex h-14 items-center border-b border-gray-800 px-6 gap-3 bg-gray-900">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-md p-1.5 hover:bg-gray-800 text-gray-400"
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
          <h2 className="text-lg font-semibold text-gray-100">{currentPageLabel}</h2>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
