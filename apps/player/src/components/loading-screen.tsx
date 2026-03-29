interface Props {
  merchantName?: string
}

export function LoadingScreen({ merchantName }: Props) {
  return (
    <div class="screen loading-screen">
      <div class="loading-glow" />
      <div class="loading-spinner-ring">
        <div class="loading-spinner-dot" />
      </div>
      {merchantName && <p class="loading-merchant">{merchantName}</p>}
      <p class="loading-text">Loading your experience...</p>
    </div>
  )
}
