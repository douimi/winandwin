import { requireSessionWithMerchant } from '@/lib/session'
import { MerchantProvider } from '@/lib/merchant-context'
import { DashboardShell } from './dashboard-shell'
import { fetchMerchant } from '@/lib/api'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, merchantId } = await requireSessionWithMerchant()

  let merchantName: string | undefined
  let merchantSlug: string | undefined

  if (merchantId) {
    try {
      const merchant = await fetchMerchant(merchantId)
      merchantName = merchant.name
      merchantSlug = merchant.slug
    } catch {
      // API may be offline during dev — proceed without merchant details
    }
  }

  return (
    <MerchantProvider merchantId={merchantId ?? ''}>
      <DashboardShell
        user={session.user}
        merchantName={merchantName}
        merchantSlug={merchantSlug}
      >
        {children}
      </DashboardShell>
    </MerchantProvider>
  )
}
