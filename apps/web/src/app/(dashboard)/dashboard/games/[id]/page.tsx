'use client'

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@winandwin/ui'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  fetchGame,
  updateGame,
  deleteGame,
  type GameDetail,
  type UpdateGamePayload,
} from '@/lib/api'

const GAME_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  wheel: { label: 'Wheel of Fortune', icon: '🎡' },
  slots: { label: 'Slot Machine', icon: '🎰' },
  mystery_box: { label: 'Mystery Box', icon: '📦' },
}

const STATUS_OPTIONS = ['draft', 'active', 'paused', 'ended'] as const

export default function GameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string

  const [game, setGame] = useState<GameDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Editable fields
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [globalWinRate, setGlobalWinRate] = useState(30)

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!gameId) return

    let cancelled = false

    async function load() {
      try {
        const data = await fetchGame(gameId)
        if (!cancelled) {
          setGame(data)
          setName(data.name)
          setStatus(data.status)
          setGlobalWinRate(
            Math.round(Number(data.globalWinRate) || 30),
          )
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load game')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [gameId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const payload: UpdateGamePayload = {
        name,
        status,
        globalWinRate,
      }
      await updateGame(gameId, payload)
      setSaveSuccess(true)
      // Update local game state to reflect changes
      setGame((prev) => (prev ? { ...prev, name, status, globalWinRate: String(globalWinRate) } : prev))
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteGame(gameId)
      router.push('/dashboard/games')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete game')
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <a href="/dashboard/games" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to Games
        </a>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading game...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <a href="/dashboard/games" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to Games
        </a>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive">{error || 'Game not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const gameType = GAME_TYPE_LABELS[game.type] || { label: game.type, icon: '🎲' }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <a href="/dashboard/games" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to Games
        </a>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-3xl">{gameType.icon}</span>
        <div>
          <h1 className="text-2xl font-bold">{game.name}</h1>
          <p className="text-sm text-muted-foreground">{gameType.label}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Configuration */}
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
                value={name}
                onChange={(e) => setName((e.target as HTMLInputElement).value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                ))}
              </select>
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

        {/* Prizes (read-only list from API) */}
        <Card>
          <CardHeader>
            <CardTitle>Prizes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {game.prizes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No prizes configured.</p>
            ) : (
              game.prizes.map((prize) => (
                <div key={prize.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{prize.emoji || '🎁'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{prize.name}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                        <span>Win weight: {prize.winRate}</span>
                        <span>Valid: {prize.couponValidityDays}d</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${prize.totalWon > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      Won: {prize.totalWon}{prize.maxTotal != null ? ` / ${prize.maxTotal}` : ''}
                    </span>
                    {prize.maxTotal != null && (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${prize.totalWon >= prize.maxTotal ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                        {prize.totalWon >= prize.maxTotal ? '🚫 Limit reached' : `${prize.maxTotal - prize.totalWon} remaining`}
                      </span>
                    )}
                    {prize.maxPerDay != null && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Max {prize.maxPerDay}/day
                      </span>
                    )}
                    {prize.maxTotal == null && prize.maxPerDay == null && (
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500">
                        Unlimited
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Save feedback */}
        {saveSuccess && (
          <p className="text-sm text-green-600">Changes saved successfully!</p>
        )}
        {saveError && (
          <p className="text-sm text-destructive">{saveError}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" size="lg" className="flex-1" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Delete Section */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Delete this game</p>
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone. All associated data will be permanently removed.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Game
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-destructive font-medium">
                Are you sure you want to delete &quot;{game.name}&quot;? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete Game'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
