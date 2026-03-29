import type { GameConfig } from '../types'

interface Props {
  config: GameConfig
  onPlay: () => void
}

export function WelcomeScreen({ config, onPlay }: Props) {
  const initial = config.merchantName?.charAt(0)?.toUpperCase() || '?'

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

      {/* Merchant name */}
      <h1 class="welcome-merchant-name">{config.merchantName}</h1>

      {/* Tagline */}
      <p class="welcome-tagline">
        {'merchantDescription' in config && config.merchantDescription
          ? String(config.merchantDescription)
          : 'Play and win exclusive prizes!'}
      </p>

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
