'use client'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { useEffect, useState } from 'react'
import {
  fetchCoupons,
  fetchCouponStats,
  redeemCoupon,
  revokeCoupon,
  type CouponStats,
  type CouponWithDetails,
} from '@/lib/api'
import { useMerchantId } from '@/lib/merchant-context'

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  redeemed: 'bg-blue-100 text-blue-800',
  expired: 'bg-gray-100 text-gray-600',
  revoked: 'bg-red-100 text-red-800',
}

export default function CouponsPage() {
  const merchantId = useMerchantId()
  const [coupons, setCoupons] = useState<CouponWithDetails[]>([])
  const [stats, setStats] = useState<CouponStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function loadData() {
    if (!merchantId) {
      setLoading(false)
      return
    }
    try {
      const [couponData, statsData] = await Promise.all([
        fetchCoupons(merchantId),
        fetchCouponStats(merchantId),
      ])
      setCoupons(couponData)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [merchantId])

  async function handleRedeem(couponId: string) {
    setActionLoading(couponId)
    try {
      await redeemCoupon(couponId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem coupon')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRevoke(couponId: string) {
    setActionLoading(couponId)
    try {
      await revokeCoupon(couponId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke coupon')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading coupons...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Coupons</h1>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.active ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Redeemed This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.redeemedThisWeek ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Redemption Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.redemptionRate ?? 0}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-4xl">🎟️</p>
              <p className="mt-2 text-lg font-medium">No coupons yet</p>
              <p className="text-sm text-muted-foreground">
                Coupons will appear here when players win prizes
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Code</th>
                    <th className="pb-3 font-medium">Prize</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Valid Until</th>
                    <th className="pb-3 font-medium">Player</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b last:border-0">
                      <td className="py-3 font-mono font-semibold">{coupon.code}</td>
                      <td className="py-3">{coupon.prizeName}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[coupon.status] || ''}`}
                        >
                          {coupon.status}
                        </span>
                      </td>
                      <td className="py-3">{coupon.validUntil}</td>
                      <td className="py-3 text-muted-foreground">
                        {coupon.playerEmail || 'Anonymous'}
                      </td>
                      <td className="py-3">
                        {coupon.status === 'active' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading === coupon.id}
                              onClick={() => handleRedeem(coupon.id)}
                            >
                              {actionLoading === coupon.id ? '...' : 'Redeem'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading === coupon.id}
                              onClick={() => handleRevoke(coupon.id)}
                            >
                              {actionLoading === coupon.id ? '...' : 'Revoke'}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
