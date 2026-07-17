'use client'

import { Button } from '@winandwin/ui'
import { ArrowRight, LogIn, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useIsLoggedIn } from './hooks'
import { useLanding } from './lang-context'
import { LanguageToggle } from './language-toggle'

// Sticky landing nav with the same glassmorphism vocabulary used elsewhere
// in the redesigned dashboard topbar (bg-background/70 + backdrop-blur).
export function LandingNav() {
  const { txt } = useLanding()
  const isLoggedIn = useIsLoggedIn()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href="/" className="flex items-center">
          <img src="/logo.png" alt="Win & Win" className="h-16 w-auto sm:h-20" />
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">{txt.navHow}</a>
          <a href="#games" className="transition-colors hover:text-foreground">{txt.navGames}</a>
          <a href="#features" className="transition-colors hover:text-foreground">{txt.navFeatures}</a>
          <a href="#plans" className="transition-colors hover:text-foreground">{txt.navPlans}</a>
          <a href="#contact" className="transition-colors hover:text-foreground">{txt.navContact}</a>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />

          {isLoggedIn === true ? (
            <Link href="/dashboard" prefetch>
              <Button size="sm" className="font-semibold">
                {txt.myDashboard}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              {/* Log In — clean icon pill, small footprint */}
              <Link
                href="/sign-in"
                prefetch
                className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-md sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" />
                {txt.signIn}
              </Link>

              {/* Sign Up — the primary CTA. Gradient fill, sparkle icon, subtle
                  translate + glow on hover so it reads as the star of the row. */}
              <Link
                href="/sign-up"
                prefetch
                aria-label={txt.signUp}
                className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-primary via-sky-500 to-primary bg-[length:200%_100%] px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-md ring-1 ring-primary/40 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[position:100%_0] hover:shadow-lg hover:shadow-primary/30 sm:text-sm"
              >
                {/* Diagonal shine sweep on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                <Sparkles className="relative h-3.5 w-3.5" />
                <span className="relative">{txt.signUp}</span>
                <ArrowRight className="relative h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
