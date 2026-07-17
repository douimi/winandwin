import type { Metadata } from 'next'
import { isGoogleAuthEnabled } from '@/lib/auth-config'
import { SignUpForm } from './sign-up-form'

export const metadata: Metadata = {
  title: 'Create your account — Free 14-day trial',
  description:
    'Start engaging your customers with QR-code games. Free 14-day trial, no credit card required. Set up your first game in under 10 minutes.',
  alternates: { canonical: '/sign-up' },
}

export default function SignUpPage() {
  const googleEnabled = isGoogleAuthEnabled()
  return <SignUpForm googleEnabled={googleEnabled} />
}
