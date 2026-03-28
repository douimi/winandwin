import type { GameConfig } from '../types'

interface Props {
  config: GameConfig
  onPlay: () => void
}

export function WelcomeScreen({ config, onPlay }: Props) {
  return (
    <div class="screen welcome-screen">
      {/* Background sparkle dots */}
      <div class="action-bg-pattern" />

      {config.merchantLogo && (
        <img
          class="welcome-merchant-logo"
          src={config.merchantLogo}
          alt={config.merchantName}
        />
      )}

      <h1 class="welcome-merchant-name">{config.merchantName}</h1>

      <p class="welcome-tagline">Play and win exclusive prizes!</p>

      <button class="welcome-play-btn" onClick={onPlay} type="button">
        <span class="welcome-play-btn-icon">&#9654;</span>
        <span class="welcome-play-btn-text">PLAY</span>
      </button>
    </div>
  )
}
