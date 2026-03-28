import type { SpinResult } from '../types'
import { Confetti } from './confetti'

interface Props {
  result: SpinResult
  merchantName: string
  playerEmail?: string | null
}

export function ResultScreen({ result, merchantName, playerEmail }: Props) {
  const isWin = result.outcome === 'win'

  if (isWin) {
    return (
      <div class="screen result-screen result-win">
        <Confetti />

        {/* Sparkle background */}
        <div class="result-sparkle-bg" />

        <div class="result-banner">
          <div class="result-banner-inner">
            <span class="result-banner-star">&#9733;</span>
            CONGRATULATIONS!
            <span class="result-banner-star">&#9733;</span>
          </div>
        </div>

        <div class="result-emoji">{result.prize?.emoji || '&#127881;'}</div>

        <h1 class="result-title result-title-win">You Won!</h1>

        <div class="result-prize-card">
          <div class="result-prize-emoji">{result.prize?.emoji || '&#127873;'}</div>
          <h2 class="result-prize-name">{result.prize?.name}</h2>
          {result.prize?.description && (
            <p class="result-prize-desc">{result.prize.description}</p>
          )}
        </div>

        {playerEmail && (
          <div class="result-email-sent">
            <div class="email-icon-animation">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="10" width="40" height="28" rx="4" stroke="white" stroke-width="2.5" fill="rgba(255,255,255,0.1)" />
                <path d="M4 14 L24 28 L44 14" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
              </svg>
            </div>
            <h3 class="result-email-title">Your prize is on its way!</h3>
            <p class="result-email-text">
              Check your email at <strong>{playerEmail}</strong> for your coupon code.
            </p>
            <p class="result-email-spam-note">
              Didn't receive it? Check your spam folder.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div class="screen result-screen result-lose">
      <div class="result-emoji result-emoji-lose">&#127808;</div>

      <h1 class="result-title">Almost!</h1>

      <p class="lose-message">
        {result.message || "So close! You didn't win this time, but luck could be on your side next time!"}
      </p>

      <div class="lose-comeback">
        <div class="lose-comeback-icon">&#128336;</div>
        <span>Come back tomorrow for another chance!</span>
      </div>
    </div>
  )
}
