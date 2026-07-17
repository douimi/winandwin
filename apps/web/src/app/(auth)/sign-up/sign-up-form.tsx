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
import { GoogleButton, GoogleDivider } from '../google-button'

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

export function SignUpForm() {
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
        setError(result.error.message || 'Something went wrong')
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
      setError(err instanceof Error ? err.message : 'Failed to set up your account')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col items-center">
      <a href="/" className="mb-6 flex flex-col items-center gap-2">
        <img src="/logo.png" alt="Win & Win" className="h-24 w-auto" />
      </a>

      <div className="grid w-full gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Social proof aside — visible on large screens */}
        <aside className="hidden flex-col justify-center rounded-2xl border border-primary/20 bg-card p-8 shadow-sm lg:flex">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" />
            Trusted by 500+ businesses
          </div>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight">
            Set up your first game in under <span className="text-primary">10 minutes</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Start collecting reviews, followers, and repeat visits today.
          </p>

          <ul className="mt-8 space-y-4">
            <ProofTile
              Icon={Star}
              iconClass="bg-amber-50 text-amber-700"
              title="+200 reviews / month"
              detail="Average for active businesses"
            />
            <ProofTile
              Icon={TrendingUp}
              iconClass="bg-emerald-50 text-emerald-700"
              title="+25% return rate"
              detail="Customers come back for more"
            />
            <ProofTile
              Icon={Zap}
              iconClass="bg-sky-50 text-sky-700"
              title="<10 min setup"
              detail="From sign-up to first player"
            />
          </ul>
        </aside>

        {/* Form */}
        <Card className="w-full shadow-lg">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Create your account
            </CardTitle>
            <p className="text-sm text-muted-foreground">Start engaging your customers in minutes</p>
          </CardHeader>
          <CardContent className="pt-2">
            <GoogleButton label="Continue with Google" callbackURL="/onboarding" />
            <GoogleDivider label="or with email" />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                    autoComplete="name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="My Restaurant"
                  value={formData.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  required
                  autoComplete="organization"
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Business Category</Label>
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
                    Creating account…
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a
                href="/sign-in"
                className="font-semibold text-primary transition-colors hover:underline"
              >
                Sign in
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
