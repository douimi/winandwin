'use client'

import { Button } from '@winandwin/ui'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useIsLoggedIn } from './hooks'
import type { LandingText } from './text'

interface Props {
  txt: LandingText
}

// Sticky landing nav with the same glassmorphism vocabulary used elsewhere
// in the redesigned dashboard topbar (bg-background/70 + backdrop-blur).
export function LandingNav({ txt }: Props) {
  const isLoggedIn = useIsLoggedIn()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="/" className="flex items-center">
          <img src="/logo.png" alt="Win & Win" className="h-12 w-auto sm:h-14" />
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">{txt.navHow}</a>
          <a href="#games" className="transition-colors hover:text-foreground">{txt.navGames}</a>
          <a href="#features" className="transition-colors hover:text-foreground">{txt.navFeatures}</a>
          <a href="#plans" className="transition-colors hover:text-foreground">{txt.navPlans}</a>
          <a href="#contact" className="transition-colors hover:text-foreground">{txt.navContact}</a>
        </nav>

        {/*
          Optimistic render: assume the visitor is a NEW USER (Sign In +
          Contact) and paint those buttons immediately. If the async auth
          check later resolves to "logged in", swap to the Dashboard CTA
          in place. Previously this whole block was gated on
          `isLoggedIn === null` and rendered an animate-pulse skeleton
          until /api/auth/check finished — that fetch hits a Node cold
          start + a DB round-trip on the marketing page, which is what
          the merchant was seeing as the slow "Sign In" button.
        */}
        <div className="flex shrink-0 items-center gap-2" style={{ minWidth: 140 }}>
          {isLoggedIn === true ? (
            <Link href="/dashboard" prefetch>
              <Button className="font-semibold">
                {txt.myDashboard}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in" prefetch>
                <Button variant="ghost" size="sm">
                  {txt.signIn}
                </Button>
              </Link>
              <a href="#contact">
                <Button size="sm" className="font-semibold">
                  {txt.contactUs}
                </Button>
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
