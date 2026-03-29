import type { GameConfig } from '../types'
import type { BusinessTheme } from '../lib/business-themes'

interface Props {
  config: GameConfig
  onPlay: () => void
  businessTheme?: BusinessTheme
}

export function WelcomeScreen({ config, onPlay, businessTheme }: Props) {
  const initial = config.merchantName?.charAt(0)?.toUpperCase() || '?'

  const tagline = ('merchantDescription' in config && config.merchantDescription)
    ? String(config.merchantDescription)
    : (businessTheme?.defaultSubtitle || 'Play and win exclusive prizes!')

  return (
    <div class="screen welcome-screen">
      {/* Animated radial glow */}
      <div class="welcome-glow" />

      {/* Rotating dot ring */}
      <div class="welcome-dot-ring">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            class="welcome-dot"
            style={{
              transform: `rotate(${i * 15}deg) translateY(-120px)`,
            }}
          />
        ))}
      </div>

      {/* Merchant logo or initial */}
      <div class="welcome-logo-frame">
        {config.merchantLogo ? (
          <img
            class="welcome-logo-img"
            src={config.merchantLogo}
            alt={config.merchantName}
          />
        ) : (
          <span class="welcome-logo-initial">{initial}</span>
        )}
      </div>

      {/* Merchant name with accent emoji */}
      <h1 class="welcome-merchant-name">
        {businessTheme && <span class="welcome-accent-emoji">{businessTheme.accentEmoji} </span>}
        {config.merchantName}
      </h1>

      {/* Tagline */}
      <p class="welcome-tagline">{tagline}</p>

      {/* PLAY button */}
      <button class="welcome-play-btn" onClick={onPlay} type="button">
        <span class="welcome-play-ring" />
        <span class="welcome-play-inner">PLAY</span>
      </button>

      <p class="welcome-tap-hint">Tap to start</p>

      {/* Powered by */}
      <p class="welcome-powered">Powered by Win &amp; Win</p>
    </div>
  )
}
