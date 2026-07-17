'use client'

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@winandwin/ui'
import {
  Building2,
  Coffee,
  Dumbbell,
  Hotel,
  Loader2,
  Martini,
  Scissors,
  ShoppingBag,
  Sparkles,
  Theater,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createMerchant } from '@/lib/api'
import { useApp } from '@/lib/i18n/app-lang-context'
import type { AppText } from '@/lib/i18n/app-text'

interface Category {
  value: string
  labelKey: keyof AppText
  Icon: LucideIcon
}

const CATEGORIES: Category[] = [
  { value: 'restaurant', labelKey: 'catRestaurant', Icon: Utensils },
  { value: 'cafe', labelKey: 'catCafe', Icon: Coffee },
  { value: 'bar', labelKey: 'catBar', Icon: Martini },
  { value: 'retail', labelKey: 'catRetail', Icon: ShoppingBag },
  { value: 'salon', labelKey: 'catSalon', Icon: Scissors },
  { value: 'gym', labelKey: 'catGym', Icon: Dumbbell },
  { value: 'entertainment', labelKey: 'catEntertainment', Icon: Theater },
  { value: 'hotel', labelKey: 'catHotel', Icon: Hotel },
  { value: 'other', labelKey: 'catOther', Icon: Building2 },
]

interface OnboardingFormProps {
  userName: string
  userEmail: string
  userId: string
}

export function OnboardingForm({ userName, userEmail, userId }: OnboardingFormProps) {
  const { txt } = useApp()
  const router = useRouter()
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState('restaurant')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await createMerchant({
        name: businessName,
        category,
        email: userEmail,
        userId,
      })
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : txt.onboardingErrorGeneric)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center">
      <a href="/" className="mb-6 flex flex-col items-center gap-2">
        <img src="/logo.png" alt="Win & Win" className="h-32 w-auto" />
      </a>

      <Card className="w-full shadow-lg">
        <CardHeader className="pb-3 text-center">
          <div className="mx-auto mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" />
            {txt.onboardingBadge}
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {txt.onboardingTitle}{userName ? `, ${userName.split(' ')[0]}` : ''} 👋
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {txt.onboardingSubtitle}
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="businessName">{txt.onboardingBusinessName}</Label>
              <Input
                id="businessName"
                placeholder={txt.onboardingBusinessNamePlaceholder}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                autoComplete="organization"
                autoFocus
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label>{txt.onboardingBusinessCategory}</Label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.Icon
                  const selected = category === cat.value
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center transition-all ${
                        selected
                          ? 'border-primary bg-primary/5 text-foreground ring-2 ring-primary/20'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-accent/40'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-[11px] font-medium leading-tight">{txt[cat.labelKey]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="h-11 w-full font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {txt.onboardingSubmitting}
                </>
              ) : (
                txt.onboardingSubmit
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
