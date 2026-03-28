import { useState } from 'preact/hooks'

interface Props {
  onRegister: (name: string, email: string) => void
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function RegisterScreen({ onRegister }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  function handleSubmit(e: Event) {
    e.preventDefault()
    const newErrors: { name?: string; email?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = 'Please enter a valid email'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onRegister(name.trim(), email.trim())
  }

  return (
    <div class="screen register-screen">
      <div class="action-header">
        <div class="action-merchant-badge">
          <span style={{ fontSize: '2.5rem' }}>🎰</span>
        </div>
        <h1 class="action-merchant-name">Almost there!</h1>
        <p class="action-subtitle">Enter your details to spin the wheel</p>
      </div>

      <form class="register-form" onSubmit={handleSubmit}>
        <div class="register-field">
          <label class="register-label" htmlFor="reg-name">
            Your Name
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
            Email Address
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

        <p class="register-hint">Your coupon will be sent to this email</p>

        <button type="submit" class="register-submit">
          Continue to Game
        </button>
      </form>
    </div>
  )
}
