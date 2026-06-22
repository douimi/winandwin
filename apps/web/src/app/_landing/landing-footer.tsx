'use client'

import { Heart } from 'lucide-react'
import type { LandingText } from './text'

interface Props {
  txt: LandingText
}

export function LandingFooter({ txt }: Props) {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="text-xl font-bold tracking-tight text-foreground">winandwin.club</span>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">
              {txt.terms}
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              {txt.privacy}
            </a>
            <a href="#contact" className="transition-colors hover:text-foreground">
              {txt.contact}
            </a>
          </div>

          <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            {txt.madeWith}
            <Heart className="h-3.5 w-3.5 fill-rose-500 stroke-rose-500" />
            {txt.inMorocco}
          </p>

          <p className="text-xs text-muted-foreground/70">{txt.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
