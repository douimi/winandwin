'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

interface CouponInfo {
  code: string
  status: string
  prizeName: string
  prizeDescription: string | null
  merchantName: string
  validFrom: string
  validUntil: string
  redeemedAt: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ValidateCouponPage() {
  const params = useParams()
  const code = params?.code as string

  const [loading, setLoading] = useState(true)
  const [coupon, setCoupon] = useState<CouponInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [validating, setValidating] = useState(false)
  const [validated, setValidated] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return

    async function loadCoupon() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/coupons/lookup/${encodeURIComponent(code)}`)
        const json = await res.json()

        if (!json.success) {
          setError(json.error?.message || 'Coupon not found')
          return
        }

        setCoupon(json.data)
      } catch {
        setError('Unable to load coupon. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadCoupon()
  }, [code])

  async function handleValidate(e: React.FormEvent) {
    e.preventDefault()
    if (!pin || pin.length < 4) {
      setValidationError('Please enter a valid PIN (4-6 digits)')
      return
    }

    setValidating(true)
    setValidationError(null)

    try {
      const res = await fetch(`${API_BASE}/api/v1/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, pin }),
      })
      const json = await res.json()

      if (!json.success) {
        setValidationError(json.error?.message || 'Validation failed')
        return
      }

      setValidated(true)
      // Update local coupon state
      if (coupon) {
        setCoupon({ ...coupon, status: 'redeemed', redeemedAt: new Date().toISOString() })
      }
    } catch {
      setValidationError('Network error. Please try again.')
    } finally {
      setValidating(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loadingSpinner} />
          <p style={styles.loadingText}>Loading coupon...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconLarge}>{'\u274C'}</div>
          <h1 style={styles.title}>Coupon Not Found</h1>
          <p style={styles.subtitle}>{error}</p>
        </div>
      </div>
    )
  }

  if (!coupon) return null

  // Validated success state
  if (validated) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, borderColor: '#22c55e' }}>
          <div style={styles.successAnimation}>
            <div style={styles.iconLarge}>{'\u2705'}</div>
          </div>
          <h1 style={{ ...styles.title, color: '#16a34a' }}>Coupon Validated!</h1>
          <p style={styles.prizeName}>{coupon.prizeName}</p>
          <p style={styles.subtitle}>
            Successfully redeemed at {coupon.merchantName}
          </p>
          <div style={styles.divider} />
          <p style={styles.smallText}>
            Redeemed on {formatDateTime(new Date().toISOString())}
          </p>
        </div>
      </div>
    )
  }

  // Already redeemed
  if (coupon.status === 'redeemed') {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, borderColor: '#f59e0b' }}>
          <div style={styles.iconLarge}>{'\uD83D\uDD04'}</div>
          <h1 style={styles.title}>Already Redeemed</h1>
          <p style={styles.prizeName}>{coupon.prizeName}</p>
          <p style={styles.subtitle}>{coupon.merchantName}</p>
          <div style={styles.divider} />
          <p style={styles.smallText}>
            This coupon was redeemed on {coupon.redeemedAt ? formatDateTime(coupon.redeemedAt) : 'N/A'}
          </p>
        </div>
      </div>
    )
  }

  // Expired
  if (coupon.status === 'expired') {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, borderColor: '#ef4444' }}>
          <div style={styles.iconLarge}>{'\u23F0'}</div>
          <h1 style={styles.title}>Expired</h1>
          <p style={styles.prizeName}>{coupon.prizeName}</p>
          <p style={styles.subtitle}>{coupon.merchantName}</p>
          <div style={styles.divider} />
          <p style={styles.smallText}>
            This coupon expired on {formatDate(coupon.validUntil)}
          </p>
        </div>
      </div>
    )
  }

  // Revoked
  if (coupon.status === 'revoked') {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, borderColor: '#6b7280' }}>
          <div style={styles.iconLarge}>{'\uD83D\uDEAB'}</div>
          <h1 style={styles.title}>Coupon Revoked</h1>
          <p style={styles.subtitle}>This coupon is no longer valid.</p>
        </div>
      </div>
    )
  }

  // Active — show validation form
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconLarge}>{'\uD83C\uDF9F\uFE0F'}</div>
        <h1 style={styles.title}>Validate Coupon</h1>

        <div style={styles.couponInfo}>
          <p style={styles.prizeName}>{coupon.prizeName}</p>
          {coupon.prizeDescription && (
            <p style={styles.prizeDesc}>{coupon.prizeDescription}</p>
          )}
          <p style={styles.merchantBadge}>{coupon.merchantName}</p>
          <p style={styles.smallText}>
            Valid: {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
          </p>
        </div>

        <div style={styles.divider} />

        <form onSubmit={handleValidate} style={styles.form}>
          <label htmlFor="pin" style={styles.label}>
            Enter Store PIN
          </label>
          <input
            id="pin"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''))
              setValidationError(null)
            }}
            placeholder="Enter PIN"
            style={styles.pinInput}
            autoFocus
            autoComplete="off"
          />

          {validationError && (
            <p style={styles.errorText}>{validationError}</p>
          )}

          <button
            type="submit"
            disabled={validating || pin.length < 4}
            style={{
              ...styles.validateBtn,
              opacity: validating || pin.length < 4 ? 0.6 : 1,
              cursor: validating || pin.length < 4 ? 'not-allowed' : 'pointer',
            }}
          >
            {validating ? 'Validating...' : 'Validate Coupon'}
          </button>
        </form>

        <p style={styles.codeLabel}>
          Code: <strong>{coupon.code}</strong>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem 1.5rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '2px solid #e2e8f0',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.75rem',
  },
  iconLarge: {
    fontSize: '3rem',
    lineHeight: 1,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0,
  },
  prizeName: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#334155',
    margin: 0,
  },
  prizeDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0,
  },
  merchantBadge: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#6366f1',
    background: '#eef2ff',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    margin: 0,
  },
  couponInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
  },
  divider: {
    width: '100%',
    height: '1px',
    background: '#e2e8f0',
    margin: '0.5rem 0',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    alignItems: 'center',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#475569',
  },
  pinInput: {
    width: '100%',
    maxWidth: '200px',
    padding: '0.75rem 1rem',
    fontSize: '1.5rem',
    fontWeight: 700,
    textAlign: 'center' as const,
    letterSpacing: '0.3em',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    outline: 'none',
    background: '#f8fafc',
    color: '#1e293b',
    transition: 'border-color 0.2s',
  },
  validateBtn: {
    width: '100%',
    padding: '0.85rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  errorText: {
    fontSize: '0.8rem',
    color: '#ef4444',
    fontWeight: 500,
    margin: 0,
  },
  smallText: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    margin: 0,
  },
  codeLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    margin: 0,
    marginTop: '0.5rem',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0,
  },
  successAnimation: {
    animation: 'bounceIn 0.5s ease',
  },
}
