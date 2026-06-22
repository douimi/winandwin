'use client'

import { usePathname } from 'next/navigation'
import { useState, type ComponentType, type SVGProps } from 'react'
import {
  ArrowUpRight,
  BarChart3,
  Gamepad2,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Ticket,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@winandwin/ui'
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

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

interface NavItem {
  href: string
  label: string
  Icon: IconComponent
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/dashboard/games', label: 'Games', Icon: Gamepad2 },
  { href: '/dashboard/coupons', label: 'Coupons', Icon: Ticket },
  { href: '/dashboard/players', label: 'Players', Icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', Icon: BarChart3 },
  { href: '/dashboard/ctas', label: 'CTAs', Icon: Link2 },
  { href: '/dashboard/settings', label: 'Settings', Icon: Settings },
]

const TIER_LABEL: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export function DashboardShell({
  user,
  merchantName,
  merchantSlug,
  merchantTier,
  isAdmin,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const playerUrl = merchantSlug
    ? `${process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001'}/${merchantSlug}`
    : null

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const currentPageLabel = navItems.find((item) => isActive(item.href))?.label || 'Dashboard'
  const userInitial = user.name?.charAt(0).toUpperCase() || '?'
  const showUpgradeCta = merchantTier && merchantTier !== 'enterprise'

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="border-b border-border px-5 py-5">
        <a href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="Win & Win" className="h-9 w-auto" />
          <span className="sr-only">winandwin.club</span>
        </a>
        {merchantName && (
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="truncate text-xs font-medium text-foreground/80">{merchantName}</p>
            {merchantTier && (
              <span className="inline-flex shrink-0 items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                {TIER_LABEL[merchantTier] ?? merchantTier}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Primary nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.Icon
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
              <span className="truncate">{item.label}</span>
            </a>
          )
        })}

        {/* Secondary utility links */}
        <div className="mt-6 space-y-1 border-t border-border pt-4">
          {playerUrl && (
            <a
              href={playerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-accent-foreground" />
              <span className="truncate">Open Player Page</span>
            </a>
          )}

          {showUpgradeCta && (
            <a
              href="/dashboard/upgrade"
              className="mt-2 flex items-center gap-3 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background shadow-sm transition-all hover:bg-foreground/90 hover:shadow-md"
              onClick={() => setSidebarOpen(false)}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>Upgrade Plan</span>
            </a>
          )}
        </div>
      </nav>

      {/* User block */}
      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {isAdmin && (
          <a
            href="/admin"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            <Shield className="h-3.5 w-3.5" />
            Super Admin
          </a>
        )}

        <button
          type="button"
          onClick={() =>
            signOut({ fetchOptions: { onSuccess: () => window.location.assign('/sign-in') } })
          }
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar — clean white surface, sky-blue active state */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity"
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
        {/* Sticky topbar with subtle glass */}
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
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {merchantName ?? 'Workspace'}
            </p>
            <h2 className="truncate text-lg font-semibold leading-tight text-foreground">
              {currentPageLabel}
            </h2>
          </div>

          {playerUrl && (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <a href={playerUrl} target="_blank" rel="noopener noreferrer">
                <ArrowUpRight className="h-4 w-4" />
                View Player Page
              </a>
            </Button>
          )}
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
