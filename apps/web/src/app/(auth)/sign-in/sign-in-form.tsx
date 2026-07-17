'use client'

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@winandwin/ui'
import { Clock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { signIn } from '@/lib/auth-client'
import { useApp } from '@/lib/i18n/app-lang-context'
import { GoogleButton, GoogleDivider } from '../google-button'

export function SignInForm({ googleEnabled }: { googleEnabled: boolean }) {
  const { txt } = useApp()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  // Set when better-auth reports the user is still awaiting activation.
  // Rendered as a bigger, calmer amber banner (not the destructive red
  // used for wrong-credentials) so the merchant reads it as reassurance,
  // not a rejection.
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPending(false)

    const result = await signIn.email({ email, password })

    if (result.error) {
      // Better-auth encodes our custom error via the `code` field. We
      // handle a couple by string match too because some transport layers
      // strip the code between server and client.
      const code = (result.error as { code?: string }).code
      const msg = result.error.message ?? ''
      if (code === 'PENDING_ACTIVATION' || /awaiting approval|pending activation/i.test(msg)) {
        setPending(true)
      } else {
        setError(msg || txt.signInInvalidCredentials)
      }
      setLoading(false)
    } else {
      router.push(callbackUrl)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center">
      <a href="/" className="mb-6 flex flex-col items-center gap-2">
        <img src="/logo.png" alt="Win & Win" className="h-48 w-auto" />
      </a>

      <Card className="w-full shadow-lg">
        <CardHeader className="pb-3 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">{txt.signInTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{txt.signInSubtitle}</p>
        </CardHeader>
        <CardContent className="pt-2">
          <GoogleButton label={txt.signInGoogle} callbackURL={callbackUrl} enabled={googleEnabled} />
          <GoogleDivider label={txt.signInOr} enabled={googleEnabled} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{txt.signInEmail}</Label>
              <Input
                id="email"
                type="email"
                placeholder={txt.signInEmailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{txt.signInPassword}</Label>
                <a
                  href="#"
                  className="text-xs font-medium text-primary transition-colors hover:underline"
                >
                  {txt.signInForgot}
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={txt.signInPasswordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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

            {pending && (
              <div className="rounded-lg border border-amber-300/60 bg-amber-50 p-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-amber-900">{txt.signInPendingTitle}</p>
                    <p className="mt-0.5 text-xs text-amber-800">{txt.signInPendingBody}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="h-11 w-full font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {txt.signInSubmitting}
                </>
              ) : (
                txt.signInSubmit
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {txt.signInNoAccount}{' '}
            <a
              href="/sign-up"
              className="font-semibold text-primary transition-colors hover:underline"
            >
              {txt.signInCreateAccount}
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
