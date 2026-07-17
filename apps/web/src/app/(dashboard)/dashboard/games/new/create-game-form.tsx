'use client'

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@winandwin/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createGame } from '@/lib/api'
import { useMerchantId, useMerchantTier } from '@/lib/merchant-context'
import { useApp } from '@/lib/i18n/app-lang-context'
import { hasFeature } from '@/lib/tier-features'

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
  couponActivationDelayHours: number
  maxTotal: number | null
  maxPerDay: number | null
  conditionsEnabled: boolean
  redemptionConditions: [string, string, string]
}

const EXPIRATION_PRESETS: { label: string; days: number }[] = [
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
  { label: '2 months', days: 60 },
  { label: '3 months', days: 90 },
  { label: '6 months', days: 180 },
  { label: '1 year', days: 365 },
]

const ACTIVATION_PRESETS: { label: string; hours: number }[] = [
  { label: 'Immediately', hours: 0 },
  { label: '1 hour later', hours: 1 },
  { label: 'The next day', hours: 24 },
  { label: '2 days later', hours: 48 },
  { label: '3 days later', hours: 72 },
]

function makeEmptyPrize(): Prize {
  return {
    name: '',
    emoji: '🎁',
    winRate: 50,
    couponValidityDays: 30,
    couponActivationDelayHours: 24,
    maxTotal: null,
    maxPerDay: null,
    conditionsEnabled: false,
    redemptionConditions: ['', '', ''],
  }
}

export function CreateGameForm() {
  const { txt, lang } = useApp()
  const router = useRouter()
  const merchantId = useMerchantId()
  const tier = useMerchantTier()
  const [gameType, setGameType] = useState<string>('wheel')
  const [gameName, setGameName] = useState('')
  const [gameDescription, setGameDescription] = useState('')
  const [globalWinRate, setGlobalWinRate] = useState(30)
  const [prizes, setPrizes] = useState<Prize[]>([makeEmptyPrize()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addPrize() {
    setPrizes((prev) => [...prev, makeEmptyPrize()])
  }

  function removePrize(index: number) {
    setPrizes((prev) => prev.filter((_, i) => i !== index))
  }

  function updatePrize<K extends keyof Prize>(index: number, field: K, value: Prize[K]) {
    setPrizes((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    )
  }

  function updateCondition(prizeIndex: number, conditionIndex: 0 | 1 | 2, value: string) {
    setPrizes((prev) =>
      prev.map((p, i) => {
        if (i !== prizeIndex) return p
        const next: [string, string, string] = [...p.redemptionConditions] as [string, string, string]
        next[conditionIndex] = value
        return { ...p, redemptionConditions: next }
      }),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    // Validate: if conditions are enabled, the first condition is required
    for (const [i, p] of prizes.entries()) {
      if (p.conditionsEnabled && !p.redemptionConditions[0].trim()) {
        setError(`Prize #${i + 1}: enter at least one redemption condition or turn the toggle off.`)
        setSubmitting(false)
        return
      }
    }

    try {
      await createGame({
        merchantId,
        type: gameType,
        name: gameName,
        description: gameDescription || undefined,
        config: {
          prizes: prizes.map((p) => {
            const conditions = p.conditionsEnabled
              ? p.redemptionConditions.map((c) => c.trim()).filter((c) => c.length > 0)
              : []
            return {
              name: p.name,
              emoji: p.emoji,
              winRate: p.winRate,
              couponValidityDays: p.couponValidityDays,
              couponActivationDelayHours: p.couponActivationDelayHours,
              redemptionConditions: conditions,
              ...(p.maxTotal !== null ? { maxTotal: p.maxTotal } : {}),
              ...(p.maxPerDay !== null ? { maxPerDay: p.maxPerDay } : {}),
            }
          }),
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
          <CardTitle>{lang === 'fr' ? 'Type de jeu' : 'Game Type'}</CardTitle>
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
          <CardTitle>{lang === 'fr' ? 'Configuration' : 'Configuration'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gameName">{txt.gameNewNameLabel}</Label>
            <Input
              id="gameName"
              placeholder={txt.gameNewNamePlaceholder}
              value={gameName}
              onChange={(e) => setGameName((e.target as HTMLInputElement).value)}
              required
            />
          </div>
          <div className="relative space-y-2">
            <Label htmlFor="gameDescription">Game Description</Label>
            <textarea
              id="gameDescription"
              placeholder="Describe your game to players (e.g., 'Spin the wheel and win a free dessert!')"
              value={gameDescription}
              onChange={(e) => setGameDescription((e.target as HTMLTextAreaElement).value)}
              rows={3}
              disabled={!hasFeature(tier, 'game.description')}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            />
            {!hasFeature(tier, 'game.description') && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60">
                <a href="/dashboard/upgrade" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  {'🔒'} Pro feature - Upgrade to unlock
                </a>
              </div>
            )}
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
          <CardTitle>{lang === 'fr' ? 'Prix' : 'Prizes'}</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addPrize}>
            + {txt.gameNewAddPrize}
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
                <div>
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

                {/* Prize expiration delay */}
                <div className="space-y-1">
                  <Label htmlFor={`expiration-${index}`}>Prize expiration delay</Label>
                  <select
                    id={`expiration-${index}`}
                    value={prize.couponValidityDays}
                    onChange={(e) =>
                      updatePrize(index, 'couponValidityDays', Number((e.target as HTMLSelectElement).value))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {EXPIRATION_PRESETS.map((opt) => (
                      <option key={opt.days} value={opt.days}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    We will remind your customers as the prize expiration approaches
                  </p>
                </div>

                {/* Prize voucher redeemable from */}
                <div className="space-y-1">
                  <Label htmlFor={`activation-${index}`}>Prize voucher redeemable from</Label>
                  <select
                    id={`activation-${index}`}
                    value={prize.couponActivationDelayHours}
                    onChange={(e) =>
                      updatePrize(index, 'couponActivationDelayHours', Number((e.target as HTMLSelectElement).value))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {ACTIVATION_PRESETS.map((opt) => (
                      <option key={opt.hours} value={opt.hours}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prize redeemable under conditions */}
                <div className="space-y-2 rounded-md border border-dashed p-3">
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">Prize redeemable under conditions</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prize.conditionsEnabled}
                      onClick={() => updatePrize(index, 'conditionsEnabled', !prize.conditionsEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        prize.conditionsEnabled ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          prize.conditionsEnabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>

                  {prize.conditionsEnabled && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Redemption conditions</p>
                      <Input
                        placeholder="e.g., Sous réserve de consommation"
                        value={prize.redemptionConditions[0]}
                        onChange={(e) =>
                          updateCondition(index, 0, (e.target as HTMLInputElement).value)
                        }
                        maxLength={200}
                      />
                      <Input
                        placeholder="Redemption condition 2 (optional)"
                        value={prize.redemptionConditions[1]}
                        onChange={(e) =>
                          updateCondition(index, 1, (e.target as HTMLInputElement).value)
                        }
                        maxLength={200}
                      />
                      <Input
                        placeholder="Redemption condition 3 (optional)"
                        value={prize.redemptionConditions[2]}
                        onChange={(e) =>
                          updateCondition(index, 2, (e.target as HTMLInputElement).value)
                        }
                        maxLength={200}
                      />
                    </div>
                  )}
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
        {submitting ? txt.gameNewSubmitting : txt.gameNewSubmit}
      </Button>
    </form>
  )
}
