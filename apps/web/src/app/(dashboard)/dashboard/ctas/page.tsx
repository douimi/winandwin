'use client'

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@winandwin/ui'
import { useEffect, useState, useCallback } from 'react'
import {
  fetchCtas,
  createCta,
  updateCta,
  deleteCta,
  type CtaItem,
} from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'

const CTA_TYPES = [
  {
    type: 'google_review',
    label: 'Google Review',
    icon: '\u2B50',
    description: 'Ask customers to leave a Google review.',
    configFields: [
      { key: 'googlePlaceUrl', label: 'Google Place URL', placeholder: 'https://g.page/...' },
    ],
  },
  {
    type: 'instagram_follow',
    label: 'Instagram Follow',
    icon: '\uD83D\uDCF7',
    description: 'Ask customers to follow your Instagram.',
    configFields: [
      {
        key: 'instagramHandle',
        label: 'Instagram Handle',
        placeholder: '@yourbusiness',
      },
    ],
  },
  {
    type: 'email_collect',
    label: 'Email Collection',
    icon: '\uD83D\uDCE7',
    description: 'Collect customer emails for marketing.',
    configFields: [],
  },
  {
    type: 'visit_stamp',
    label: 'Visit Stamp',
    icon: '\uD83D\uDCCD',
    description: 'Digital stamp for visit loyalty.',
    configFields: [],
  },
  {
    type: 'receipt_photo',
    label: 'Receipt Photo',
    icon: '\uD83D\uDCC4',
    description: 'Ask customers to upload a receipt photo.',
    configFields: [],
  },
] as const

export default function CtasPage() {
  const merchantId = useMerchantId()
  const [ctaList, setCtaList] = useState<CtaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Add CTA form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCtaType, setNewCtaType] = useState<string>(CTA_TYPES[0].type)
  const [newCtaConfig, setNewCtaConfig] = useState<Record<string, string>>({})
  const [addLoading, setAddLoading] = useState(false)

  const loadCtas = useCallback(async () => {
    if (!merchantId) {
      setLoading(false)
      return
    }
    try {
      const data = await fetchCtas(merchantId)
      setCtaList(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CTAs')
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  useEffect(() => {
    loadCtas()
  }, [loadCtas])

  function showSuccessFeedback(msg: string) {
    setSuccessMessage(msg)
    setError(null)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  async function handleToggleEnabled(cta: CtaItem) {
    setActionLoading(cta.id)
    try {
      await updateCta(cta.id, { enabled: !cta.enabled })
      await loadCtas()
      showSuccessFeedback(`${cta.type.replace(/_/g, ' ')} ${cta.enabled ? 'disabled' : 'enabled'}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update CTA')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(cta: CtaItem) {
    setActionLoading(cta.id)
    try {
      await deleteCta(cta.id)
      await loadCtas()
      showSuccessFeedback(`${cta.type.replace(/_/g, ' ')} deleted.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete CTA')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUpdateWeight(cta: CtaItem, weight: number) {
    setActionLoading(cta.id)
    try {
      await updateCta(cta.id, { weight })
      await loadCtas()
      showSuccessFeedback(`Priority updated to ${weight}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update priority')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleSaveConfig(cta: CtaItem, config: Record<string, unknown>) {
    setActionLoading(cta.id)
    try {
      await updateCta(cta.id, { config })
      await loadCtas()
      showSuccessFeedback('Configuration saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save config')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleAddCta(e: React.FormEvent) {
    e.preventDefault()
    if (!merchantId) return

    setAddLoading(true)
    setError(null)
    try {
      await createCta({
        merchantId,
        type: newCtaType,
        enabled: true,
        weight: 1,
        config: newCtaConfig,
      })
      await loadCtas()
      setShowAddForm(false)
      setNewCtaConfig({})
      showSuccessFeedback('CTA added successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add CTA')
    } finally {
      setAddLoading(false)
    }
  }

  // Determine which CTA types are already configured
  const existingTypes = new Set(ctaList.map((c) => c.type))
  const availableTypes = CTA_TYPES.filter((t) => !existingTypes.has(t.type))

  const selectedNewCtaDef = CTA_TYPES.find((t) => t.type === newCtaType)

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">CTA Configuration</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading CTAs...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">CTA Configuration</h1>
        {availableTypes.length > 0 && !showAddForm && (
          <Button onClick={() => {
            setNewCtaType(availableTypes[0]!.type)
            setNewCtaConfig({})
            setShowAddForm(true)
          }}>
            Add CTA
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Configure the actions customers must complete before they can play the game.
        At least one CTA must be enabled for your game to work.
      </p>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        {'\u2139\uFE0F'} Players see one action per visit, in order of priority (highest first).
        Use the weight field on each CTA to control the order.
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Existing CTAs */}
      {ctaList.length === 0 && !showAddForm ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-4xl">{'\uD83D\uDD17'}</p>
            <p className="mt-2 text-lg font-medium">No CTAs configured</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add a CTA to define what actions customers perform before playing.
            </p>
            <Button onClick={() => {
              setNewCtaType(CTA_TYPES[0].type)
              setNewCtaConfig({})
              setShowAddForm(true)
            }}>
              Add Your First CTA
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ctaList.map((cta) => {
            const ctaDef = CTA_TYPES.find((t) => t.type === cta.type)
            return (
              <CtaCard
                key={cta.id}
                cta={cta}
                label={ctaDef?.label ?? cta.type}
                icon={ctaDef?.icon ?? '\uD83C\uDFAF'}
                description={ctaDef?.description ?? ''}
                configFields={ctaDef?.configFields ?? []}
                loading={actionLoading === cta.id}
                onToggle={() => handleToggleEnabled(cta)}
                onDelete={() => handleDelete(cta)}
                onSaveConfig={(config) => handleSaveConfig(cta, config)}
                onUpdateWeight={(weight) => handleUpdateWeight(cta, weight)}
              />
            )
          })}
        </div>
      )}

      {/* Add CTA form */}
      {showAddForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>Add New CTA</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCta} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ctaType">Action Type</Label>
                <select
                  id="ctaType"
                  value={newCtaType}
                  onChange={(e) => {
                    setNewCtaType(e.target.value)
                    setNewCtaConfig({})
                  }}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {availableTypes.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedNewCtaDef?.description && (
                <p className="text-sm text-muted-foreground">{selectedNewCtaDef.description}</p>
              )}

              {selectedNewCtaDef?.configFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`new-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`new-${field.key}`}
                    value={newCtaConfig[field.key] ?? ''}
                    onChange={(e) =>
                      setNewCtaConfig((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <div className="flex gap-3">
                <Button type="submit" disabled={addLoading}>
                  {addLoading ? 'Adding...' : 'Add CTA'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CtaCard({
  cta,
  label,
  icon,
  description,
  configFields,
  loading: cardLoading,
  onToggle,
  onDelete,
  onSaveConfig,
  onUpdateWeight,
}: {
  cta: CtaItem
  label: string
  icon: string
  description: string
  configFields: readonly { key: string; label: string; placeholder?: string }[]
  loading: boolean
  onToggle: () => void
  onDelete: () => void
  onSaveConfig: (config: Record<string, unknown>) => void
  onUpdateWeight: (weight: number) => void
}) {
  const [editConfig, setEditConfig] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const field of configFields) {
      initial[field.key] = (cta.config[field.key] as string) ?? ''
    }
    return initial
  })

  const hasConfigFields = configFields.length > 0

  function handleSave() {
    onSaveConfig(editConfig)
  }

  return (
    <Card className={!cta.enabled ? 'opacity-60' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span className="text-2xl">{icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{label}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    cta.enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cta.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Label className="text-xs text-muted-foreground">Priority:</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={cta.weight}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value, 10)
                    if (val >= 1 && val <= 10) onUpdateWeight(val)
                  }}
                  className="h-7 w-16 text-xs text-center"
                  disabled={cardLoading}
                />
                <span className="text-xs text-muted-foreground">(1-10, higher = shown first)</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={onToggle}
              disabled={cardLoading}
            >
              {cta.enabled ? 'Disable' : 'Enable'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              disabled={cardLoading}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          </div>
        </div>

        {hasConfigFields && (
          <div className="mt-4 space-y-3 rounded-lg bg-muted/50 p-4">
            {configFields.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={`${cta.id}-${field.key}`} className="text-xs">
                  {field.label}
                </Label>
                <Input
                  id={`${cta.id}-${field.key}`}
                  value={editConfig[field.key] ?? ''}
                  onChange={(e) =>
                    setEditConfig((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="h-8 text-sm"
                />
              </div>
            ))}
            <Button size="sm" onClick={handleSave} disabled={cardLoading}>
              {cardLoading ? 'Saving...' : 'Save Config'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
