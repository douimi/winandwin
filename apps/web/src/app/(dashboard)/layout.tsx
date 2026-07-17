import { redirect } from 'next/navigation'
import { requireSessionWithMerchant } from '@/lib/session'
import { MerchantProvider } from '@/lib/merchant-context'
import { AppLangProvider } from '@/lib/i18n/app-lang-context'
import { DashboardShell } from './dashboard-shell'
import { fetchMerchant } from '@/lib/api'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, merchantId, isAdmin } = await requireSessionWithMerchant()

  // Users who signed up via Google land here without a merchant record.
  // Route them through /onboarding to collect business name + category.
  // Admins are exempt — they don't own a merchant of their own.
  if (!merchantId && !isAdmin) {
    redirect('/onboarding')
  }

  let merchantName: string | undefined
  let merchantSlug: string | undefined
  let merchantTier: string | undefined

  if (merchantId) {
    try {
      const merchant = await fetchMerchant(merchantId)
      merchantName = merchant.name
      merchantSlug = merchant.slug
      merchantTier = merchant.subscriptionTier
    } catch {
      // API may be offline during dev — proceed without merchant details
    }
  }

  return (
    <AppLangProvider>
      <MerchantProvider merchantId={merchantId ?? ''} merchantTier={merchantTier}>
        <DashboardShell
          user={session.user}
          merchantName={merchantName}
          merchantSlug={merchantSlug}
          merchantTier={merchantTier}
          isAdmin={isAdmin}
        >
          {children}
        </DashboardShell>
      </MerchantProvider>
    </AppLangProvider>
  )
}
