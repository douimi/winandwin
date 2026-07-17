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

interface Category {
  value: string
  label: string
  Icon: LucideIcon
}

const CATEGORIES: Category[] = [
  { value: 'restaurant', label: 'Restaurant', Icon: Utensils },
  { value: 'cafe', label: 'Cafe', Icon: Coffee },
  { value: 'bar', label: 'Bar', Icon: Martini },
  { value: 'retail', label: 'Retail Store', Icon: ShoppingBag },
  { value: 'salon', label: 'Salon', Icon: Scissors },
  { value: 'gym', label: 'Gym / Fitness', Icon: Dumbbell },
  { value: 'entertainment', label: 'Entertainment', Icon: Theater },
  { value: 'hotel', label: 'Hotel', Icon: Hotel },
  { value: 'other', label: 'Other', Icon: Building2 },
]

interface OnboardingFormProps {
  userName: string
  userEmail: string
  userId: string
}

export function OnboardingForm({ userName, userEmail, userId }: OnboardingFormProps) {
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
      setError(err instanceof Error ? err.message : 'Failed to set up your business')
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
            One last step
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Welcome{userName ? `, ${userName.split(' ')[0]}` : ''} 👋
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tell us about your business so we can spin up your workspace.
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                placeholder="My Restaurant"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                autoComplete="organization"
                autoFocus
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Business category</Label>
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
                      <span className="text-[11px] font-medium leading-tight">{cat.label}</span>
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
                  Setting things up…
                </>
              ) : (
                'Go to my dashboard'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
