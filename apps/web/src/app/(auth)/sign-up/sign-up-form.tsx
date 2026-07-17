'use client'

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@winandwin/ui'
import {
  Building2,
  Coffee,
  Dumbbell,
  Eye,
  EyeOff,
  Hotel,
  Loader2,
  Martini,
  Scissors,
  ShoppingBag,
  Sparkles,
  Star,
  Theater,
  TrendingUp,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signUp } from '@/lib/auth-client'
import { createMerchant } from '@/lib/api'
import { useApp } from '@/lib/i18n/app-lang-context'
import type { AppText } from '@/lib/i18n/app-text'
import { GoogleButton, GoogleDivider } from '../google-button'

interface Category {
  value: string
  labelKey: keyof AppText
  Icon: LucideIcon
}

// Labels are looked up from the app text bundle at render time so the tile
// grid switches between FR and EN with the rest of the UI.
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

export function SignUpForm({ googleEnabled }: { googleEnabled: boolean }) {
  const { txt } = useApp()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    category: 'restaurant',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      if (result.error) {
        setError(result.error.message || txt.signUpErrorGeneric)
        setLoading(false)
        return
      }

      const userId = result.data?.user?.id
      await createMerchant({
        name: formData.businessName,
        category: formData.category,
        email: formData.email,
        userId: userId,
      })

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : txt.signUpErrorSetup)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col items-center">
      <a href="/" className="mb-6 flex flex-col items-center gap-2">
        <img src="/logo.png" alt="Win & Win" className="h-36 w-auto" />
      </a>

      <div className="grid w-full gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Social proof aside — visible on large screens */}
        <aside className="hidden flex-col justify-center rounded-2xl border border-primary/20 bg-card p-8 shadow-sm lg:flex">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" />
            {txt.signUpProofBadge}
          </div>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight">
            {txt.signUpProofHeadline} <span className="text-primary">{txt.signUpProofHighlight}</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {txt.signUpProofSubtitle}
          </p>

          <ul className="mt-8 space-y-4">
            <ProofTile
              Icon={Star}
              iconClass="bg-amber-50 text-amber-700"
              title={txt.signUpProofReviewsTitle}
              detail={txt.signUpProofReviewsDetail}
            />
            <ProofTile
              Icon={TrendingUp}
              iconClass="bg-emerald-50 text-emerald-700"
              title={txt.signUpProofReturnTitle}
              detail={txt.signUpProofReturnDetail}
            />
            <ProofTile
              Icon={Zap}
              iconClass="bg-sky-50 text-sky-700"
              title={txt.signUpProofSetupTitle}
              detail={txt.signUpProofSetupDetail}
            />
          </ul>
        </aside>

        {/* Form */}
        <Card className="w-full shadow-lg">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {txt.signUpTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{txt.signUpSubtitle}</p>
          </CardHeader>
          <CardContent className="pt-2">
            <GoogleButton label={txt.signUpGoogle} callbackURL="/onboarding" enabled={googleEnabled} />
            <GoogleDivider label={txt.signUpOrEmail} enabled={googleEnabled} />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{txt.signUpYourName}</Label>
                  <Input
                    id="name"
                    placeholder={txt.signUpYourNamePlaceholder}
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                    autoComplete="name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">{txt.signUpEmail}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={txt.signUpEmailPlaceholder}
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{txt.signUpPassword}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={txt.signUpPasswordPlaceholder}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? txt.signInHidePassword : txt.signInShowPassword}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="businessName">{txt.signUpBusinessName}</Label>
                <Input
                  id="businessName"
                  placeholder={txt.signUpBusinessNamePlaceholder}
                  value={formData.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  required
                  autoComplete="organization"
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label>{txt.signUpBusinessCategory}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.Icon
                    const selected = formData.category === cat.value
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => updateField('category', cat.value)}
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
                    {txt.signUpSubmitting}
                  </>
                ) : (
                  txt.signUpSubmit
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {txt.signUpAlreadyHaveAccount}{' '}
              <a
                href="/sign-in"
                className="font-semibold text-primary transition-colors hover:underline"
              >
                {txt.signUpSignIn}
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProofTile({
  Icon,
  iconClass,
  title,
  detail,
}: {
  Icon: LucideIcon
  iconClass: string
  title: string
  detail: string
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card/80 px-4 py-3 shadow-xs">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </li>
  )
}
