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

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>{'\uD83C\uDFA8'} Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Branding colors are configured per game. Go to your{' '}
            <a href="/dashboard/games" className="text-primary underline">
              Games
            </a>{' '}
            page to customize colors for each game.
          </p>
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
              <p className="text-sm text-muted-foreground">
                Logo upload — coming soon
              </p>
            </div>
          </div>
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
