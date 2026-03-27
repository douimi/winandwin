import { Button, Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { GameList } from './game-list'

export default function GamesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Games</h1>
        <a href="/dashboard/games/new">
          <Button>+ Create Game</Button>
        </a>
      </div>
      <GameList />
    </div>
  )
}
