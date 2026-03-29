'use server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'
const ADMIN_KEY = process.env.ADMIN_API_KEY || ''

export async function changeMerchantTier(merchantId: string, tier: string) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/admin/merchants/${merchantId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_KEY,
      },
      body: JSON.stringify({ subscriptionTier: tier }),
    })
    const json = (await res.json()) as { success: boolean; error?: { message: string } }
    if (!json.success) {
      return { success: false, message: json.error?.message || 'Failed to update tier' }
    }
    return { success: true, message: 'Tier updated successfully' }
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : 'Failed to update tier',
    }
  }
}
