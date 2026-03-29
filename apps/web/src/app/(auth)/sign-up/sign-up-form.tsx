'use client'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signUp } from '@/lib/auth-client'
import { createMerchant } from '@/lib/api'

const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'cafe', label: 'Cafe', icon: '☕' },
  { value: 'bar', label: 'Bar', icon: '🍸' },
  { value: 'retail', label: 'Retail Store', icon: '🛍️' },
  { value: 'salon', label: 'Salon', icon: '💇' },
  { value: 'gym', label: 'Gym / Fitness', icon: '💪' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'other', label: 'Other', icon: '🏢' },
] as const

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
    <div className="flex flex-col items-center">
      {/* Logo */}
      <a href="/" className="mb-8 flex flex-col items-center gap-2">
        <img src="/logo.svg" alt="Win & Win" className="h-20" />
      </a>

      <div className="grid w-full gap-6 lg:max-w-4xl lg:grid-cols-[1fr_1.2fr]">
        {/* Social proof sidebar — visible on large screens */}
        <div className="hidden flex-col justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#ec4899] p-8 text-white shadow-xl shadow-[#6366f1]/20 lg:flex">
          <div className="text-3xl font-extrabold leading-tight">
            Join 500+ businesses using Win &amp; Win
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            Set up your first game in under 10 minutes and start collecting reviews, followers, and
            repeat visits today.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="text-sm font-bold">+200 reviews/month</div>
                <div className="text-xs text-white/70">Average for active businesses</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <span className="text-2xl">📈</span>
              <div>
                <div className="text-sm font-bold">+25% return rate</div>
                <div className="text-xs text-white/70">Customers come back for more</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="text-sm font-bold">&lt;10 min setup</div>
                <div className="text-xs text-white/70">From sign-up to first player</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="w-full border-0 bg-white/80 shadow-xl shadow-black/5 backdrop-blur-sm">
          <CardHeader className="pb-2 text-center">
            <div className="mb-1 inline-flex items-center gap-1.5 self-center rounded-full bg-[#6366f1]/10 px-3 py-1 text-xs font-medium text-[#6366f1]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6366f1] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#6366f1]" />
              </span>
              Step 1 of 1
            </div>
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <p className="text-sm text-muted-foreground">
              Start engaging your customers in minutes
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium leading-none">
                    Your Name
                  </label>
                  <input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                    className="flex h-11 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    className="flex h-11 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    required
                    minLength={8}
                    className="flex h-11 w-full rounded-lg border border-input bg-white px-3 py-2 pr-10 text-sm shadow-sm transition-colors focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="businessName" className="text-sm font-medium leading-none">
                  Business Name
                </label>
                <input
                  id="businessName"
                  placeholder="My Restaurant"
                  value={formData.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Business Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => updateField('category', cat.value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center transition-all ${
                        formData.category === cat.value
                          ? 'border-[#6366f1] bg-[#6366f1]/5 ring-2 ring-[#6366f1]/20'
                          : 'border-input bg-white hover:border-[#6366f1]/40 hover:bg-[#6366f1]/5'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-[11px] font-medium leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-11 w-full bg-gradient-to-r from-[#6366f1] to-[#ec4899] font-semibold shadow-lg shadow-[#6366f1]/25 transition-shadow hover:shadow-xl hover:shadow-[#6366f1]/30"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a
                href="/sign-in"
                className="font-semibold text-[#6366f1] transition-colors hover:text-[#6366f1]/80"
              >
                Sign in
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
