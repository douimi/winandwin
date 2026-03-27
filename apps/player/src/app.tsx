import { useCallback, useEffect, useState } from 'preact/hooks'
import { fetchGameConfig, fetchPlayerState, spinGame } from './api'
import { ActionScreen } from './components/action-screen'
import { AlreadyPlayedScreen } from './components/already-played'
import { LoadingScreen } from './components/loading-screen'
import { ResultScreen } from './components/result-screen'
import { Wheel, buildWheelSegments, findTargetIndex } from './components/wheel'
import { generateFingerprint } from './lib/fingerprint'
import type { GameConfig, PlayerScreen, PlayerState, SpinResult } from './types'

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
    // Expired — clean up
    localStorage.removeItem('winandwin_pending_action')
  } catch { /* ignore */ }
  return null
}

export function App() {
  const [screen, setScreen] = useState<PlayerScreen>('loading')
  const [config, setConfig] = useState<GameConfig | null>(null)
  const [completedActions, setCompletedActions] = useState<string[]>([])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<SpinResult | null>(null)
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  const [error, setError] = useState<{ kind: ErrorKind; message: string } | null>(null)
  const [fingerprintId, setFingerprintId] = useState<string | null>(null)
  const [playerState, setPlayerState] = useState<PlayerState | null>(null)
  const [preCompletedAction] = useState(() => {
    const slug = window.location.pathname.replace(/^\//, '') || 'demo'
    return checkPendingAction(slug)
  })

  // Extract merchant slug from URL path: /merchant-slug
  const slug = window.location.pathname.replace(/^\//, '') || 'demo'

  // Apply theme colors from config
  useEffect(() => {
    if (!config) return
    const root = document.documentElement
    root.style.setProperty('--primary', config.game.branding.primaryColor)
    root.style.setProperty('--secondary', config.game.branding.secondaryColor)
    root.style.setProperty(
      '--bg',
      `linear-gradient(135deg, ${config.game.branding.primaryColor} 0%, ${config.game.branding.secondaryColor} 100%)`
    )
    // Update theme-color meta tag
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', config.game.branding.primaryColor)
  }, [config])

  // Initialize: generate fingerprint, fetch config, fetch player state
  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        // Generate fingerprint first
        const fp = await generateFingerprint()
        if (cancelled) return
        setFingerprintId(fp)

        // Fetch game config and player state in parallel (with timeout)
        const [gameConfig, state] = await withTimeout(
          Promise.all([
            fetchGameConfig(slug),
            fetchPlayerState(slug, fp),
          ]),
        )
        if (cancelled) return

        setConfig(gameConfig)

        if (state) {
          setPlayerState(state)

          // Decide which screen to show based on server state
          if (IS_TEST_MODE) {
            // Test mode: always start from the beginning (full flow)
            setScreen('actions')
          } else if (!state.canPlay && state.playsToday >= state.maxPlaysPerDay) {
            // Player has already hit the daily limit — show already-played screen
            setScreen('already-played')
          } else if (state.completedActionsToday.length > 0) {
            // Player has completed actions today but hasn't played yet
            // Pre-populate completed actions and go to game screen
            setCompletedActions(state.completedActionsToday)
            setScreen('game')
          } else {
            // New player or no actions today — show action screen
            setScreen('actions')
          }
        } else {
          // No state returned (new player) — show actions
          setScreen('actions')
        }
      } catch (err) {
        if (!cancelled) {
          setError(classifyError(err))
        }
      }
    }

    init()
    return () => { cancelled = true }
  }, [slug])

  function handleActionsComplete(actions: string[]) {
    setCompletedActions(actions)
    setScreen('game')
  }

  async function handleSpin() {
    if (spinning || !config || !fingerprintId) return
    setSpinning(true)

    try {
      // Fetch result from API BEFORE animation (with timeout)
      const spinResult = await withTimeout(
        spinGame(slug, fingerprintId, completedActions, IS_TEST_MODE),
      )
      setResult(spinResult)

      // Find the correct display segment index (wheel has interleaved "Try Again" segments)
      const segments = buildWheelSegments(config.game.prizes)
      const idx = findTargetIndex(
        segments,
        spinResult.outcome,
        spinResult.prize?.name,
      )
      setTargetIndex(idx)
    } catch (err) {
      setError(classifyError(err))
      setSpinning(false)
    }
  }

  function handleSpinComplete(_targetIdx: number) {
    setSpinning(false)
    setScreen('result')
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
    const icon = error.kind === 'network' ? '📡' : error.kind === 'timeout' ? '⏳' : '😕'
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
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'loading' || !config) {
    return (
      <div class="app-container">
        <LoadingScreen />
      </div>
    )
  }

  return (
    <div class="app-container">
      {screen === 'actions' && (
        <ActionScreen config={config} onComplete={handleActionsComplete} preCompleted={preCompletedAction} />
      )}

      {screen === 'game' && (
        <div class="screen game-screen">
          {/* Sparkle particles in background */}
          <div class="game-sparkles">
            <div class="sparkle s1" />
            <div class="sparkle s2" />
            <div class="sparkle s3" />
            <div class="sparkle s4" />
            <div class="sparkle s5" />
            <div class="sparkle s6" />
          </div>

          <div class="game-header-banner">
            <div class="game-header-ornament left" />
            <h1 class="game-title">{config.game.name}</h1>
            <div class="game-header-ornament right" />
          </div>

          <p class="game-merchant-sub">{config.merchantName}</p>

          <Wheel
            prizes={config.game.prizes}
            branding={config.game.branding}
            spinning={spinning}
            onSpin={handleSpin}
            onSpinComplete={handleSpinComplete}
            targetIndex={targetIndex}
          />
        </div>
      )}

      {screen === 'result' && result && (
        <ResultScreen result={result} merchantName={config.merchantName} />
      )}

      {screen === 'already-played' && playerState && (
        <AlreadyPlayedScreen playerState={playerState} merchantName={config.merchantName} />
      )}
    </div>
  )
}
