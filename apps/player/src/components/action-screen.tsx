import { useEffect, useRef, useState } from 'preact/hooks'
import type { GameConfig } from '../types'

interface SingleActionProps {
  config: GameConfig
  singleAction: GameConfig['requiredActions'][number]
  onComplete: (completedActions: string[]) => void
  preCompleted?: string | null
}

interface Props {
  config: GameConfig
  onComplete: (completedActions: string[]) => void
  preCompleted?: string | null
  /** Actions already completed in previous sessions (from server) */
  previouslyCompleted?: string[]
  /** If set, show only this single action */
  singleAction?: GameConfig['requiredActions'][number]
}

const ACTION_META: Record<string, { icon: string; label: string; hint: string }> = {
  google_review: { icon: '\u2B50', label: 'Leave us a Google Review', hint: 'Proof may be requested' },
  instagram_follow: { icon: '\uD83D\uDCF8', label: 'Follow us on Instagram', hint: 'Proof may be requested' },
  email_collect: { icon: '\u2709\uFE0F', label: 'Share your email', hint: '' },
  visit_stamp: { icon: '\uD83D\uDCCD', label: 'Visit stamp', hint: '' },
  receipt_photo: { icon: '\uD83E\uDDFE', label: 'Photograph your receipt', hint: '' },
}

const VERIFY_DURATION = 3000

function SingleActionScreen({ config, singleAction, onComplete, preCompleted }: SingleActionProps) {
  const [completed, setCompleted] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [emailExpanded, setEmailExpanded] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyDone, setVerifyDone] = useState(false)
  const receiptRef = useRef<HTMLInputElement>(null)

  // Auto-complete visit_stamp immediately
  useEffect(() => {
    if (singleAction.type === 'visit_stamp' && !completed) {
      setCompleted(true)
      // Auto-proceed after a short delay
      setTimeout(() => onComplete([singleAction.type]), 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // On mount, if preCompleted matches, start verification
  useEffect(() => {
    if (preCompleted && preCompleted === singleAction.type && !completed) {
      startVerification()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startVerification() {
    setVerifying(true)
    setVerifyDone(false)

    setTimeout(() => {
      setVerifyDone(true)
      setTimeout(() => {
        markComplete()
        setVerifying(false)
        setVerifyDone(false)
      }, 800)
    }, VERIFY_DURATION)
  }

  function markComplete() {
    setCompleted(true)
    // Auto-proceed after marking complete
    setTimeout(() => onComplete([singleAction.type]), 600)
  }

  function handleCardClick() {
    if (completed || verifying) return

    switch (singleAction.type) {
      case 'google_review': {
        const url = singleAction.config?.googlePlaceUrl
        if (url) {
          localStorage.setItem('winandwin_pending_action', JSON.stringify({
            type: singleAction.type,
            slug: window.location.pathname.replace(/^\//, ''),
            timestamp: Date.now(),
          }))
          window.location.href = url
        } else {
          setClicked(true)
        }
        break
      }
      case 'instagram_follow': {
        const handle = singleAction.config?.instagramHandle
        if (handle) {
          localStorage.setItem('winandwin_pending_action', JSON.stringify({
            type: singleAction.type,
            slug: window.location.pathname.replace(/^\//, ''),
            timestamp: Date.now(),
          }))
          window.location.href = `https://instagram.com/${handle}`
        } else {
          setClicked(true)
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
        break
      }
    }
  }

  function handleConfirmClick() {
    setClicked(false)
    startVerification()
  }

  function handleEmailSubmit() {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!isValid) {
      setEmailError(true)
      return
    }
    setEmailError(false)
    markComplete()
  }

  function handleReceiptChange(e: Event) {
    const input = e.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      markComplete()
    }
  }

  function getActionLabel() {
    const meta = ACTION_META[singleAction.type]
    return meta?.label || singleAction.label
  }

  function getActionIcon() {
    return ACTION_META[singleAction.type]?.icon || '\uD83D\uDCCB'
  }

  const isDone = completed
  const isVerifying = verifying
  const isVerifyDone = verifyDone
  const showConfirm = !isDone && !isVerifying && clicked && (singleAction.type === 'google_review' || singleAction.type === 'instagram_follow')
  const showEmail = singleAction.type === 'email_collect' && emailExpanded && !isDone

  return (
    <div class="screen action-screen">
      <div class="action-bg-pattern" />

      <div class="action-header">
        <div class="action-merchant-badge">
          <h1 class="action-merchant-name">{config.merchantName}</h1>
        </div>
        <p class="action-subtitle">
          Complete this action to play!
        </p>
      </div>

      <div class="action-list">
        <div class="action-card-wrapper">
          <button
            class={`single-action-card action-card${isDone ? ' completed' : ''}${isVerifying ? ' verifying-card' : ''}`}
            onClick={handleCardClick}
            type="button"
          >
            <span class="action-card-icon-circle">
              <span class="action-card-icon">
                {isDone ? '\u2705' : getActionIcon()}
              </span>
            </span>
            <span class="action-card-label">
              {getActionLabel()}
              {ACTION_META[singleAction.type]?.hint && !isDone && (
                <span class="action-card-hint">{ACTION_META[singleAction.type]!.hint}</span>
              )}
            </span>
            {singleAction.weight > 1 && (
              <span class="action-card-weight">+{singleAction.weight}pts</span>
            )}
            <span class="action-card-check">
              {isDone ? '\u2713' : ''}
            </span>

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

          <div class={`action-confirm-row${showConfirm ? ' open' : ''}`}>
            <button
              class="action-confirm-btn"
              onClick={handleConfirmClick}
              type="button"
            >
              {singleAction.type === 'google_review' ? "I've left my review" : "I've followed"}
            </button>
          </div>

          {singleAction.type === 'email_collect' && (
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
    </div>
  )
}

export function ActionScreen({ config, onComplete, preCompleted, previouslyCompleted, singleAction }: Props) {
  // If singleAction is provided, render the simplified single-action view
  if (singleAction) {
    return (
      <SingleActionScreen
        config={config}
        singleAction={singleAction}
        onComplete={onComplete}
        preCompleted={preCompleted}
      />
    )
  }

  // Legacy multi-action view (kept for backward compat)
  return (
    <MultiActionScreen
      config={config}
      onComplete={onComplete}
      preCompleted={preCompleted}
      previouslyCompleted={previouslyCompleted}
    />
  )
}

/** Original multi-action screen (backward compat) */
function MultiActionScreen({ config, onComplete, preCompleted, previouslyCompleted }: Omit<Props, 'singleAction'>) {
  const [completed, setCompleted] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const a of config.requiredActions) {
      if (a.type === 'visit_stamp') initial.add(a.type)
    }
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
          localStorage.setItem('winandwin_pending_action', JSON.stringify({
            type: action.type,
            slug: window.location.pathname.replace(/^\//, ''),
            timestamp: Date.now(),
          }))
          window.location.href = url
        } else {
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
    const meta = ACTION_META[action.type]
    return meta?.label || action.label
  }

  function getActionIcon(type: string) {
    return ACTION_META[type]?.icon || '\uD83D\uDCCB'
  }

  return (
    <div class="screen action-screen">
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
                    {isDone ? '\u2705' : getActionIcon(action.type)}
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
                  {isDone ? '\u2713' : ''}
                </span>

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

              <div class={`action-confirm-row${showConfirm ? ' open' : ''}`}>
                <button
                  class="action-confirm-btn"
                  onClick={() => handleConfirmClick(action.type)}
                  type="button"
                >
                  {action.type === 'google_review' ? "I've left my review" : "I've followed"}
                </button>
              </div>

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
          {canPlay ? '\uD83C\uDFAE  Play Now!' : `Complete ${config.minActionsRequired - completed.size} more`}
        </button>
      </div>
    </div>
  )
}
