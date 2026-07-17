import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireSession, getUserInfo } from '@/lib/session'
import { OnboardingForm } from './onboarding-form'

// Post-Google-signup step. A user who signed up with Google has an auth
// record but no merchant yet, so this page collects the business name +
// category and creates the merchant. Users who already have a merchant
// are bounced straight to /dashboard.

export const metadata: Metadata = {
  title: 'Set up your business — Win & Win',
  description: 'Tell us about your business to finish setting up your Win & Win account.',
  robots: { index: false, follow: false },
}

export default async function OnboardingPage() {
  const session = await requireSession()
  const { merchantId } = await getUserInfo(session.user.id)
  if (merchantId) {
    redirect('/dashboard')
  }

  return (
    <OnboardingForm
      userName={session.user.name ?? ''}
      userEmail={session.user.email ?? ''}
      userId={session.user.id}
    />
  )
}
