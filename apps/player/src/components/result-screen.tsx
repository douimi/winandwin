import type { SpinResult } from '../types'
import type { BusinessTheme } from '../lib/business-themes'
import { useT } from '../lib/i18n'
import { Confetti } from './confetti'

interface Props {
  result: SpinResult
  merchantName: string
  playerEmail?: string | null
  businessTheme?: BusinessTheme
  canTryAgain?: boolean
  onTryAgain?: () => void
}

export function ResultScreen({ result, merchantName, playerEmail, businessTheme, canTryAgain, onTryAgain }: Props) {
  const t = useT()
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
            {t.player.congratulations.toUpperCase()}
            <span class="result-banner-star">&#9733;</span>
          </div>
        </div>

        <div class="result-emoji">{result.prize?.emoji || '\u{1F389}'}</div>

        <h1 class="result-title result-title-win">{businessTheme?.winTitle || t.player.youWon}</h1>

        <div class="result-prize-card">
          <div class="result-prize-emoji">{result.prize?.emoji || '\u{1F381}'}</div>
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
            <h3 class="result-email-title">{t.player.prizeOnItsWay}</h3>
            <p class="result-email-text">
              {t.player.checkEmailAt} <strong>{playerEmail}</strong> {t.player.forCouponCode}
            </p>
            <p class="result-email-spam-note">
              {t.player.checkSpam}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div class="screen result-screen result-lose">
      <div class="result-emoji result-emoji-lose">{'\u{1F340}'}</div>

      <h1 class="result-title">{businessTheme?.loseTitle || t.player.soClose}</h1>

      <p class="lose-message">
        {result.message || businessTheme?.loseMessage || t.player.betterLuckNextTime}
      </p>

      {canTryAgain && onTryAgain ? (
        <div class="lose-comeback">
          <button
            class="try-again-button"
            onClick={onTryAgain}
            type="button"
          >
            {'\u{1F504}'} {t.player.tryAgain}
          </button>
          <p class="try-again-hint">{t.player.tryAgainMessage}</p>
        </div>
      ) : (
        <div class="lose-comeback">
          <div class="lose-comeback-icon">{'\u{1F31F}'}</div>
          <span>{businessTheme?.loseMessage || t.player.comeBackTomorrow}</span>
        </div>
      )}

      <p class="lose-encourage">
        {businessTheme?.accentEmoji || '\u{1F60A}'} {t.player.betterLuckAt} {merchantName}!
      </p>
    </div>
  )
}
