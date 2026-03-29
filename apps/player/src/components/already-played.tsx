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
    ? `https://winandwin.club/validate/${coupon.code}`
    : null

  return (
    <div class="screen already-played-screen">
      {won && coupon ? (
        <>
          <div class="already-played-emoji">{'\u{1F389}'}</div>
          <h1 class="already-played-title">You Won!</h1>
          <p class="already-played-sub">
            Here's your coupon from {merchantName}
          </p>

          {/* Coupon Card */}
          <div class="coupon-card">
            <div class="coupon-perforation coupon-perforation-left" />
            <div class="coupon-perforation coupon-perforation-right" />
            <div class="coupon-inner">
              <p class="coupon-label">Your Coupon Code</p>
              <p class="coupon-code">{coupon.code}</p>
              <div class="coupon-divider" />
              <p class="coupon-validity">
                Valid from {formatDate(coupon.validFrom)} to {formatDate(coupon.validUntil)}
              </p>
              <p class="coupon-instruction">
                {'\u{1F4F1}'} Show this to staff to redeem your prize
              </p>

              {validationUrl && (
                <div class="coupon-qr-wrap">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(validationUrl)}`}
                    alt="Coupon QR Code"
                    width={120}
                    height={120}
                    class="coupon-qr-img"
                  />
                  <p class="coupon-qr-note">
                    Staff: scan to validate
                  </p>
                </div>
              )}
            </div>
          </div>

          <p class="already-played-comeback">
            {'\u{23F0}'} Come back tomorrow for another chance!
          </p>
        </>
      ) : (
        <>
          <div class="already-played-emoji">{'\u{23F0}'}</div>
          <h1 class="already-played-title">Already Played Today!</h1>
          <p class="already-played-sub">
            You've used your play for today at {merchantName}.
          </p>
          <div class="already-played-encourage">
            <span class="already-played-encourage-icon">{'\u{1F340}'}</span>
            <span>Come back tomorrow for another chance to win!</span>
          </div>
        </>
      )}
    </div>
  )
}
