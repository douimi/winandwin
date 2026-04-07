import { useState } from 'preact/hooks'
import { useT } from '../lib/i18n'
import type { SpinResult } from '../types'

interface Props {
  onRegister: (name: string, email: string) => void
  result?: SpinResult | null
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function RegisterScreen({ onRegister, result }: Props) {
  const t = useT()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  function handleSubmit(e: Event) {
    e.preventDefault()
    const newErrors: { name?: string; email?: string } = {}

    if (!name.trim()) {
      newErrors.name = t.player.nameRequired
    }
    if (!email.trim()) {
      newErrors.email = t.player.emailRequired
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = t.player.validEmail
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onRegister(name.trim(), email.trim())
  }

  const prizeEmoji = result?.prize?.emoji || '\u{1F381}'
  const prizeName = result?.prize?.name || 'Your Prize'

  return (
    <div class="screen register-screen">
      {/* Subtle sparkle bg */}
      <div class="register-sparkle-bg" />

      <div class="register-header">
        <span class="register-congrats-emoji">{'\u{1F389}'}</span>
        <h1 class="register-congrats-title">{t.player.congratulations}</h1>
      </div>

      {/* Prize display card */}
      <div class="register-prize-card">
        <span class="register-prize-emoji">{prizeEmoji}</span>
        <span class="register-prize-name">{prizeName}</span>
      </div>

      <p class="register-intro">{t.player.enterDetails}</p>

      <form class="register-form" onSubmit={handleSubmit}>
        <div class="register-field">
          <label class="register-label" htmlFor="reg-name">
            {t.player.name}
          </label>
          <input
            id="reg-name"
            type="text"
            class={`register-input${errors.name ? ' invalid' : ''}`}
            placeholder="John Doe"
            value={name}
            onInput={(e) => {
              setName((e.target as HTMLInputElement).value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
            }}
            autocomplete="name"
          />
          {errors.name && <span class="register-error">{errors.name}</span>}
        </div>

        <div class="register-field">
          <label class="register-label" htmlFor="reg-email">
            {t.player.email}
          </label>
          <input
            id="reg-email"
            type="email"
            class={`register-input${errors.email ? ' invalid' : ''}`}
            placeholder="john@example.com"
            value={email}
            onInput={(e) => {
              setEmail((e.target as HTMLInputElement).value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            autocomplete="email"
          />
          {errors.email && <span class="register-error">{errors.email}</span>}
        </div>

        <div class="register-trust">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>{t.player.secureInfo}</span>
        </div>

        <button type="submit" class="register-submit">
          {t.player.claimPrize} {'\u2192'}
        </button>
      </form>
    </div>
  )
}
