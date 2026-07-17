'use client'

import { usePathname } from 'next/navigation'
import { useState, type ComponentType, type SVGProps } from 'react'
import {
  ArrowLeft,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Store,
  UserCheck,
  X,
} from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { AdminLanguageToggle, useAdmin } from './admin-lang-context'
import { NotificationBell } from './notification-bell'

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

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

interface NavItem {
  href: string
  labelKey:
    | 'shellNavOverview'
    | 'shellNavMerchants'
    | 'shellNavPending'
    | 'shellNavContacts'
    | 'shellNavSettings'
  Icon: IconComponent
}

const navItems: NavItem[] = [
  { href: '/admin', labelKey: 'shellNavOverview', Icon: LayoutDashboard },
  { href: '/admin/merchants', labelKey: 'shellNavMerchants', Icon: Store },
  { href: '/admin/pending', labelKey: 'shellNavPending', Icon: UserCheck },
  { href: '/admin/contacts', labelKey: 'shellNavContacts', Icon: Inbox },
  { href: '/admin/settings', labelKey: 'shellNavSettings', Icon: Settings },
]

export function AdminShell({ user, children }: AdminShellProps) {
  const { txt } = useAdmin()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const currentPageLabel = navItems.find((item) => isActive(item.href))
  const currentPageText = currentPageLabel ? txt[currentPageLabel.labelKey] : txt.shellSuperAdminLabel
  const userInitial = user.name?.charAt(0).toUpperCase() || '?'

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="border-b border-border px-5 py-5">
        <a href="/admin" className="flex items-center gap-2">
          <img src="/logo.png" alt={txt.shellBrand} className="h-20 w-auto" />
          <span className="sr-only">winandwin.club Admin</span>
        </a>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
          <Shield className="h-3 w-3" />
          {txt.shellSuperAdmin}
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {txt.shellSectionNavigation}
        </p>
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.Icon
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                }`}
              />
              <span className="truncate">{txt[item.labelKey]}</span>
            </a>
          )
        })}

        <div className="mt-6 border-t border-border pt-4">
          <a
            href="/dashboard"
            className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-accent-foreground" />
            {txt.shellBackToDashboard}
          </a>
        </div>
      </nav>

      {/* User block */}
      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            signOut({ fetchOptions: { onSuccess: () => window.location.assign('/sign-in') } })
          }
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          {txt.shellSignOut}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={() => {}}
            role="presentation"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card shadow-2xl">
            <div className="flex h-14 items-center justify-end border-b border-border px-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{sidebarContent}</div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-md backdrop-saturate-150 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{txt.shellSuperAdminLabel}</p>
            <h2 className="truncate text-lg font-semibold leading-tight text-foreground">{currentPageText}</h2>
          </div>
          <NotificationBell />
          <AdminLanguageToggle />
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
