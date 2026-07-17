import type { Metadata } from 'next'
import { isGoogleAuthEnabled } from '@/lib/auth-config'
import { getPublicSignupEnabled } from '@/lib/platform-flags'
import { SignUpForm } from './sign-up-form'

export const metadata: Metadata = {
  title: 'Create your account — Free 14-day trial',
  description:
    'Start engaging your customers with QR-code games. Free 14-day trial, no credit card required. Set up your first game in under 10 minutes.',
  alternates: { canonical: '/sign-up' },
}

export default async function SignUpPage() {
  // Public sign-up stays open in both flag states. When the flag is off,
  // new accounts get an `activationStatus = 'pending'` on the server and
  // sign-in is blocked until an admin approves them. The form still lets
  // users complete the signup — it just switches to a "thanks, we'll
  // review" success screen instead of routing to /dashboard.
  const [signupEnabled, googleEnabled] = await Promise.all([
    getPublicSignupEnabled(),
    Promise.resolve(isGoogleAuthEnabled()),
  ])
  return <SignUpForm googleEnabled={googleEnabled} moderationEnabled={!signupEnabled} />
}
