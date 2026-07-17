'use client'

import { Button } from '@winandwin/ui'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { signIn } from '@/lib/auth-client'

// One-click Google OAuth button used by both sign-in and sign-up forms.
// The caller decides where to land after auth via callbackURL:
//   /dashboard   — for existing users signing in
//   /onboarding  — for new sign-ups, so they can finish creating a merchant
export function GoogleButton({
  label,
  callbackURL,
}: {
  label: string
  callbackURL: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setLoading(true)
    setError('')
    try {
      const result = await signIn.social({ provider: 'google', callbackURL })
      // Better-auth performs a full-page redirect for OAuth flows; if we
      // land here without a redirect the request failed.
      if (result?.error) {
        setError(result.error.message || 'Google sign-in failed. Try again.')
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleClick}
        disabled={loading}
        className="h-11 w-full font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting…
          </>
        ) : (
          <>
            <GoogleGlyph />
            {label}
          </>
        )}
      </Button>
      {error && (
        <p className="text-center text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

// Multi-colour Google "G" mark — inline so no image asset is needed.
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.48h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.71H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.168 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}
