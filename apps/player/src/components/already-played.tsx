import type { PlayerState } from '../types'

interface Props {
  playerState: PlayerState
  merchantName: string
}

export function AlreadyPlayedScreen({ playerState, merchantName }: Props) {
  const won = playerState.lastPlayResult === 'win'
  const coupon = playerState.lastCoupon

  return (
    <div class="screen already-played-screen">
      {won && coupon ? (
        <>
          <div class="already-played-icon">🎉</div>
          <h1 class="already-played-title">You won!</h1>
          <p class="already-played-message">
            Here's your coupon from {merchantName}. Don't lose it!
          </p>
          <div class="coupon-display">
            <span class="coupon-code">{coupon.code}</span>
            <p class="coupon-validity">
              Valid from{' '}
              {new Date(coupon.validFrom).toLocaleDateString()} to{' '}
              {new Date(coupon.validUntil).toLocaleDateString()}
            </p>
          </div>
          <p class="already-played-subtext">
            You've already played today. Come back tomorrow for another chance!
          </p>
        </>
      ) : (
        <>
          <div class="already-played-icon">⏰</div>
          <h1 class="already-played-title">Already played today!</h1>
          <p class="already-played-message">
            You've used your play for today at {merchantName}.
          </p>
          <p class="already-played-subtext">
            Come back tomorrow for another chance to win!
          </p>
        </>
      )}
    </div>
  )
}
