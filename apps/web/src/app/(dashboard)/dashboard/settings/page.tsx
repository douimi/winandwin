'use client'

import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@winandwin/ui'
import { useEffect, useState, useCallback } from 'react'
import { fetchMerchant, updateMerchant } from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'
import { QRSection } from './qr-section'
import type { Merchant } from '@winandwin/shared'

export default function SettingsPage() {
  const merchantId = useMerchantId()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('restaurant')
  const [timezone, setTimezone] = useState('Europe/Paris')
  const [phone, setPhone] = useState('')
  const [validationPin, setValidationPin] = useState('0000')
  const [savingPin, setSavingPin] = useState(false)

  // Game Rules state
  const [cooldownHours, setCooldownHours] = useState(24)
  const [maxWinsPerPeriod, setMaxWinsPerPeriod] = useState(5)
  const [winPeriodDays, setWinPeriodDays] = useState(7)
  const [savingRules, setSavingRules] = useState(false)

  // Brand Identity state
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [secondaryColor, setSecondaryColor] = useState('#ec4899')
  const [logoUrl, setLogoUrl] = useState('')
  const [backgroundUrl, setBackgroundUrl] = useState('')
  const [description, setDescription] = useState('')
  const [savingBrand, setSavingBrand] = useState(false)

  // Atmosphere state
  const [atmosphere, setAtmosphere] = useState('joyful')
  const [savingAtmosphere, setSavingAtmosphere] = useState(false)

  const loadMerchant = useCallback(async () => {
    if (!merchantId) {
      setLoading(false)
      return
    }
    try {
      const merchant = await fetchMerchant(merchantId)
      setName(merchant.name)
      setSlug(merchant.slug)
      setCategory(merchant.category)
      setTimezone(merchant.timezone)
      setPhone(merchant.phone ?? '')
      setValidationPin((merchant as unknown as Record<string, string>).validationPin ?? '0000')
      setCooldownHours((merchant as unknown as Record<string, number>).cooldownHours ?? 24)
      setMaxWinsPerPeriod((merchant as unknown as Record<string, number>).maxWinsPerPeriod ?? 5)
      setWinPeriodDays((merchant as unknown as Record<string, number>).winPeriodDays ?? 7)
      setPrimaryColor((merchant as unknown as Record<string, string>).primaryColor ?? '#6366f1')
      setSecondaryColor((merchant as unknown as Record<string, string>).secondaryColor ?? '#ec4899')
      setLogoUrl((merchant as unknown as Record<string, string>).logoUrl ?? '')
      setBackgroundUrl((merchant as unknown as Record<string, string>).backgroundUrl ?? '')
      setDescription((merchant as unknown as Record<string, string>).description ?? '')
      setAtmosphere((merchant as unknown as Record<string, string>).atmosphere ?? 'joyful')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  useEffect(() => {
    loadMerchant()
  }, [loadMerchant])

  function showSuccess(msg: string) {
    setSuccessMessage(msg)
    setError(null)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault()
    if (!merchantId) return

    setSaving(true)
    setError(null)
    try {
      await updateMerchant(merchantId, {
        name,
        category,
        timezone,
        phone: phone || undefined,
      })
      showSuccess('Business information saved successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Success / error feedback */}
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

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>{'\uD83C\uDFE2'} Business Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Game URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">play.winandwin.com/</span>
                <Input id="slug" value={slug} disabled className="flex-1 opacity-60" />
              </div>
              <p className="text-xs text-muted-foreground">
                The slug is set when you create your account and cannot be changed.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="bar">Bar</option>
                  <option value="retail">Retail</option>
                  <option value="salon">Salon</option>
                  <option value="gym">Gym</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="hotel">Hotel</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                  <option value="Europe/Madrid">Europe/Madrid</option>
                  <option value="Europe/Rome">Europe/Rome</option>
                  <option value="America/New_York">America/New York</option>
                  <option value="America/Chicago">America/Chicago</option>
                  <option value="America/Los_Angeles">America/Los Angeles</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Brand Identity */}
      <Card>
        <CardHeader>
          <CardTitle>{'\uD83C\uDFA8'} Brand Identity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Customize how your game page looks to players. These settings apply across all your games.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!merchantId) return
              setSavingBrand(true)
              setError(null)
              try {
                await updateMerchant(merchantId, {
                  primaryColor,
                  secondaryColor,
                  logoUrl: logoUrl || '',
                  backgroundUrl: backgroundUrl || '',
                  description: description || '',
                })
                showSuccess('Brand identity saved successfully.')
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save brand identity')
              } finally {
                setSavingBrand(false)
              }
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="primaryColorPicker"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border border-input p-0.5"
                  />
                  <Input
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#6366f1"
                    pattern="^#[0-9a-fA-F]{6}$"
                    maxLength={7}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="secondaryColorPicker"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border border-input p-0.5"
                  />
                  <Input
                    id="secondaryColor"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#ec4899"
                    pattern="^#[0-9a-fA-F]{6}$"
                    maxLength={7}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Paste a URL to your logo image. File upload coming soon.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backgroundUrl">Background Image URL</Label>
              <Input
                id="backgroundUrl"
                type="url"
                value={backgroundUrl}
                onChange={(e) => setBackgroundUrl(e.target.value)}
                placeholder="https://example.com/background.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short description shown on the player welcome screen..."
                maxLength={500}
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/500 characters
              </p>
            </div>
            {/* Preview */}
            <div className="rounded-lg border p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
              <div
                className="flex items-center gap-3 rounded-lg p-3"
                style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)` }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="h-10 w-10 rounded-full object-cover border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {name.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <p className="font-medium" style={{ color: primaryColor }}>{name || 'Your Business'}</p>
                  {description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
                  )}
                </div>
              </div>
            </div>
            <Button type="submit" disabled={savingBrand}>
              {savingBrand ? 'Saving...' : 'Save Brand Identity'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Game Atmosphere */}
      <Card>
        <CardHeader>
          <CardTitle>{'\uD83C\uDFA8'} Game Atmosphere</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Choose a visual theme for your player game page. This changes the entire look and feel.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: 'joyful', label: 'Joyful & Fun', emoji: '🎉', colors: ['#667eea', '#764ba2', '#f093fb'] },
              { key: 'premium', label: 'Premium & Elegant', emoji: '✨', colors: ['#0a0a0a', '#1a1a2e', '#daa520'] },
              { key: 'warm', label: 'Warm & Cozy', emoji: '☕', colors: ['#3c1810', '#5c2d1a', '#e8a849'] },
              { key: 'kids', label: 'Child-Friendly', emoji: '🎈', colors: ['#00b4d8', '#48cae4', '#ffb703'] },
              { key: 'custom', label: 'Custom Colors', emoji: '🎨', colors: [primaryColor || '#6366f1', secondaryColor || '#ec4899', '#f59e0b'] },
            ].map((atm) => (
              <button
                key={atm.key}
                type="button"
                onClick={async () => {
                  setAtmosphere(atm.key)
                  if (!merchantId) return
                  setSavingAtmosphere(true)
                  setError(null)
                  try {
                    await updateMerchant(merchantId, { atmosphere: atm.key } as Record<string, unknown>)
                    showSuccess(`Atmosphere changed to "${atm.label}"`)
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to save atmosphere')
                  } finally {
                    setSavingAtmosphere(false)
                  }
                }}
                disabled={savingAtmosphere}
                className={`flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-all ${
                  atmosphere === atm.key
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{atm.emoji}</span>
                  <div className="flex items-center gap-1">
                    {atm.colors.map((c, i) => (
                      <div
                        key={i}
                        className="h-5 w-5 rounded-full border border-gray-200"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm font-medium">{atm.label}</span>
                {atmosphere === atm.key && (
                  <span className="text-xs text-indigo-600 font-medium">Active</span>
                )}
              </button>
            ))}
          </div>
          {atmosphere === 'custom' && (
            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
              <p className="text-sm font-medium mb-3">Choose your 3 custom colors:</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Primary', key: 'customColor1' as const, value: primaryColor || '#6366f1' },
                  { label: 'Secondary', key: 'customColor2' as const, value: secondaryColor || '#ec4899' },
                  { label: 'Accent', key: 'customColor3' as const, value: '#f59e0b' },
                ].map((color) => (
                  <div key={color.key} className="space-y-1">
                    <Label className="text-xs">{color.label}</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        defaultValue={color.value}
                        onChange={async (e) => {
                          if (!merchantId) return
                          await updateMerchant(merchantId, { [color.key]: e.target.value } as Record<string, unknown>)
                        }}
                        className="h-9 w-12 cursor-pointer rounded border"
                      />
                      <Input
                        defaultValue={color.value}
                        className="flex-1 font-mono text-xs"
                        readOnly
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button
                className="mt-3"
                size="sm"
                onClick={async () => {
                  if (!merchantId) return
                  showSuccess('Custom colors saved!')
                }}
              >
                Save Custom Colors
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Rules */}
      <Card>
        <CardHeader>
          <CardTitle>{'\u{1F3AE}'} Game Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!merchantId) return
              setSavingRules(true)
              setError(null)
              try {
                await updateMerchant(merchantId, { cooldownHours, maxWinsPerPeriod, winPeriodDays })
                showSuccess('Game rules updated successfully.')
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save')
              } finally {
                setSavingRules(false)
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="cooldownHours">Cooldown between plays (hours)</Label>
              <Input
                id="cooldownHours"
                type="number"
                min={1}
                max={720}
                value={cooldownHours}
                onChange={(e) => setCooldownHours(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">How long a player must wait before playing again. Default: 24 hours.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxWins">Max wins per period</Label>
              <Input
                id="maxWins"
                type="number"
                min={1}
                max={100}
                value={maxWinsPerPeriod}
                onChange={(e) => setMaxWinsPerPeriod(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Maximum number of wins a player can have within the win period. Helps prevent fraud.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="winPeriod">Win period (days)</Label>
              <Input
                id="winPeriod"
                type="number"
                min={1}
                max={90}
                value={winPeriodDays}
                onChange={(e) => setWinPeriodDays(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">The rolling window for counting wins. Default: 7 days.</p>
            </div>
            <Button type="submit" disabled={savingRules}>
              {savingRules ? 'Saving...' : 'Save Game Rules'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Coupon Validation PIN */}
      <Card>
        <CardHeader>
          <CardTitle>{'\uD83D\uDD10'} Coupon Validation PIN</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Staff will use this PIN to validate coupons when customers present them.
            The PIN is entered on the coupon validation page after scanning the QR code.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!merchantId) return
              if (!/^\d{4,6}$/.test(validationPin)) {
                setError('PIN must be 4-6 digits')
                return
              }
              setSavingPin(true)
              setError(null)
              try {
                await updateMerchant(merchantId, { validationPin })
                showSuccess('Validation PIN updated successfully.')
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save PIN')
              } finally {
                setSavingPin(false)
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="validationPin">Validation PIN (4-6 digits)</Label>
              <Input
                id="validationPin"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={validationPin}
                onChange={(e) => setValidationPin(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
                className="max-w-[200px] text-center text-lg tracking-widest font-mono"
              />
            </div>
            <Button type="submit" disabled={savingPin}>
              {savingPin ? 'Saving...' : 'Update PIN'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* QR Code Section */}
      {slug && <QRSection merchantSlug={slug} />}

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{'\u26A0\uFE0F'} Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="destructive" disabled>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
