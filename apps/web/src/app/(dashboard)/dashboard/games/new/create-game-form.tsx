'use client'

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@winandwin/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createGame } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'

const GAME_TYPES = [
  { value: 'wheel', label: 'Wheel of Fortune', icon: '🎡', description: 'Spin a wheel with configurable segments' },
  { value: 'slots', label: 'Slot Machine', icon: '🎰', description: '3-reel slot machine with matching symbols' },
  { value: 'mystery_box', label: 'Mystery Box', icon: '📦', description: 'Pick a box to reveal your prize' },
] as const

interface Prize {
  name: string
  emoji: string
  winRate: number
  couponValidityDays: number
  maxTotal: number | null
  maxPerDay: number | null
}

export function CreateGameForm() {
  const router = useRouter()
  const merchantId = useMerchantId()
  const [gameType, setGameType] = useState<string>('wheel')
  const [gameName, setGameName] = useState('')
  const [gameDescription, setGameDescription] = useState('')
  const [globalWinRate, setGlobalWinRate] = useState(30)
  const [prizes, setPrizes] = useState<Prize[]>([
    { name: '', emoji: '🎁', winRate: 50, couponValidityDays: 7, maxTotal: null, maxPerDay: null },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addPrize() {
    setPrizes((prev) => [...prev, { name: '', emoji: '🎁', winRate: 50, couponValidityDays: 7, maxTotal: null, maxPerDay: null }])
  }

  function removePrize(index: number) {
    setPrizes((prev) => prev.filter((_, i) => i !== index))
  }

  function updatePrize(index: number, field: keyof Prize, value: string | number) {
    setPrizes((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await createGame({
        merchantId,
        type: gameType,
        name: gameName,
        description: gameDescription || undefined,
        config: {
          prizes: prizes.map((p) => ({
            name: p.name,
            emoji: p.emoji,
            winRate: p.winRate,
            couponValidityDays: p.couponValidityDays,
            ...(p.maxTotal !== null ? { maxTotal: p.maxTotal } : {}),
            ...(p.maxPerDay !== null ? { maxPerDay: p.maxPerDay } : {}),
          })),
          globalWinRate,
        },
      })
      router.push('/dashboard/games')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Game Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Game Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {GAME_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setGameType(type.value)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  gameType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-2xl">{type.icon}</div>
                <div className="mt-1 text-sm font-semibold">{type.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{type.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Name & Win Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gameName">Game Name</Label>
            <Input
              id="gameName"
              placeholder="e.g., Weekend Spin, Lucky Draw"
              value={gameName}
              onChange={(e) => setGameName((e.target as HTMLInputElement).value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gameDescription">Game Description</Label>
            <textarea
              id="gameDescription"
              placeholder="Describe your game to players (e.g., 'Spin the wheel and win a free dessert!')"
              value={gameDescription}
              onChange={(e) => setGameDescription((e.target as HTMLTextAreaElement).value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="winRate">
              Global Win Rate: <span className="font-bold">{globalWinRate}%</span>
            </Label>
            <input
              id="winRate"
              type="range"
              min={1}
              max={100}
              value={globalWinRate}
              onChange={(e) => setGlobalWinRate(Number((e.target as HTMLInputElement).value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {globalWinRate}% of plays will result in a win
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Prizes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Prizes</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addPrize}>
            + Add Prize
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {prizes.map((prize, index) => (
            <div key={index} className="flex gap-3 rounded-lg border p-3">
              <div className="flex-1 space-y-3">
                <div className="flex gap-3">
                  <div className="w-20">
                    <Label>Emoji</Label>
                    <Input
                      value={prize.emoji}
                      onChange={(e) => updatePrize(index, 'emoji', (e.target as HTMLInputElement).value)}
                      className="text-center text-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Prize Name</Label>
                    <Input
                      placeholder="Free Dessert"
                      value={prize.name}
                      onChange={(e) => updatePrize(index, 'name', (e.target as HTMLInputElement).value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label>Win Weight: {prize.winRate}</Label>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={prize.winRate}
                      onChange={(e) => updatePrize(index, 'winRate', Number((e.target as HTMLInputElement).value))}
                      className="w-full"
                    />
                  </div>
                  <div className="w-32">
                    <Label>Valid (days)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={prize.couponValidityDays}
                      onChange={(e) =>
                        updatePrize(index, 'couponValidityDays', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label>Max Total Wins</Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Unlimited"
                      value={prize.maxTotal ?? ''}
                      onChange={(e) => {
                        const val = (e.target as HTMLInputElement).value
                        updatePrize(index, 'maxTotal', val ? Number(val) : (null as unknown as number))
                      }}
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Leave empty for unlimited</p>
                  </div>
                  <div className="flex-1">
                    <Label>Max Per Day</Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Unlimited"
                      value={prize.maxPerDay ?? ''}
                      onChange={(e) => {
                        const val = (e.target as HTMLInputElement).value
                        updatePrize(index, 'maxPerDay', val ? Number(val) : (null as unknown as number))
                      }}
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Leave empty for unlimited</p>
                  </div>
                </div>
              </div>
              {prizes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePrize(index)}
                  className="self-start p-1 text-muted-foreground hover:text-destructive"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Game'}
      </Button>
    </form>
  )
}
