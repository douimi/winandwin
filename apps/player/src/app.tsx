import { useCallback, useEffect, useState } from 'preact/hooks'
import { fetchGameConfig, fetchPlayerState, spinGame, updatePlayerInfo } from './api'
import { ActionScreen } from './components/action-screen'
import { AlreadyPlayedScreen } from './components/already-played'
import { LoadingScreen } from './components/loading-screen'
import { RegisterScreen } from './components/register-screen'
import { ResultScreen } from './components/result-screen'
import { WelcomeScreen } from './components/welcome-screen'
import { MysteryBox } from './components/mystery-box'
import { Slots } from './components/slots'
import { Wheel, buildWheelSegments, findTargetIndex } from './components/wheel'
import { generateFingerprint, getHardwareFingerprint } from './lib/fingerprint'
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
 * - Sort remaining by weight (highest first)
 * - Pick the first one
 * - If all done, pick the one with highest weight
 */
function pickSingleAction(
  requiredActions: GameConfig['requiredActions'],
  completedActionsEver: string[],
): GameConfig['requiredActions'][number] | null {
  if (requiredActions.length === 0) return null

  const sorted = [...requiredActions].sort((a, b) => b.weight - a.weight)

  // Filter out already-completed
  const remaining = sorted.filter((a) => !completedActionsEver.includes(a.type))

  if (remaining.length > 0) {
    return remaining[0]!
  }

  // All done -- pick highest weight
  return sorted[0]!
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
  const [hardwareId, setHardwareId] = useState<string | null>(null)
  const [playerState, setPlayerState] = useState<PlayerState | null>(null)
  const [playerEmail, setPlayerEmail] = useState<string | null>(null)
  const [singleAction, setSingleAction] = useState<GameConfig['requiredActions'][number] | null>(null)
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

        if (state) {
          setPlayerState(state)

          // Decide which screen to show based on server state
          if (IS_TEST_MODE) {
            // Test mode: always start from welcome
            setScreen('welcome')
          } else if (!state.canPlay && state.playsToday >= state.maxPlaysPerDay) {
            // Player has already hit the daily limit
            setScreen('already-played')
          } else if (state.completedActionsToday.length > 0) {
            // Player has completed actions today but hasn't played yet
            // Pre-populate completed actions and go to game screen
            setCompletedActions(state.completedActionsToday)
            setScreen('game')
          } else {
            // New player or no actions today -- show welcome
            setScreen('welcome')
          }
        } else {
          // No state returned (new player) -- show welcome
          setScreen('welcome')
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

  function handlePlayClick() {
    if (!config) return

    // Determine which single action to show
    const completedEver = playerState?.completedActionsEver ?? []
    const action = pickSingleAction(config.requiredActions, completedEver)

    if (action) {
      setSingleAction(action)
      setScreen('action')
    } else {
      // No actions configured -- go straight to game
      setScreen('game')
    }
  }

  function handleActionComplete(actions: string[]) {
    setCompletedActions(actions)
    setScreen('game')
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
      console.error('Failed to update player info:', err)
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
        const segments = buildWheelSegments(config.game.prizes)
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

    if (result?.outcome === 'win') {
      // Win: ask for name + email before showing result
      setScreen('register')
    } else {
      // Lose: show result directly
      setScreen('result')
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
      {screen === 'welcome' && (
        <WelcomeScreen config={config} onPlay={handlePlayClick} />
      )}

      {screen === 'action' && singleAction && (
        <ActionScreen
          config={config}
          onComplete={handleActionComplete}
          preCompleted={preCompletedAction}
          singleAction={singleAction}
        />
      )}

      {/* Legacy multi-action screen (backward compat) */}
      {screen === 'actions' && (
        <ActionScreen
          config={config}
          onComplete={handleActionComplete}
          preCompleted={preCompletedAction}
          previouslyCompleted={playerState?.completedActionsEver}
        />
      )}

      {screen === 'register' && (
        <RegisterScreen onRegister={handleRegistration} result={result} />
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

          {config.game.type === 'wheel' && (
            <Wheel
              prizes={config.game.prizes}
              branding={config.game.branding}
              spinning={spinning}
              onSpin={handleSpin}
              onSpinComplete={handleSpinComplete}
              targetIndex={targetIndex}
            />
          )}

          {config.game.type === 'slots' && (
            <Slots
              prizes={config.game.prizes}
              branding={config.game.branding}
              spinning={spinning}
              onSpin={handleSpin}
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
                if (result?.outcome === 'win') {
                  setScreen('register')
                } else {
                  setScreen('result')
                }
              }}
              targetIndex={targetIndex}
              isWin={result?.outcome === 'win'}
            />
          )}

          {/* Mystery box: auto-trigger spin API when game screen loads */}
          {config.game.type === 'mystery_box' && !spinning && !result && (
            <MysteryBoxAutoSpin onSpin={handleSpin} />
          )}
        </div>
      )}

      {screen === 'result' && result && (
        <ResultScreen result={result} merchantName={config.merchantName} playerEmail={playerEmail} />
      )}

      {screen === 'already-played' && playerState && (
        <AlreadyPlayedScreen playerState={playerState} merchantName={config.merchantName} />
      )}
    </div>
  )
}
