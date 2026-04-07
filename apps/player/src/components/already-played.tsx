import { useState, useEffect } from 'preact/hooks'
import { useT, getLocale } from '../lib/i18n'
import type { PlayerState } from '../types'
import type { BusinessTheme } from '../lib/business-themes'

interface Props {
  playerState: PlayerState
  merchantName: string
  businessTheme?: BusinessTheme
}

function formatDate(dateStr: string, locale?: string): string {
  return new Date(dateStr).toLocaleDateString(locale || 'en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return ''
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

export function AlreadyPlayedScreen({ playerState, merchantName, businessTheme }: Props) {
  const t = useT()
  const locale = getLocale()
  const won = playerState.lastPlayResult === 'win'
  const coupon = playerState.lastCoupon
  const validationUrl = coupon
    ? `https://winandwin.club/validate/${coupon.code}`
    : null

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (playerState.nextPlayAt) {
      return Math.max(0, new Date(playerState.nextPlayAt).getTime() - Date.now())
    }
    return 0
  })

  useEffect(() => {
    if (!playerState.nextPlayAt) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, new Date(playerState.nextPlayAt!).getTime() - Date.now())
      setTimeLeft(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [playerState.nextPlayAt])

  const canPlayNow = timeLeft <= 0 && !playerState.maxWinsReached

  return (
    <div class="screen already-played-screen">
      {won && coupon ? (
        <>
          <div class="already-played-emoji">{'\u{1F389}'}</div>
          <h1 class="already-played-title">{t.player.youWon}</h1>
          <p class="already-played-sub">
            {t.player.hereIsCoupon} {merchantName}
          </p>

          {/* Coupon Card */}
          <div class="coupon-card">
            <div class="coupon-perforation coupon-perforation-left" />
            <div class="coupon-perforation coupon-perforation-right" />
            <div class="coupon-inner">
              <p class="coupon-label">{t.player.couponCode}</p>
              <p class="coupon-code">{coupon.code}</p>
              <div class="coupon-divider" />
              <p class="coupon-validity">
                {t.player.validFrom} {formatDate(coupon.validFrom, locale)} {t.player.validUntil} {formatDate(coupon.validUntil, locale)}
              </p>
              <p class="coupon-instruction">
                {'\u{1F4F1}'} {t.player.showToStaff}
              </p>

              {validationUrl && (
                <div class="coupon-qr-wrap">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(validationUrl)}`}
                    alt="Coupon QR Code"
                    width={120}
                    height={120}
                    class="coupon-qr-img"
                  />
                  <p class="coupon-qr-note">
                    {t.player.scanToValidate}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Countdown */}
          {playerState.nextPlayAt && (
            <div class="countdown-section">
              {canPlayNow ? (
                <>
                  <p class="countdown-ready">{'\u{1F389}'} {t.player.playAgainNow}</p>
                  <button class="countdown-refresh-btn" onClick={() => window.location.reload()}>
                    {t.player.playNow}
                  </button>
                </>
              ) : (
                <>
                  <p class="countdown-label">{'\u{23F3}'} {t.player.comeBackIn}</p>
                  <p class="countdown-timer">{formatCountdown(timeLeft)}</p>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div class="already-played-emoji">{'\u{23F0}'}</div>
          <h1 class="already-played-title">
            {playerState.maxWinsReached ? t.player.maxWinsReached : t.player.alreadyPlayed}
          </h1>
          <p class="already-played-sub">
            {playerState.maxWinsReached
              ? `${t.player.maxWinsReached} — ${merchantName}`
              : `${t.player.alreadyPlayed} — ${merchantName}`}
          </p>

          {/* Countdown */}
          {!playerState.maxWinsReached && playerState.nextPlayAt && (
            <div class="countdown-section">
              {canPlayNow ? (
                <>
                  <p class="countdown-ready">{'\u{1F389}'} {t.player.playAgainNow}</p>
                  <button class="countdown-refresh-btn" onClick={() => window.location.reload()}>
                    {t.player.playNow}
                  </button>
                </>
              ) : (
                <>
                  <p class="countdown-label">{'\u{23F3}'} {t.player.comeBackIn}</p>
                  <p class="countdown-timer">{formatCountdown(timeLeft)}</p>
                </>
              )}
            </div>
          )}

          <div class="already-played-encourage">
            <span class="already-played-encourage-icon">{businessTheme?.accentEmoji || '\u{1F340}'}</span>
            <span>{businessTheme?.loseMessage || t.player.comeBackLater}</span>
          </div>
        </>
      )}
    </div>
  )
}
