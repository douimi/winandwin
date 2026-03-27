import { CreateGameForm } from './create-game-form'

export default function NewGamePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Create a New Game</h1>
      <CreateGameForm />
    </div>
  )
}
