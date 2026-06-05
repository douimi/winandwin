'use client'

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@winandwin/ui'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  addPrize,
  deleteGame,
  deletePrize,
  fetchGame,
  resetPrize,
  updateGame,
  updatePrize,
  type GameDetail,
  type PrizeDetail,
  type UpdateGamePayload,
} from '@/lib/api'
import { useMerchantTier } from '@/lib/merchant-context'
import { hasFeature } from '@/lib/tier-features'

const GAME_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  wheel: { label: 'Wheel of Fortune', icon: '🎡' },
  slots: { label: 'Slot Machine', icon: '🎰' },
  mystery_box: { label: 'Mystery Box', icon: '📦' },
}

const STATUS_OPTIONS = ['draft', 'active', 'paused', 'ended'] as const

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

interface PrizeDraft {
  id: string | null // null for unsaved new prizes
  name: string
  emoji: string
  winRate: number
  couponValidityDays: number
  couponActivationDelayHours: number
  maxTotal: number | null
  maxPerDay: number | null
  totalWon: number
  conditionsEnabled: boolean
  conditions: [string, string, string]
}

function prizeToDraft(p: PrizeDetail): PrizeDraft {
  const c = (p.redemptionConditions ?? []) as string[]
  return {
    id: p.id,
    name: p.name,
    emoji: p.emoji ?? '🎁',
    winRate: p.winRate,
    couponValidityDays: p.couponValidityDays,
    couponActivationDelayHours: p.couponActivationDelayHours,
    maxTotal: p.maxTotal ?? null,
    maxPerDay: p.maxPerDay ?? null,
    totalWon: p.totalWon,
    conditionsEnabled: c.length > 0,
    conditions: [c[0] ?? '', c[1] ?? '', c[2] ?? ''],
  }
}

function emptyDraft(): PrizeDraft {
  return {
    id: null,
    name: '',
    emoji: '🎁',
    winRate: 50,
    couponValidityDays: 30,
    couponActivationDelayHours: 24,
    maxTotal: null,
    maxPerDay: null,
    totalWon: 0,
    conditionsEnabled: false,
    conditions: ['', '', ''],
  }
}

function draftEquals(a: PrizeDraft, b: PrizeDraft): boolean {
  return (
    a.name === b.name &&
    a.emoji === b.emoji &&
    a.winRate === b.winRate &&
    a.couponValidityDays === b.couponValidityDays &&
    a.couponActivationDelayHours === b.couponActivationDelayHours &&
    a.maxTotal === b.maxTotal &&
    a.maxPerDay === b.maxPerDay &&
    a.conditionsEnabled === b.conditionsEnabled &&
    a.conditions[0] === b.conditions[0] &&
    a.conditions[1] === b.conditions[1] &&
    a.conditions[2] === b.conditions[2]
  )
}

function buildConditionsArray(draft: PrizeDraft): string[] {
  if (!draft.conditionsEnabled) return []
  return draft.conditions.map((c) => c.trim()).filter((c) => c.length > 0)
}

export default function GameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tier = useMerchantTier()
  const gameId = params.id as string

  const [game, setGame] = useState<GameDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Editable game fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('')
  const [globalWinRate, setGlobalWinRate] = useState(30)

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Prize management state
  const [prizes, setPrizes] = useState<PrizeDraft[]>([])
  const [originalPrizes, setOriginalPrizes] = useState<Record<string, PrizeDraft>>({})

  useEffect(() => {
    if (!gameId) return

    let cancelled = false

    async function load() {
      try {
        const data = await fetchGame(gameId)
        if (cancelled) return
        setGame(data)
        setName(data.name)
        setDescription(data.description || '')
        setStatus(data.status)
        setGlobalWinRate(Math.round(Number(data.globalWinRate) || 30))

        const drafts = data.prizes.map(prizeToDraft)
        setPrizes(drafts)
        const orig: Record<string, PrizeDraft> = {}
        for (const d of drafts) {
          if (d.id) orig[d.id] = d
        }
        setOriginalPrizes(orig)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load game')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [gameId])

  async function handleSaveGame(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const payload: UpdateGamePayload = { name, description, status, globalWinRate }
      await updateGame(gameId, payload)
      setSaveSuccess(true)
      setGame((prev) =>
        prev ? { ...prev, name, description, status, globalWinRate: String(globalWinRate) } : prev,
      )
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteGame() {
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

  // ── Prize-list mutators ──────────────────────────────────────────────

  function updatePrizeDraft(index: number, patch: Partial<PrizeDraft>) {
    setPrizes((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)))
  }

  function updatePrizeCondition(index: number, conditionIndex: 0 | 1 | 2, value: string) {
    setPrizes((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p
        const next: [string, string, string] = [...p.conditions] as [string, string, string]
        next[conditionIndex] = value
        return { ...p, conditions: next }
      }),
    )
  }

  function startAddPrize() {
    setPrizes((prev) => [...prev, emptyDraft()])
  }

  function discardUnsavedPrize(index: number) {
    setPrizes((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSavePrize(index: number): Promise<void> {
    const draft = prizes[index]
    if (!draft) return

    if (draft.conditionsEnabled && !draft.conditions[0].trim()) {
      throw new Error('Enter at least one redemption condition or turn the toggle off.')
    }
    if (!draft.name.trim()) {
      throw new Error('Prize name is required.')
    }

    const conditions = buildConditionsArray(draft)

    if (draft.id === null) {
      // Add new prize
      const created = await addPrize(gameId, {
        name: draft.name.trim(),
        emoji: draft.emoji,
        winRate: draft.winRate,
        couponValidityDays: draft.couponValidityDays,
        couponActivationDelayHours: draft.couponActivationDelayHours,
        redemptionConditions: conditions,
        ...(draft.maxTotal !== null ? { maxTotal: draft.maxTotal } : {}),
        ...(draft.maxPerDay !== null ? { maxPerDay: draft.maxPerDay } : {}),
      })
      const saved = prizeToDraft(created)
      setPrizes((prev) => prev.map((p, i) => (i === index ? saved : p)))
      setOriginalPrizes((prev) => ({ ...prev, [saved.id!]: saved }))
    } else {
      // Update existing prize — only send changed fields
      const original = originalPrizes[draft.id]
      const patch: Record<string, unknown> = {}
      if (!original || original.name !== draft.name) patch.name = draft.name.trim()
      if (!original || original.emoji !== draft.emoji) patch.emoji = draft.emoji
      if (!original || original.winRate !== draft.winRate) patch.winRate = draft.winRate
      if (!original || original.couponValidityDays !== draft.couponValidityDays) {
        patch.couponValidityDays = draft.couponValidityDays
      }
      if (!original || original.couponActivationDelayHours !== draft.couponActivationDelayHours) {
        patch.couponActivationDelayHours = draft.couponActivationDelayHours
      }
      if (!original || original.maxTotal !== draft.maxTotal) patch.maxTotal = draft.maxTotal
      if (!original || original.maxPerDay !== draft.maxPerDay) patch.maxPerDay = draft.maxPerDay
      const origConditions = original ? buildConditionsArray(original) : []
      if (JSON.stringify(origConditions) !== JSON.stringify(conditions)) {
        patch.redemptionConditions = conditions
      }

      if (Object.keys(patch).length === 0) return

      const updated = await updatePrize(draft.id, patch)
      const saved = prizeToDraft(updated)
      setPrizes((prev) => prev.map((p, i) => (i === index ? saved : p)))
      setOriginalPrizes((prev) => ({ ...prev, [saved.id!]: saved }))
    }
  }

  async function handleDeletePrize(index: number): Promise<void> {
    const draft = prizes[index]
    if (!draft) return
    if (draft.id === null) {
      discardUnsavedPrize(index)
      return
    }
    await deletePrize(draft.id)
    setPrizes((prev) => prev.filter((_, i) => i !== index))
    setOriginalPrizes((prev) => {
      const next = { ...prev }
      delete next[draft.id!]
      return next
    })
  }

  async function handleResetPrize(index: number): Promise<void> {
    const draft = prizes[index]
    if (!draft || draft.id === null) return
    const reset = await resetPrize(draft.id)
    const saved = prizeToDraft(reset)
    setPrizes((prev) =>
      prev.map((p, i) => (i === index ? { ...p, totalWon: saved.totalWon } : p)),
    )
    setOriginalPrizes((prev) => ({
      ...prev,
      [saved.id!]: { ...prev[saved.id!]!, totalWon: saved.totalWon },
    }))
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

      <form onSubmit={handleSaveGame} className="space-y-6">
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
            <div className="relative space-y-2">
              <Label htmlFor="gameDescription">Game Description</Label>
              <textarea
                id="gameDescription"
                placeholder="Describe your game to players (e.g., 'Spin the wheel and win a free dessert!')"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={!hasFeature(tier, 'game.description')}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              />
              {!hasFeature(tier, 'game.description') && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60">
                  <a
                    href="/dashboard/upgrade"
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    {'🔒'} Pro feature - Upgrade to unlock
                  </a>
                </div>
              )}
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
              <p className="text-xs text-muted-foreground">{globalWinRate}% of plays will result in a win</p>
            </div>
          </CardContent>
        </Card>

        {saveSuccess && <p className="text-sm text-green-600">Changes saved successfully!</p>}
        {saveError && <p className="text-sm text-destructive">{saveError}</p>}

        <div className="flex gap-3">
          <Button type="submit" size="lg" className="flex-1" disabled={saving}>
            {saving ? 'Saving...' : 'Save Game Settings'}
          </Button>
        </div>
      </form>

      {/* Prizes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Prizes</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={startAddPrize}>
            + Add Prize
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {prizes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No prizes configured yet. Add one to make this game winnable.</p>
          ) : (
            prizes.map((draft, index) => (
              <PrizeEditorCard
                key={draft.id ?? `new-${index}`}
                draft={draft}
                original={draft.id ? originalPrizes[draft.id] ?? null : null}
                onChange={(patch) => updatePrizeDraft(index, patch)}
                onConditionChange={(ci, v) => updatePrizeCondition(index, ci, v)}
                onSave={() => handleSavePrize(index)}
                onDelete={() => handleDeletePrize(index)}
                onReset={() => handleResetPrize(index)}
                onDiscard={() => discardUnsavedPrize(index)}
              />
            ))
          )}
        </CardContent>
      </Card>

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
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDeleteGame}
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

// ─────────────────────────────────────────────────────────────────────────────
// PrizeEditorCard — single editable prize with Save/Delete/Reset/Discard
// ─────────────────────────────────────────────────────────────────────────────

interface PrizeEditorCardProps {
  draft: PrizeDraft
  original: PrizeDraft | null
  onChange: (patch: Partial<PrizeDraft>) => void
  onConditionChange: (index: 0 | 1 | 2, value: string) => void
  onSave: () => Promise<void>
  onDelete: () => Promise<void>
  onReset: () => Promise<void>
  onDiscard: () => void
}

function PrizeEditorCard({
  draft,
  original,
  onChange,
  onConditionChange,
  onSave,
  onDelete,
  onReset,
  onDiscard,
}: PrizeEditorCardProps) {
  const [busy, setBusy] = useState<null | 'save' | 'delete' | 'reset'>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  const isNew = draft.id === null
  const dirty = isNew || (original ? !draftEquals(draft, original) : true)
  const maxedOut = draft.maxTotal !== null && draft.totalWon >= draft.maxTotal

  async function runAction(action: 'save' | 'delete' | 'reset', fn: () => Promise<void>) {
    setBusy(action)
    setErr(null)
    try {
      await fn()
      if (action === 'save') {
        setSavedFlash(true)
        setTimeout(() => setSavedFlash(false), 2000)
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setBusy(null)
      setConfirmDelete(false)
      setConfirmReset(false)
    }
  }

  return (
    <div
      className={`rounded-lg border p-4 space-y-3 ${
        isNew ? 'border-primary/50 bg-primary/5' : dirty ? 'border-amber-400/60 bg-amber-50/40' : 'border-border'
      }`}
    >
      {/* Counter + maxed badge */}
      {!isNew && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                draft.totalWon > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Won: {draft.totalWon}
              {draft.maxTotal != null ? ` / ${draft.maxTotal}` : ''}
            </span>
            {maxedOut && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-700">
                🚫 Limit reached
              </span>
            )}
            {dirty && <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">Unsaved</span>}
          </div>
        </div>
      )}

      {/* Emoji + Name */}
      <div className="flex gap-3">
        <div className="w-20">
          <Label>Emoji</Label>
          <Input
            value={draft.emoji}
            onChange={(e) => onChange({ emoji: (e.target as HTMLInputElement).value })}
            className="text-center text-lg"
          />
        </div>
        <div className="flex-1">
          <Label>Prize Name</Label>
          <Input
            placeholder="Free Dessert"
            value={draft.name}
            onChange={(e) => onChange({ name: (e.target as HTMLInputElement).value })}
          />
        </div>
      </div>

      <div>
        <Label>Win Weight: {draft.winRate}</Label>
        <input
          type="range"
          min={1}
          max={100}
          value={draft.winRate}
          onChange={(e) => onChange({ winRate: Number((e.target as HTMLInputElement).value) })}
          className="w-full"
        />
      </div>

      {/* Expiration */}
      <div className="space-y-1">
        <Label>Prize expiration delay</Label>
        <select
          value={draft.couponValidityDays}
          onChange={(e) => onChange({ couponValidityDays: Number((e.target as HTMLSelectElement).value) })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {EXPIRATION_PRESETS.map((opt) => (
            <option key={opt.days} value={opt.days}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-muted-foreground">We will remind your customers as the prize expiration approaches</p>
      </div>

      {/* Activation */}
      <div className="space-y-1">
        <Label>Prize voucher redeemable from</Label>
        <select
          value={draft.couponActivationDelayHours}
          onChange={(e) => onChange({ couponActivationDelayHours: Number((e.target as HTMLSelectElement).value) })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {ACTIVATION_PRESETS.map((opt) => (
            <option key={opt.hours} value={opt.hours}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Max totals */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Label>Max Total Wins</Label>
          <Input
            type="number"
            min={1}
            placeholder="Unlimited"
            value={draft.maxTotal ?? ''}
            onChange={(e) => {
              const v = (e.target as HTMLInputElement).value
              onChange({ maxTotal: v ? Number(v) : null })
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
            value={draft.maxPerDay ?? ''}
            onChange={(e) => {
              const v = (e.target as HTMLInputElement).value
              onChange({ maxPerDay: v ? Number(v) : null })
            }}
          />
          <p className="text-[10px] text-muted-foreground mt-0.5">Leave empty for unlimited</p>
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-2 rounded-md border border-dashed p-3">
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Prize redeemable under conditions</span>
          <button
            type="button"
            role="switch"
            aria-checked={draft.conditionsEnabled}
            onClick={() => onChange({ conditionsEnabled: !draft.conditionsEnabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              draft.conditionsEnabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                draft.conditionsEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </label>

        {draft.conditionsEnabled && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Redemption conditions</p>
            <Input
              placeholder="e.g., Sous réserve de consommation"
              value={draft.conditions[0]}
              onChange={(e) => onConditionChange(0, (e.target as HTMLInputElement).value)}
              maxLength={200}
            />
            <Input
              placeholder="Redemption condition 2 (optional)"
              value={draft.conditions[1]}
              onChange={(e) => onConditionChange(1, (e.target as HTMLInputElement).value)}
              maxLength={200}
            />
            <Input
              placeholder="Redemption condition 3 (optional)"
              value={draft.conditions[2]}
              onChange={(e) => onConditionChange(2, (e.target as HTMLInputElement).value)}
              maxLength={200}
            />
          </div>
        )}
      </div>

      {err && <p className="text-xs text-destructive">{err}</p>}
      {savedFlash && <p className="text-xs text-green-600">Saved ✓</p>}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          onClick={() => runAction('save', onSave)}
          disabled={busy !== null || !dirty}
        >
          {busy === 'save' ? 'Saving...' : isNew ? 'Add Prize' : 'Save Changes'}
        </Button>

        {isNew ? (
          <Button type="button" variant="outline" size="sm" onClick={onDiscard} disabled={busy !== null}>
            Discard
          </Button>
        ) : (
          <>
            {maxedOut && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmReset(true)}
                disabled={busy !== null}
              >
                Reset counter
              </Button>
            )}
            {!maxedOut && draft.totalWon > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmReset(true)}
                disabled={busy !== null}
              >
                Reset counter
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 ml-auto"
              onClick={() => setConfirmDelete(true)}
              disabled={busy !== null}
            >
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Reset confirm */}
      {confirmReset && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 space-y-2">
          <p className="text-sm font-medium text-amber-900">
            Reset &quot;Won&quot; counter for this prize?
          </p>
          <p className="text-xs text-amber-800">
            The counter goes back to 0 so the prize is winnable again. Existing customer coupons are not affected.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setConfirmReset(false)} disabled={busy !== null}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={() => runAction('reset', onReset)} disabled={busy !== null}>
              {busy === 'reset' ? 'Resetting...' : 'Yes, reset'}
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 space-y-2">
          <p className="text-sm font-medium text-destructive">Delete &quot;{draft.name}&quot;?</p>
          <p className="text-xs text-muted-foreground">
            The prize is removed from the game. Coupons already issued for this prize keep working (the prize name and
            conditions were copied onto each coupon when won).
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setConfirmDelete(false)} disabled={busy !== null}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => runAction('delete', onDelete)}
              disabled={busy !== null}
            >
              {busy === 'delete' ? 'Deleting...' : 'Yes, delete prize'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
