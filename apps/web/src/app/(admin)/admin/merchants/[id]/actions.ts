'use server'

import { updateAdminMerchant } from '@/lib/admin-api'

export async function changeMerchantTier(merchantId: string, tier: string) {
  try {
    await updateAdminMerchant(merchantId, { subscriptionTier: tier })
    return { success: true, message: 'Tier updated successfully' }
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : 'Failed to update tier',
    }
  }
}
