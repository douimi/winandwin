'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@winandwin/ui'
import {
  fetchAdminMerchantDetail,
  updateAdminMerchant,
  resetMerchantPlays,
  deleteMerchant,
  type AdminMerchantDetail,
} from '@/lib/admin-api'
import { useAdmin } from '../../../admin-lang-context'
import type { AdminText } from '../../../admin-text'
import { TierChanger } from './tier-changer'

const TIER_STYLES: Record<string, string> = {
  free: 'border-gray-300 text-gray-600 bg-white',
  starter: 'border-blue-300 text-blue-700 bg-white',
  pro: 'border-indigo-300 text-indigo-700 bg-white',
  enterprise: 'border-amber-300 text-amber-700 bg-white',
}

function TierBadge({ tier }: { tier: string }) {
  const style = TIER_STYLES[tier] ?? TIER_STYLES.free
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}>
      {tier}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'border-green-300 text-green-600 bg-green-50',
    draft: 'border-gray-200 text-gray-500 bg-gray-50',
    paused: 'border-yellow-300 text-yellow-600 bg-yellow-50',
    ended: 'border-red-300 text-red-600 bg-red-50',
    redeemed: 'border-blue-300 text-blue-600 bg-blue-50',
    expired: 'border-red-300 text-red-600 bg-red-50',
    revoked: 'border-gray-200 text-gray-400 bg-gray-50',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${colors[status] ?? 'border-gray-200 text-gray-500 bg-gray-50'}`}>
      {status}
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  )
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmStyle,
  onConfirm,
  onCancel,
  loading,
  txt,
}: {
  title: string
  message: string
  confirmLabel: string
  confirmStyle?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  txt: AdminText
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {txt.commonCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${confirmStyle ?? 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading ? txt.commonProcessing : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminMerchantDetailPage() {
  const { txt } = useAdmin()
  const params = useParams<{ id: string }>()
  const [detail, setDetail] = useState<AdminMerchantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingDisabled, setTogglingDisabled] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function loadDetail() {
    if (!params.id) return
    setLoading(true)
    setError(null)
    fetchAdminMerchantDetail(params.id)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : txt.merchantDetailLoadFail))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDetail()
  }, [params.id])

  async function handleToggleDisabled() {
    if (!detail) return
    setTogglingDisabled(true)
    setFeedback(null)
    try {
      await updateAdminMerchant(detail.merchant.id, { disabled: !detail.merchant.disabled })
      setDetail((prev) =>
        prev
          ? { ...prev, merchant: { ...prev.merchant, disabled: !prev.merchant.disabled } }
          : prev,
      )
      setFeedback({
        type: 'success',
        message: detail.merchant.disabled ? txt.merchantDetailFeedbackEnabled : txt.merchantDetailFeedbackDisabled,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : txt.merchantDetailFeedbackUpdateFail,
      })
    } finally {
      setTogglingDisabled(false)
    }
  }

  async function handleResetPlays() {
    if (!detail) return
    setResetting(true)
    try {
      const result = await resetMerchantPlays(detail.merchant.id)
      setFeedback({
        type: 'success',
        message: `${result.deletedCount} ${txt.merchantDetailFeedbackResetOk}`,
      })
      setShowResetConfirm(false)
      loadDetail()
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : txt.merchantDetailFeedbackResetFail,
      })
    } finally {
      setResetting(false)
    }
  }

  async function handleDelete() {
    if (!detail) return
    setDeleting(true)
    try {
      await deleteMerchant(detail.merchant.id)
      window.location.assign('/admin/merchants')
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : txt.merchantDetailFeedbackDeleteFail,
      })
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <a href="/admin/merchants" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
          {'\u2190'} {txt.merchantDetailBack}
        </a>
        <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
          <CardContent className="py-12 text-center">
            <span className="text-3xl">{'\uD83D\uDEAB'}</span>
            <p className="mt-2 text-sm text-gray-500">{error ?? txt.merchantDetailNotFound}</p>
            <button
              type="button"
              onClick={loadDetail}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              {txt.commonRetry}
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { merchant, usage, games, coupons, playerCount, recentPlayers } = detail
  const activeGames = games.filter((g) => g.status === 'active').length
  const redeemedCoupons = coupons.filter((c) => c.status === 'redeemed').length

  const usagePercent = usage.monthlyLimit
    ? Math.round((usage.playsThisMonth / usage.monthlyLimit) * 100)
    : 0
  const usageBarColor =
    usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
  const usageTextColor =
    usagePercent > 90 ? 'text-red-600' : usagePercent > 70 ? 'text-yellow-600' : 'text-green-600'

  const statCards = [
    { label: txt.merchantDetailStatTotalPlayers, value: playerCount, icon: '\uD83D\uDC65' },
    { label: txt.merchantDetailStatTotalGames, value: games.length, icon: '\uD83C\uDFAE' },
    { label: txt.merchantDetailStatActiveGames, value: activeGames, icon: '\u25B6\uFE0F' },
    { label: txt.merchantDetailStatCouponsRedeemed, value: redeemedCoupons, icon: '\uD83C\uDF9F\uFE0F' },
  ]

  const playerAppUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname.replace('admin.', '')}`.replace(/:\d+$/, '') + `:${window.location.port}`
    : ''

  return (
    <div className="space-y-6">
      {/* Confirmation dialogs */}
      {showResetConfirm && (
        <ConfirmDialog
          title={txt.merchantDetailResetConfirmTitle}
          message={txt.merchantDetailResetConfirmBody}
          confirmLabel={txt.merchantDetailResetConfirmButton}
          onConfirm={handleResetPlays}
          onCancel={() => setShowResetConfirm(false)}
          loading={resetting}
          txt={txt}
        />
      )}
      {showDeleteConfirm && (
        <ConfirmDialog
          title={txt.merchantDetailDeleteConfirmTitle}
          message={txt.merchantDetailDeleteConfirmBody}
          confirmLabel={txt.merchantDetailDeleteConfirmButton}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleting}
          txt={txt}
        />
      )}

      {/* Back link */}
      <a href="/admin/merchants" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
        {'\u2190'} {txt.merchantDetailBack}
      </a>

      {/* Feedback banner */}
      {feedback && (
        <Card className={`rounded-xl ${feedback.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${feedback.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {feedback.message}
              </p>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                {'\u2715'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disabled Warning */}
      {merchant.disabled && (
        <Card className="border-2 border-red-300 bg-red-50 rounded-xl">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{'\u26A0\uFE0F'}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-700">{txt.merchantDetailDisabledBannerTitle}</p>
                <p className="text-sm text-red-600">
                  {txt.merchantDetailDisabledBannerBody}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleDisabled}
                disabled={togglingDisabled}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {togglingDisabled ? txt.merchantDetailEnabling : txt.merchantDetailEnableButton}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{merchant.name}</h1>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600 capitalize">
              {merchant.category}
            </span>
            <TierBadge tier={merchant.subscriptionTier} />
            {!merchant.disabled && (
              <span className="inline-flex items-center rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                {txt.merchantDetailStatActive}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {merchant.email} {merchant.phone && `\u00B7 ${merchant.phone}`}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {txt.merchantDetailSlug}: <code className="rounded bg-gray-100 border border-gray-200 px-1.5 py-0.5 text-xs text-indigo-600">{merchant.slug}</code>
            {' \u00B7 '}
            {txt.merchantDetailCreated} {new Date(merchant.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TierChanger merchantId={merchant.id} currentTier={merchant.subscriptionTier} />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Enable/Disable Toggle */}
            {!merchant.disabled && (
              <button
                type="button"
                onClick={handleToggleDisabled}
                disabled={togglingDisabled}
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {togglingDisabled ? txt.merchantDetailDisabling : txt.merchantDetailDisableButton}
              </button>
            )}

            {/* View Player Page \u2014 uses the same env var as the dashboard shell.
                Was href="/${slug}" which resolved to winandwin.club/${slug}
                (the merchant dashboard host) instead of the player app on
                winandwin-player.pages.dev, so the link was silently broken. */}
            <a
              href={`${process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001'}/${merchant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              {txt.merchantDetailViewPlayerPage} {'\u2197'}
            </a>

            {/* Reset Monthly Plays */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="rounded-lg border border-yellow-200 bg-white px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50 transition-colors"
            >
              {txt.merchantDetailResetPlays}
            </button>

            {/* Delete Merchant */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
            >
              {txt.merchantDetailDelete}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Card */}
      <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-gray-900">{txt.merchantDetailUsageTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-900">
              {usage.playsThisMonth.toLocaleString()}
            </span>
            <span className="text-gray-500">
              / {usage.monthlyLimit ? usage.monthlyLimit.toLocaleString() : txt.merchantDetailUsageUnlimited} {txt.merchantDetailUsagePlaysUnit}
            </span>
          </div>
          {usage.monthlyLimit ? (
            <>
              <div className="h-3 w-full max-w-lg rounded-full bg-gray-100">
                <div
                  className={`h-3 rounded-full transition-all ${usageBarColor}`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <p className={`mt-2 text-sm font-medium ${usageTextColor}`}>
                {usagePercent}{txt.merchantDetailUsagePercentUsed}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">{txt.merchantDetailUsageUnlimitedNote}</p>
          )}
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="border border-gray-200 bg-white shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</p>
                </div>
                <span className="text-xl">{s.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Games Table */}
      <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-gray-900">{txt.merchantDetailGamesTitle} ({games.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {games.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-2xl">{'\uD83C\uDFAE'}</span>
              <p className="mt-2 text-sm text-gray-500">{txt.merchantDetailGamesEmpty}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.overviewColName}</th>
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.merchantDetailColType}</th>
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.merchantsColStatus}</th>
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.merchantDetailColPlays}</th>
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.merchantDetailColCreated}</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((g, i) => (
                    <tr key={g.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{g.name}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{g.type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                      <td className="px-4 py-3 font-medium text-gray-700">{g.playsCount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(g.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Players */}
      <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-gray-900">{txt.merchantDetailPlayersTitle} ({playerCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPlayers.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-2xl">{'\uD83D\uDC65'}</span>
              <p className="mt-2 text-sm text-gray-500">{txt.merchantDetailPlayersEmpty}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.overviewColName}</th>
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.merchantDetailColEmail}</th>
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.merchantDetailColPlays}</th>
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.merchantDetailColWins}</th>
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.merchantDetailColLastSeen}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPlayers.map((p, i) => (
                    <tr key={p.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.name || txt.merchantDetailPlayerAnonymous}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{p.email || '-'}</td>
                      <td className="px-4 py-3 font-medium text-gray-700">{p.totalPlays}</td>
                      <td className="px-4 py-3 font-medium text-green-600">{p.totalWins}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.lastSeenAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {playerCount > recentPlayers.length && (
                <p className="mt-3 text-center text-xs text-gray-400">
                  {recentPlayers.length} {txt.merchantDetailPlayersShowingOf} {playerCount} {txt.merchantDetailPlayersShowingSuffix}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Coupons */}
      <Card className="border border-gray-200 bg-white shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-gray-900">{txt.merchantDetailCouponsTitle} ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-2xl">{'\uD83C\uDF9F\uFE0F'}</span>
              <p className="mt-2 text-sm text-gray-500">{txt.merchantDetailCouponsEmpty}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.merchantDetailColCode}</th>
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.merchantDetailColPrize}</th>
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.merchantsColStatus}</th>
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.merchantDetailColValidUntil}</th>
                    <th className="px-4 py-3 font-medium text-gray-500">{txt.merchantDetailColCreated}</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((cp, i) => (
                    <tr key={cp.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-900">{cp.code}</td>
                      <td className="px-4 py-3 text-gray-700">{cp.prizeName}</td>
                      <td className="px-4 py-3"><StatusBadge status={cp.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(cp.validUntil).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(cp.createdAt).toLocaleDateString()}</td>
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
