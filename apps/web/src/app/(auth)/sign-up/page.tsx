import type { Metadata } from 'next'
import { isGoogleAuthEnabled } from '@/lib/auth-config'
import { getPublicSignupEnabled } from '@/lib/platform-flags'
import { SignUpDisabled } from './sign-up-disabled'
import { SignUpForm } from './sign-up-form'

export const metadata: Metadata = {
  title: 'Create your account — Free 14-day trial',
  description:
    'Start engaging your customers with QR-code games. Free 14-day trial, no credit card required. Set up your first game in under 10 minutes.',
  alternates: { canonical: '/sign-up' },
}

export default async function SignUpPage() {
  // When public sign-up is off the sign-up page becomes a "contact us"
  // funnel. Existing merchants keep signing in normally at /sign-in.
  const signupEnabled = await getPublicSignupEnabled()
  if (!signupEnabled) {
    return <SignUpDisabled />
  }

  const googleEnabled = isGoogleAuthEnabled()
  return <SignUpForm googleEnabled={googleEnabled} />
}
