'use client'

import { Button } from '@winandwin/ui'
import { useApp } from '@/lib/i18n/app-lang-context'
import { GameList } from './game-list'
import { TierLimitBanner } from './tier-limit-banner'

export default function GamesPage() {
  const { txt } = useApp()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{txt.gamesTitle}</h1>
        <a href="/dashboard/games/new">
          <Button>+ {txt.gamesNewButton}</Button>
        </a>
      </div>
      <TierLimitBanner resource="games" />
      <GameList />
    </div>
  )
}
