import { useEffect, useRef, useState } from 'preact/hooks'
import type { GameConfig } from '../types'

interface Props {
  config: GameConfig
  onComplete: (completedActions: string[]) => void
  preCompleted?: string | null
  /** Actions already completed in previous sessions (from server) */
  previouslyCompleted?: string[]
}

const ACTION_META: Record<string, { icon: string; label: string; hint: string }> = {
  google_review: { icon: '⭐', label: 'Leave us a Google Review', hint: 'Proof may be requested' },
  instagram_follow: { icon: '📸', label: 'Follow us on Instagram', hint: 'Proof may be requested' },
  email_collect: { icon: '✉️', label: 'Share your email', hint: '' },
  visit_stamp: { icon: '📍', label: 'Visit stamp', hint: '' },
  receipt_photo: { icon: '🧾', label: 'Photograph your receipt', hint: '' },
}

const VERIFY_DURATION = 3000

export function ActionScreen({ config, onComplete, preCompleted, previouslyCompleted }: Props) {
  const [completed, setCompleted] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    // Auto-complete visit_stamp
    for (const a of config.requiredActions) {
      if (a.type === 'visit_stamp') initial.add(a.type)
    }
    // Auto-complete actions done in previous sessions
    if (previouslyCompleted) {
      for (const action of previouslyCompleted) {
        initial.add(action)
      }
    }
    return initial
  })
  const [clicked, setClicked] = useState<Set<string>>(new Set())
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [emailExpanded, setEmailExpanded] = useState(false)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [verifyDone, setVerifyDone] = useState<string | null>(null)
  const receiptRef = useRef<HTMLInputElement>(null)

  const canPlay = completed.size >= config.minActionsRequired

  // On mount, if preCompleted is set, start verification animation
  useEffect(() => {
    if (preCompleted && !completed.has(preCompleted)) {
      startVerification(preCompleted)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startVerification(type: string) {
    setVerifying(type)
    setVerifyDone(null)

    setTimeout(() => {
      setVerifyDone(type)
      // After a brief pause showing the checkmark, mark complete
      setTimeout(() => {
        markComplete(type)
        setVerifying(null)
        setVerifyDone(null)
      }, 800)
    }, VERIFY_DURATION)
  }

  function markComplete(type: string) {
    setCompleted((prev) => {
      const next = new Set(prev)
      next.add(type)
      return next
    })
  }

  function handleCardClick(action: typeof config.requiredActions[number]) {
    if (completed.has(action.type) || verifying === action.type) return

    switch (action.type) {
      case 'google_review': {
        const url = action.config?.googlePlaceUrl
        if (url) {
          // Save pending action so we auto-complete when user returns
          localStorage.setItem('winandwin_pending_action', JSON.stringify({
            type: action.type,
            slug: window.location.pathname.replace(/^\//, ''),
            timestamp: Date.now(),
          }))
          window.location.href = url
        } else {
          // No URL configured — allow manual confirmation
          setClicked((prev) => new Set(prev).add(action.type))
        }
        break
      }
      case 'instagram_follow': {
        const handle = action.config?.instagramHandle
        if (handle) {
          localStorage.setItem('winandwin_pending_action', JSON.stringify({
            type: action.type,
            slug: window.location.pathname.replace(/^\//, ''),
            timestamp: Date.now(),
          }))
          window.location.href = `https://instagram.com/${handle}`
        } else {
          setClicked((prev) => new Set(prev).add(action.type))
        }
        break
      }
      case 'email_collect': {
        setEmailExpanded(true)
        break
      }
      case 'receipt_photo': {
        receiptRef.current?.click()
        break
      }
      case 'visit_stamp': {
        // Already auto-completed
        break
      }
    }
  }

  function handleConfirmClick(type: string) {
    setClicked((prev) => {
      const next = new Set(prev)
      next.delete(type)
      return next
    })
    startVerification(type)
  }

  function handleEmailSubmit() {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!isValid) {
      setEmailError(true)
      return
    }
    setEmailError(false)
    markComplete('email_collect')
  }

  function handleReceiptChange(e: Event) {
    const input = e.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      markComplete('receipt_photo')
    }
  }

  function getActionLabel(action: typeof config.requiredActions[number]) {
    // Use custom label from config if available, otherwise use our defaults
    const meta = ACTION_META[action.type]
    return meta?.label || action.label
  }

  function getActionIcon(type: string) {
    return ACTION_META[type]?.icon || '📋'
  }

  return (
    <div class="screen action-screen">
      {/* Background sparkle dots */}
      <div class="action-bg-pattern" />

      <div class="action-header">
        <div class="action-merchant-badge">
          <h1 class="action-merchant-name">{config.merchantName}</h1>
        </div>
        <p class="action-subtitle">
          Complete {config.minActionsRequired === 1 ? 'an action' : `${config.minActionsRequired} actions`} to unlock your game!
        </p>
      </div>

      <div class="action-list">
        {config.requiredActions.map((action) => {
          const isDone = completed.has(action.type)
          const isVerifying = verifying === action.type
          const isVerifyDone = verifyDone === action.type
          const wasClicked = clicked.has(action.type)
          const showConfirm = !isDone && !isVerifying && wasClicked && (action.type === 'google_review' || action.type === 'instagram_follow')
          const showEmail = action.type === 'email_collect' && emailExpanded && !isDone

          return (
            <div key={action.type} class="action-card-wrapper">
              <button
                class={`action-card${isDone ? ' completed' : ''}${isVerifying ? ' verifying-card' : ''}`}
                onClick={() => handleCardClick(action)}
                type="button"
              >
                <span class="action-card-icon-circle">
                  <span class="action-card-icon">
                    {isDone ? '✅' : getActionIcon(action.type)}
                  </span>
                </span>
                <span class="action-card-label">
                  {getActionLabel(action)}
                  {ACTION_META[action.type]?.hint && !isDone && (
                    <span class="action-card-hint">{ACTION_META[action.type]!.hint}</span>
                  )}
                </span>
                {action.weight > 1 && (
                  <span class="action-card-weight">+{action.weight}pts</span>
                )}
                <span class="action-card-check">
                  {isDone ? '✓' : ''}
                </span>

                {/* Verification overlay */}
                {isVerifying && (
                  <div class="action-verifying">
                    <div class="verify-content">
                      <div class={`verify-spinner${isVerifyDone ? ' done' : ''}`}>
                        {isVerifyDone ? (
                          <svg class="verify-checkmark" viewBox="0 0 24 24" width="28" height="28">
                            <path d="M5 13l4 4L19 7" fill="none" stroke="#4ade80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                        ) : (
                          <div class="verify-spin-icon" />
                        )}
                      </div>
                      <span class="verify-text">
                        {isVerifyDone ? 'Action verified!' : 'Verifying your action...'}
                      </span>
                    </div>
                    <div class="verify-progress-track">
                      <div class={`verify-progress${isVerifyDone ? ' complete' : ''}`} />
                    </div>
                  </div>
                )}
              </button>

              {/* Confirm button for review/follow */}
              <div class={`action-confirm-row${showConfirm ? ' open' : ''}`}>
                <button
                  class="action-confirm-btn"
                  onClick={() => handleConfirmClick(action.type)}
                  type="button"
                >
                  {action.type === 'google_review' ? "I've left my review" : "I've followed"}
                </button>
              </div>

              {/* Email input */}
              {action.type === 'email_collect' && (
                <div class={`action-email-row${showEmail ? ' open' : ''}`}>
                  <div class="action-email-form">
                    <input
                      type="email"
                      class={`action-email-input${emailError ? ' invalid' : ''}`}
                      placeholder="you@email.com"
                      value={email}
                      onInput={(e) => {
                        setEmail((e.target as HTMLInputElement).value)
                        setEmailError(false)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEmailSubmit()
                      }}
                    />
                    <button
                      class="action-email-submit"
                      onClick={handleEmailSubmit}
                      type="button"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Hidden receipt file input */}
      <input
        ref={receiptRef}
        class="receipt-file-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleReceiptChange}
      />

      <div class="play-button-wrap">
        <p class="play-progress">
          {completed.size}/{config.minActionsRequired} action{config.minActionsRequired !== 1 ? 's' : ''} completed
        </p>
        <button
          class={`play-button${canPlay ? ' ready' : ''}`}
          disabled={!canPlay}
          onClick={() => canPlay && onComplete(Array.from(completed))}
          type="button"
        >
          {canPlay ? '🎮  Play Now!' : `Complete ${config.minActionsRequired - completed.size} more`}
        </button>
      </div>
    </div>
  )
}
