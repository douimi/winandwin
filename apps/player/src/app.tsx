import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { fetchGameConfig, fetchPlayerState, spinGame, updatePlayerInfo, GameApiError } from './api'
import { ActionScreen } from './components/action-screen'
import { AlreadyPlayedScreen } from './components/already-played'
import { LoadingScreen } from './components/loading-screen'
import { RegisterScreen } from './components/register-screen'
import { ResultScreen } from './components/result-screen'
import { LimitReachedScreen } from './components/limit-reached'
import { MysteryBox } from './components/mystery-box'
import { Slots } from './components/slots'
import { Wheel, buildWheelSegments, findTargetIndex } from './components/wheel'
import { generateFingerprint, getHardwareFingerprint } from './lib/fingerprint'
import { setLocale, useT } from './lib/i18n'
import { getAtmosphere } from './lib/atmospheres'
import type { AtmosphereTheme } from './lib/atmospheres'
import { getBusinessTheme } from './lib/business-themes'
import type { GameConfig, PlayerScreen, PlayerState, SpinResult } from './types'

/** Action metadata for progress display */
const ACTION_META_MAP: Record<string, { icon: string; label: string }> = {
  google_review: { icon: '\u2B50', label: 'Google Review' },
  instagram_follow: { icon: '\uD83D\uDCF8', label: 'Instagram Follow' },
  email_collect: { icon: '\u2709\uFE0F', label: 'Share Email' },
  visit_stamp: { icon: '\uD83D\uDCCD', label: 'Visit Stamp' },
  receipt_photo: { icon: '\uD83E\uDDFE', label: 'Receipt Photo' },
  tripadvisor_review: { icon: '\uD83C\uDFE8', label: 'TripAdvisor Review' },
  facebook_like: { icon: '\uD83D\uDC4D', label: 'Facebook Like' },
  tiktok_follow: { icon: '\uD83C\uDFB5', label: 'TikTok Follow' },
  book_appointment: { icon: '\uD83D\uDCC5', label: 'Book Appointment' },
  whatsapp_join: { icon: '\uD83D\uDCAC', label: 'WhatsApp Join' },
  refer_friend: { icon: '\uD83D\uDC65', label: 'Refer a Friend' },
  survey_feedback: { icon: '\uD83D\uDCCB', label: 'Feedback' },
}

/** Classify errors into user-friendly categories */
type ErrorKind = 'network' | 'timeout' | 'api'

function classifyError(err: unknown): { kind: ErrorKind; message: string } {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return { kind: 'network', message: 'Check your connection and try again.' }
  }
  if (err instanceof DOMException && err.name === 'AbortError') {
    return { kind: 'timeout', message: 'The request took too long. Please try again.' }
  }
  if (err instanceof Error) {
    return { kind: 'api', message: err.message }
  }
  return { kind: 'api', message: 'Something went wrong. Please try again.' }
}

/** Wrap a promise with a timeout (default 10 seconds) */
function withTimeout<T>(promise: Promise<T>, ms = 10_000): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  return Promise.race([
    promise.then((v) => { clearTimeout(timeout); return v }),
    new Promise<never>((_, reject) => {
      controller.signal.addEventListener('abort', () => {
        clearTimeout(timeout)
        reject(new DOMException('Request timed out', 'AbortError'))
      })
    }),
  ])
}

/** Dev/test mode: add ?testmode=unlimited to bypass daily limits */
const IS_TEST_MODE = new URLSearchParams(window.location.search).get('testmode') === 'unlimited'

/** Check localStorage for a pending CTA action (user returned from external site) */
function checkPendingAction(slug: string): string | null {
  try {
    const raw = localStorage.getItem('winandwin_pending_action')
    if (!raw) return null
    const pending = JSON.parse(raw) as { type: string; slug: string; timestamp: number }
    // Must be for this merchant and within last 30 minutes
    if (pending.slug === slug && Date.now() - pending.timestamp < 30 * 60 * 1000) {
      localStorage.removeItem('winandwin_pending_action')
      return pending.type
    }
    // Expired -- clean up
    localStorage.removeItem('winandwin_pending_action')
  } catch { /* ignore */ }
  return null
}

/** Auto-trigger spin for mystery box when game screen loads */
function MysteryBoxAutoSpin({ onSpin }: { onSpin: () => void }) {
  useEffect(() => {
    onSpin()
  }, [])
  return null
}

/**
 * Pick ONE action to show this visit.
 * - Filter out actions in completedActionsEver
 * - Sort remaining by weight ASCENDING (weight = display order: 1 first, 2 second, etc.)
 * - Pick the first one
 * - If all done, return null (no more replays possible)
 */
function pickSingleAction(
  requiredActions: GameConfig['requiredActions'],
  completedActionsEver: string[],
): GameConfig['requiredActions'][number] | null {
  if (requiredActions.length === 0) return null

  // Sort by weight ascending: weight 1 is shown first, weight 2 second, etc.
  const sorted = [...requiredActions].sort((a, b) => a.weight - b.weight)

  // Filter out already-completed
  const remaining = sorted.filter((a) => !completedActionsEver.includes(a.type))

  if (remaining.length > 0) {
    return remaining[0]!
  }

  // All done -- no more replays
  return null
}

/** Apply atmosphere CSS custom properties to the document root */
function applyAtmosphereTheme(theme: AtmosphereTheme) {
  const root = document.documentElement
  root.style.setProperty('--atm-bg', theme.bgGradient)
  root.style.setProperty('--atm-text', theme.primaryText)
  root.style.setProperty('--atm-text-secondary', theme.secondaryText)
  root.style.setProperty('--atm-card-bg', theme.cardBg)
  root.style.setProperty('--atm-card-border', theme.cardBorder)
  root.style.setProperty('--atm-button-bg', theme.buttonBg)
  root.style.setProperty('--atm-button-text', theme.buttonText)
  root.style.setProperty('--atm-button-glow', theme.buttonGlow)
  root.style.setProperty('--atm-accent', theme.accentColor)
}

export function App() {
  const t = useT()
  const [screen, setScreen] = useState<PlayerScreen>('loading')
  const [config, setConfig] = useState<GameConfig | null>(null)
  const [completedActions, setCompletedActions] = useState<string[]>([])
  const [spinning, setSpinning] = useState(false)
  const [result, _setResult] = useState<SpinResult | null>(null)
  const resultRef = useRef<SpinResult | null>(null)
  const setResult = (r: SpinResult | null) => { resultRef.current = r; _setResult(r) }
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  const [error, setError] = useState<{ kind: ErrorKind; message: string } | null>(null)
  const [fingerprintId, setFingerprintId] = useState<string | null>(null)
  const [hardwareId, setHardwareId] = useState<string | null>(null)
  const [playerState, setPlayerState] = useState<PlayerState | null>(null)
  const [playerEmail, setPlayerEmail] = useState<string | null>(null)
  const [singleAction, setSingleAction] = useState<GameConfig['requiredActions'][number] | null>(null)
  const [showActionOverlay, setShowActionOverlay] = useState(false)
  const [showLoseAnimation, setShowLoseAnimation] = useState(false)
  const [preCompletedAction, setPreCompletedAction] = useState(() => {
    const s = window.location.pathname.replace(/^\//, '') || 'demo'
    return checkPendingAction(s)
  })

  // Extract merchant slug from URL path: /merchant-slug
  const slug = window.location.pathname.replace(/^\//, '') || 'demo'

  // Detect when user returns via back button (bfcache restoration on mobile)
  // Simply reload the page — the init flow will detect the pending action
  useEffect(() => {
    function handlePageShow(e: PageTransitionEvent) {
      if (e.persisted && localStorage.getItem('winandwin_pending_action')) {
        window.location.reload()
      }
    }
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && localStorage.getItem('winandwin_pending_action')) {
        window.location.reload()
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [slug, config])

  // Get the atmosphere theme from config
  const theme = useMemo(() => getAtmosphere(config?.atmosphere || 'joyful', config?.customColors), [config?.atmosphere, config?.customColors])

  // Get the business theme from merchant category
  const bizTheme = useMemo(
    () => getBusinessTheme(config?.merchantCategory || 'other'),
    [config?.merchantCategory],
  )

  // Apply atmosphere theme + branding colors from config
  useEffect(() => {
    if (!config) return
    const root = document.documentElement
    root.style.setProperty('--primary', config.game.branding.primaryColor)
    root.style.setProperty('--secondary', config.game.branding.secondaryColor)
    // Apply atmosphere as the main background instead of simple gradient
    applyAtmosphereTheme(theme)
    root.style.setProperty('--bg', theme.bgGradient)
    root.style.setProperty('--text', theme.primaryText)
    root.style.setProperty('--text-muted', theme.secondaryText)
    root.style.setProperty('--card-bg', theme.cardBg)
    root.style.setProperty('--card-border', theme.cardBorder)
    // Update theme-color meta tag
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', config.game.branding.primaryColor)
  }, [config, theme])

  // Initialize: generate fingerprint, fetch config, fetch player state
  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        // Generate fingerprints
        const fp = await generateFingerprint()
        const hw = getHardwareFingerprint()
        if (cancelled) return
        setFingerprintId(fp)
        setHardwareId(hw)

        // Fetch game config and player state in parallel (with timeout)
        const [gameConfig, state] = await withTimeout(
          Promise.all([
            fetchGameConfig(slug),
            fetchPlayerState(slug, fp, hw),
          ]),
        )
        if (cancelled) return

        setConfig(gameConfig)

        // Set locale from merchant language
        if (gameConfig.language) {
          setLocale(gameConfig.language)
        }

        // Check monthly limit
        if (gameConfig.monthlyLimitReached) {
          setScreen('limit-reached')
          return
        }

        if (state) {
          setPlayerState(state)

          // If returning from a CTA (preCompletedAction already captured from localStorage)
          if (preCompletedAction) {
            // Find the matching action and auto-show the overlay for verification
            const matchingAction = gameConfig.requiredActions.find(
              (a: { type: string }) => a.type === preCompletedAction
            )
            if (matchingAction) {
              setSingleAction(matchingAction)
              setShowActionOverlay(true)
            }
            setScreen('game')
          } else if (IS_TEST_MODE) {
            setScreen('game')
          } else if (state.hasWonInCooldown && !state.playerHasEmail) {
            // Won but haven't provided email yet -- show register to claim prize
            setResult({ outcome: 'win', prize: undefined, coupon: state.lastCoupon || undefined })
            setScreen('register')
          } else if (state.hasWonInCooldown) {
            // Won and already registered -- show already-played
            setScreen('already-played')
          } else if (state.allCtasCompleted) {
            // All CTAs completed -- no more replays possible
            setScreen('already-played')
          } else if (!state.canPlay && state.playsToday >= state.maxPlaysPerDay) {
            setScreen('already-played')
          } else if (state.completedActionsToday.length > 0) {
            setCompletedActions(state.completedActionsToday)
            setScreen('game')
          } else {
            setScreen('game')
          }
        } else {
          // No state returned (new player) -- go straight to game
          setScreen('game')
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof GameApiError && err.code === 'MERCHANT_DISABLED') {
            setScreen('merchant-disabled')
          } else {
            setError(classifyError(err))
          }
        }
      }
    }

    init()
    return () => { cancelled = true }
  }, [slug])

  /** When player tries to play (spin/pull/tap), check if CTA action is needed first */
  function handleGamePlayClick() {
    if (!config || spinning) return

    // Check if a NEW CTA needs to be completed for this play
    // Include both server-side completedActionsEver AND actions completed in this session
    const completedEver = playerState?.completedActionsEver ?? []
    const allCompletedSoFar = [...new Set([...completedEver, ...completedActions])]
    const action = pickSingleAction(config.requiredActions, allCompletedSoFar)

    // If no CTA needed (either all done or none configured), and we have
    // at least one action completed in this session, proceed to spin
    if (!action && completedActions.length > 0) {
      handleSpin()
      return
    }

    if (action) {
      setSingleAction(action)
      setShowActionOverlay(true)
    } else {
      // No actions configured -- spin directly
      handleSpin()
    }
  }

  function handleActionComplete(actions: string[]) {
    setCompletedActions(actions)
    // Close overlay and auto-trigger game play
    setShowActionOverlay(false)
    // Small delay to let the overlay close, then spin/play
    setTimeout(() => {
      handleSpinAfterAction(actions)
    }, 400)
  }

  /** Trigger spin after action is completed in overlay mode */
  function handleSpinAfterAction(actions: string[]) {
    if (spinning || !config || !fingerprintId) return
    setSpinning(true)

    withTimeout(
      spinGame(slug, fingerprintId, actions, IS_TEST_MODE, hardwareId ?? undefined),
    ).then((spinResult) => {
      setResult(spinResult)

      if (config.game.type === 'wheel') {
        const segments = buildWheelSegments(config.game.prizes, bizTheme.tryAgainText, bizTheme.tryAgainEmoji)
        const idx = findTargetIndex(segments, spinResult.outcome, spinResult.prize?.name)
        setTargetIndex(idx)
      } else {
        // For slots/mystery_box: set targetIndex so the game component can animate
        const idx = spinResult.outcome === 'win'
          ? config.game.prizes.findIndex(p => p.name === spinResult.prize?.name)
          : config.game.prizes.length // "lose" index = beyond prizes array
        setTargetIndex(idx >= 0 ? idx : 0)
      }
    }).catch((err) => {
      setError(classifyError(err))
      setSpinning(false)
    })
  }

  async function handleRegistration(name: string, email: string) {
    if (!fingerprintId) return
    setPlayerEmail(email)

    try {
      // Send name/email to API and trigger coupon email
      await withTimeout(
        updatePlayerInfo(slug, fingerprintId, name, email, hardwareId ?? undefined),
      )
    } catch (err) {
      // Don't block the flow -- still show the result
    }

    setScreen('result')
  }

  async function handleSpin() {
    if (spinning || !config || !fingerprintId) return
    setSpinning(true)

    try {
      // Fetch result from API BEFORE animation (with timeout)
      const spinResult = await withTimeout(
        spinGame(slug, fingerprintId, completedActions, IS_TEST_MODE, hardwareId ?? undefined),
      )
      setResult(spinResult)

      if (config.game.type === 'wheel') {
        // Find the correct display segment index (wheel has interleaved "Try Again" segments)
        const segments = buildWheelSegments(config.game.prizes, bizTheme.tryAgainText, bizTheme.tryAgainEmoji)
        const idx = findTargetIndex(
          segments,
          spinResult.outcome,
          spinResult.prize?.name,
        )
        setTargetIndex(idx)
      } else if (config.game.type === 'slots') {
        // For slots, find the prize index
        if (spinResult.outcome === 'win' && spinResult.prize) {
          const idx = config.game.prizes.findIndex((p) => p.name === spinResult.prize?.name)
          setTargetIndex(idx >= 0 ? idx : 0)
        } else {
          // Lose -- use an index beyond prizes to signal loss
          setTargetIndex(config.game.prizes.length)
        }
      } else if (config.game.type === 'mystery_box') {
        // For mystery box, find the prize index
        if (spinResult.outcome === 'win' && spinResult.prize) {
          const idx = config.game.prizes.findIndex((p) => p.name === spinResult.prize?.name)
          setTargetIndex(idx >= 0 ? idx : 0)
        } else {
          setTargetIndex(0)
        }
      }
    } catch (err) {
      setError(classifyError(err))
      setSpinning(false)
    }
  }

  function handleSpinComplete(_targetIdx: number) {
    setSpinning(false)

    // Use ref to get the latest result (avoids stale closure)
    const currentResult = resultRef.current
    if (currentResult?.outcome === 'win') {
      setScreen('register')
    } else {
      // Show lose animation overlay for 2.5s before going to result
      setShowLoseAnimation(true)
      setTimeout(() => {
        setShowLoseAnimation(false)
        setScreen('result')
      }, 2500)
    }
  }

  /** Check if a replay (try again) is possible: only in replay_with_ctas mode + uncompleted CTAs */
  function canTryAgain(): boolean {
    if (!config) return false
    // Only allow replay in "replay_with_ctas" mode
    if (config.ctaMode !== 'replay_with_ctas' && !IS_TEST_MODE) return false
    const completedEver = playerState?.completedActionsEver ?? []
    const allCompleted = [...new Set([...completedEver, ...completedActions])]
    const remaining = config.requiredActions.filter((a) => !allCompleted.includes(a.type))
    return remaining.length > 0
  }

  /** Handle "Try Again" from the lose screen — pick the next CTA */
  function handleTryAgain() {
    if (!config) return

    // Update completedActionsEver to include the just-completed actions
    const completedEver = [...new Set([...(playerState?.completedActionsEver ?? []), ...completedActions])]

    // Update player state so pickSingleAction has the latest data
    if (playerState) {
      setPlayerState({ ...playerState, completedActionsEver: completedEver })
    }

    const action = pickSingleAction(config.requiredActions, completedEver)

    if (action) {
      // Reset game state for a new play
      setResult(null)
      setTargetIndex(null)
      setCompletedActions([])
      setPreCompletedAction(null)
      setSingleAction(action)
      // Go to game screen and show CTA as overlay
      setScreen('game')
      // Small delay to ensure game screen is rendered first
      setTimeout(() => {
        setShowActionOverlay(true)
      }, 100)
    } else {
      // No more CTAs -- stay on result screen
      setScreen('already-played')
    }
  }

  const handleRetry = useCallback(() => {
    setError(null)
    setScreen('loading')
    setConfig(null)
    setResult(null)
    setTargetIndex(null)
    setSpinning(false)
    // Re-trigger the init effect by forcing a re-render
    window.location.reload()
  }, [])

  if (error) {
    const icon = error.kind === 'network' ? '\uD83D\uDCE1' : error.kind === 'timeout' ? '\u23F3' : '\uD83D\uDE15'
    const title =
      error.kind === 'network'
        ? 'No Connection'
        : error.kind === 'timeout'
          ? 'Request Timed Out'
          : 'Oops!'

    return (
      <div class="app-container">
        <div class="screen error-screen">
          <div class="error-icon">{icon}</div>
          <h1 class="error-title">{title}</h1>
          <p class="error-message">{error.message}</p>
          <button class="retry-button" onClick={handleRetry}>
            {t.common.tryAgain}
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'merchant-disabled') {
    return <MerchantDisabledScreen />
  }

  if (screen === 'loading' || !config) {
    return (
      <div class="app-container">
        <LoadingScreen />
      </div>
    )
  }

  const initial = config.merchantName?.charAt(0)?.toUpperCase() || '?'

  return (
    <div class="app-container">
      {/* Background image overlay (if configured) */}
      {config.game.branding.backgroundUrl && (
        <div
          class="bg-image-overlay"
          style={{
            backgroundImage: `url(${config.game.branding.backgroundUrl})`,
          }}
        />
      )}

      {screen === 'register' && (
        <RegisterScreen onRegister={handleRegistration} result={result} />
      )}

      {screen === 'game' && config.game.type === 'wheel' && (
        <div class="screen game-screen immersive-wheel-screen">
          {/* Floating themed emojis */}
          <div class="themed-bg-emojis">
            {bizTheme.bgEmojis.map((emoji, i) => (
              <span
                key={`biz-emoji-${i}`}
                class="themed-emoji"
                style={{
                  left: `${[5, 85, 10, 90, 15, 80, 25, 70][i % 8]}%`,
                  top: `${[10, 20, 40, 55, 70, 85, 30, 65][i % 8]}%`,
                  '--float-duration': `${5 + (i % 4) * 1.5}s`,
                  '--float-delay': `${i * 0.7}s`,
                  '--emoji-size': `${1.2 + (i % 3) * 0.4}rem`,
                  opacity: 0.08 + (i % 3) * 0.03,
                } as Record<string, string | number>}
              >
                {emoji}
              </span>
            ))}
          </div>

          {/* Sparkle particles in background */}
          <div class="game-sparkles">
            <div class="sparkle s1" />
            <div class="sparkle s2" />
            <div class="sparkle s3" />
            <div class="sparkle s4" />
            <div class="sparkle s5" />
            <div class="sparkle s6" />
          </div>

          {/* Merchant branding header */}
          <div class="immersive-header">
            {config.showLogo !== false && (
              <div class="immersive-logo-frame">
                {config.merchantLogo ? (
                  <img
                    class="immersive-logo-img"
                    src={config.merchantLogo}
                    alt={config.merchantName}
                  />
                ) : (
                  <span class="immersive-logo-initial">{initial}</span>
                )}
              </div>
            )}
            {config.showName !== false && (
              <p class="immersive-merchant-name">{config.merchantName}</p>
            )}
          </div>

          {/* Game title */}
          <h1 class="immersive-game-title" style={{ fontSize: theme.titleSize, fontWeight: theme.fontWeight }}>
            {config.game.name || bizTheme.defaultTitle}
          </h1>

          {/* Subtitle */}
          <p class="immersive-subtitle">{config.game.description || config.merchantDescription || bizTheme.defaultSubtitle}</p>

          {/* THE WHEEL — the hero of the page */}
          <Wheel
            prizes={config.game.prizes}
            branding={config.game.branding}
            spinning={spinning}
            onSpin={handleGamePlayClick}
            onSpinComplete={handleSpinComplete}
            targetIndex={targetIndex}
            wheelColors={theme.wheelColors}
            wheelBorder={theme.wheelBorder}
            wheelCenter={theme.wheelCenter}
            wheelText={theme.wheelText}
            businessTheme={bizTheme}
          />

          {/* Powered by */}
          <p class="immersive-powered">{t.player.poweredBy}</p>

          {/* Action overlay (bottom sheet) */}
          {showActionOverlay && singleAction && (
            <div class="action-overlay-backdrop" onClick={() => setShowActionOverlay(false)}>
              <div class="action-overlay-sheet" onClick={(e) => e.stopPropagation()}>
                <div class="action-overlay-handle" />

                {/* Action progression: show completed + current */}
                {config.requiredActions.length > 1 && (
                  <div class="action-progress-list">
                    {config.requiredActions
                      .sort((a, b) => (b.weight || 0) - (a.weight || 0))
                      .map((action) => {
                        const everCompleted = playerState?.completedActionsEver?.includes(action.type)
                        const isCurrent = action.type === singleAction.type
                        const meta = ACTION_META_MAP[action.type]
                        return (
                          <div
                            key={action.type}
                            class={`action-progress-item ${everCompleted ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                          >
                            <span class="action-progress-icon">
                              {everCompleted ? '\u2705' : (meta?.icon || '\u2B50')}
                            </span>
                            <span class="action-progress-label">
                              {meta?.label || action.type.replace(/_/g, ' ')}
                            </span>
                            {isCurrent && !everCompleted && (
                              <span class="action-progress-badge">{t.player.current}</span>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )}

                <ActionScreen
                  config={config}
                  onComplete={handleActionComplete}
                  preCompleted={preCompletedAction}
                  singleAction={singleAction}
                />
              </div>
            </div>
          )}

          {/* Lose animation overlay */}
          {showLoseAnimation && (
            <div class="lose-animation-overlay">
              <div class="lose-animation-content">
                <span class="lose-animation-emoji">{bizTheme?.accentEmoji || '\uD83C\uDF40'}</span>
                <h2 class="lose-animation-title">{bizTheme?.loseTitle || 'Almost!'}</h2>
                <p class="lose-animation-sub">{t.player.almostMessage}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {screen === 'game' && config.game.type !== 'wheel' && (
        <div class="screen game-screen immersive-game-screen">
          {/* Floating themed emojis */}
          <div class="themed-bg-emojis">
            {bizTheme.bgEmojis.map((emoji, i) => (
              <span
                key={`biz-emoji-${i}`}
                class="themed-emoji"
                style={{
                  left: `${[5, 85, 10, 90, 15, 80, 25, 70][i % 8]}%`,
                  top: `${[10, 20, 40, 55, 70, 85, 30, 65][i % 8]}%`,
                  '--float-duration': `${5 + (i % 4) * 1.5}s`,
                  '--float-delay': `${i * 0.7}s`,
                  '--emoji-size': `${1.2 + (i % 3) * 0.4}rem`,
                  opacity: 0.08 + (i % 3) * 0.03,
                } as Record<string, string | number>}
              >
                {emoji}
              </span>
            ))}
          </div>

          {/* Sparkle particles in background */}
          <div class="game-sparkles">
            <div class="sparkle s1" />
            <div class="sparkle s2" />
            <div class="sparkle s3" />
            <div class="sparkle s4" />
            <div class="sparkle s5" />
            <div class="sparkle s6" />
          </div>

          {/* Merchant branding header */}
          <div class="immersive-header">
            {config.showLogo !== false && (
              <div class="immersive-logo-frame">
                {config.merchantLogo ? (
                  <img
                    class="immersive-logo-img"
                    src={config.merchantLogo}
                    alt={config.merchantName}
                  />
                ) : (
                  <span class="immersive-logo-initial">{initial}</span>
                )}
              </div>
            )}
            {config.showName !== false && (
              <p class="immersive-merchant-name">{config.merchantName}</p>
            )}
          </div>

          {/* Game title */}
          <h1 class="immersive-game-title" style={{ fontSize: theme.titleSize, fontWeight: theme.fontWeight }}>
            {config.game.name || bizTheme.defaultTitle}
          </h1>

          {/* Subtitle */}
          <p class="immersive-subtitle">{config.game.description || config.merchantDescription || bizTheme.defaultSubtitle}</p>

          {config.game.type === 'slots' && (
            <Slots
              prizes={config.game.prizes}
              branding={config.game.branding}
              spinning={spinning}
              onSpin={handleGamePlayClick}
              onSpinComplete={handleSpinComplete}
              targetIndex={targetIndex}
            />
          )}

          {config.game.type === 'mystery_box' && (
            <MysteryBox
              prizes={config.game.prizes}
              branding={config.game.branding}
              onComplete={() => {
                setSpinning(false)
                const currentResult = resultRef.current
                if (currentResult?.outcome === 'win') {
                  setScreen('register')
                } else {
                  // Show lose animation overlay for 2.5s before going to result
                  setShowLoseAnimation(true)
                  setTimeout(() => {
                    setShowLoseAnimation(false)
                    setScreen('result')
                  }, 2500)
                }
              }}
              targetIndex={targetIndex}
              isWin={result?.outcome === 'win'}
            />
          )}

          {/* Mystery box: auto-trigger the game play flow when game screen loads */}
          {config.game.type === 'mystery_box' && !spinning && !result && (
            <MysteryBoxAutoSpin onSpin={handleGamePlayClick} />
          )}

          {/* Powered by */}
          <p class="immersive-powered">{t.player.poweredBy}</p>

          {/* Action overlay (bottom sheet) */}
          {showActionOverlay && singleAction && (
            <div class="action-overlay-backdrop" onClick={() => setShowActionOverlay(false)}>
              <div class="action-overlay-sheet" onClick={(e) => e.stopPropagation()}>
                <div class="action-overlay-handle" />

                {/* Action progression: show completed + current */}
                {config.requiredActions.length > 1 && (
                  <div class="action-progress-list">
                    {config.requiredActions
                      .sort((a, b) => (b.weight || 0) - (a.weight || 0))
                      .map((action) => {
                        const everCompleted = playerState?.completedActionsEver?.includes(action.type)
                        const isCurrent = action.type === singleAction.type
                        const meta = ACTION_META_MAP[action.type]
                        return (
                          <div
                            key={action.type}
                            class={`action-progress-item ${everCompleted ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                          >
                            <span class="action-progress-icon">
                              {everCompleted ? '\u2705' : (meta?.icon || '\u2B50')}
                            </span>
                            <span class="action-progress-label">
                              {meta?.label || action.type.replace(/_/g, ' ')}
                            </span>
                            {isCurrent && !everCompleted && (
                              <span class="action-progress-badge">{t.player.current}</span>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )}

                <ActionScreen
                  config={config}
                  onComplete={handleActionComplete}
                  preCompleted={preCompletedAction}
                  singleAction={singleAction}
                />
              </div>
            </div>
          )}

          {/* Lose animation overlay */}
          {showLoseAnimation && (
            <div class="lose-animation-overlay">
              <div class="lose-animation-content">
                <span class="lose-animation-emoji">{bizTheme?.accentEmoji || '\uD83C\uDF40'}</span>
                <h2 class="lose-animation-title">{bizTheme?.loseTitle || 'Almost!'}</h2>
                <p class="lose-animation-sub">{t.player.almostMessage}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {screen === 'result' && result && (
        <ResultScreen
          result={result}
          merchantName={config.merchantName}
          playerEmail={playerEmail}
          businessTheme={bizTheme}
          canTryAgain={result.outcome === 'lose' && canTryAgain()}
          onTryAgain={handleTryAgain}
        />
      )}

      {screen === 'already-played' && playerState && (
        <AlreadyPlayedScreen playerState={playerState} merchantName={config.merchantName} businessTheme={bizTheme} />
      )}

      {screen === 'limit-reached' && (
        <LimitReachedScreen merchantName={config.merchantName} />
      )}
    </div>
  )
}

function MerchantDisabledScreen() {
  return (
    <div class="app-container">
      <div class="screen" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{'\uD83D\uDEAB'}</div>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 800,
          marginBottom: '0.5rem',
          color: '#fff',
        }}>
          Game Unavailable
        </h1>
        <p style={{
          fontSize: '1.05rem',
          color: 'rgba(255,255,255,0.7)',
          maxWidth: '320px',
          lineHeight: 1.5,
          marginBottom: '1.5rem',
        }}>
          This game is currently unavailable. Please check back later or contact the business for more information.
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          maxWidth: '320px',
          width: '100%',
        }}>
          <p style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
          }}>
            We apologize for the inconvenience. The game may resume shortly.
          </p>
        </div>
        <p style={{
          marginTop: '2rem',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.4)',
        }}>
          Powered by Win & Win
        </p>
      </div>
    </div>
  )
}
