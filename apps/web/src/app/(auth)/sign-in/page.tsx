import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SignInForm } from './sign-in-form'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Win & Win merchant dashboard to manage games, prizes, and analytics.',
  alternates: { canonical: '/sign-in' },
  robots: { index: false, follow: true },
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
