import type { PlayerState } from '../types'

interface Props {
  playerState: PlayerState
  merchantName: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AlreadyPlayedScreen({ playerState, merchantName }: Props) {
  const won = playerState.lastPlayResult === 'win'
  const coupon = playerState.lastCoupon
  const validationUrl = coupon
    ? `https://winandwind.club/validate/${coupon.code}`
    : null

  return (
    <div class="screen already-played-screen">
      {won && coupon ? (
        <>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🎉</div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            marginBottom: '0.25rem',
          }}>
            You Won!
          </h1>
          <p style={{
            opacity: 0.85,
            fontSize: '0.95rem',
            marginBottom: '1.5rem',
          }}>
            Here's your coupon from {merchantName}
          </p>

          {/* Coupon Card — styled like a physical voucher */}
          <div style={{
            width: '100%',
            maxWidth: '340px',
            background: '#fffdf5',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '2px dashed #d4a853',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: '#8b7355',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              fontWeight: 600,
            }}>
              Your Coupon Code
            </p>
            <p style={{
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '0.2em',
              fontFamily: 'monospace',
              color: '#1a1a2e',
              background: 'linear-gradient(135deg, #f0e6d0, #fff8e7)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              margin: '0.5rem 0',
              border: '1px solid #e0d0b0',
            }}>
              {coupon.code}
            </p>

            <div style={{
              borderTop: '1px dashed #d0c0a0',
              marginTop: '1rem',
              paddingTop: '0.75rem',
            }}>
              <p style={{
                fontSize: '0.8rem',
                color: '#6b5c45',
              }}>
                Valid from {formatDate(coupon.validFrom)} to {formatDate(coupon.validUntil)}
              </p>
            </div>

            <p style={{
              fontSize: '0.75rem',
              color: '#8b7355',
              marginTop: '0.75rem',
            }}>
              📱 Show this to staff to redeem your prize
            </p>

            {validationUrl && (
              <div style={{ marginTop: '1rem' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(validationUrl)}`}
                  alt="Coupon QR Code"
                  width={120}
                  height={120}
                  style={{ borderRadius: '8px', border: '1px solid #e0d0b0' }}
                />
                <p style={{ fontSize: '0.65rem', color: '#a09080', marginTop: '0.25rem' }}>
                  Staff: scan to validate
                </p>
              </div>
            )}
          </div>

          <p style={{
            marginTop: '1.5rem',
            fontSize: '0.85rem',
            opacity: 0.7,
          }}>
            ⏰ Come back tomorrow for another chance!
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>⏰</div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            marginBottom: '0.5rem',
          }}>
            Already Played Today!
          </h1>
          <p style={{
            opacity: 0.8,
            fontSize: '1rem',
            maxWidth: '300px',
          }}>
            You've used your play for today at {merchantName}.
          </p>
          <p style={{
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            opacity: 0.6,
          }}>
            🍀 Come back tomorrow for another chance to win!
          </p>
        </>
      )}
    </div>
  )
}
