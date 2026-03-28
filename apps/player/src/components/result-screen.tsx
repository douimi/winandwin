import type { SpinResult } from '../types'
import { Confetti } from './confetti'

interface Props {
  result: SpinResult
  merchantName: string
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
}

function canShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export function ResultScreen({ result, merchantName }: Props) {
  const isWin = result.outcome === 'win'

  async function handleShare() {
    if (!result.coupon || !canShare()) return
    try {
      await navigator.share({
        title: `I won at ${merchantName}!`,
        text: `I won ${result.prize?.name || 'a prize'} at ${merchantName}! Code: ${result.coupon.code}`,
      })
    } catch {
      // User cancelled share
    }
  }

  if (isWin) {
    return (
      <div class="screen result-screen result-win">
        <Confetti />

        {/* Sparkle background */}
        <div class="result-sparkle-bg" />

        <div class="result-banner">
          <div class="result-banner-inner">
            <span class="result-banner-star">★</span>
            CONGRATULATIONS!
            <span class="result-banner-star">★</span>
          </div>
        </div>

        <div class="result-emoji">{result.prize?.emoji || '🎉'}</div>

        <h1 class="result-title result-title-win">You Won!</h1>

        <div class="result-prize-card">
          <div class="result-prize-emoji">{result.prize?.emoji || '🎁'}</div>
          <h2 class="result-prize-name">{result.prize?.name}</h2>
          {result.prize?.description && (
            <p class="result-prize-desc">{result.prize.description}</p>
          )}
        </div>

        {result.coupon && (
          <div class="coupon-card">
            <div class="coupon-perforation coupon-perforation-left" />
            <div class="coupon-perforation coupon-perforation-right" />
            <div class="coupon-inner">
              <p class="coupon-label">YOUR COUPON CODE</p>
              <p class="coupon-code">{result.coupon.code}</p>
              <div class="coupon-divider" />
              <p class="coupon-validity">
                Valid from {formatDate(result.coupon.validFrom)} to {formatDate(result.coupon.validUntil)}
              </p>
              <p class="coupon-instruction">
                Show this to staff to redeem your prize
              </p>
            </div>
          </div>
        )}

        {result.coupon && (
          <div class="coupon-qr-section">
            <img
              class="coupon-qr-image"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://winandwind.club/validate/${result.coupon.code}`)}`}
              alt="QR Code for coupon validation"
              width={160}
              height={160}
            />
            <p class="coupon-qr-text">Staff: scan to validate</p>
          </div>
        )}

        {canShare() && (
          <button class="share-button" onClick={handleShare} type="button">
            Share your win
          </button>
        )}
      </div>
    )
  }

  return (
    <div class="screen result-screen result-lose">
      <div class="result-emoji result-emoji-lose">🍀</div>

      <h1 class="result-title">Almost!</h1>

      <p class="lose-message">
        {result.message || "So close! You didn't win this time, but luck could be on your side next time!"}
      </p>

      <div class="lose-comeback">
        <div class="lose-comeback-icon">🕐</div>
        <span>Come back tomorrow for another chance!</span>
      </div>
    </div>
  )
}
