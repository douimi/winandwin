import { useT } from '../lib/i18n'

interface Props {
  merchantName?: string
}

export function LoadingScreen({ merchantName }: Props) {
  const t = useT()
  return (
    <div class="screen loading-screen">
      <div class="loading-glow" />
      <div class="loading-spinner-ring">
        <div class="loading-spinner-dot" />
      </div>
      {merchantName && <p class="loading-merchant">{merchantName}</p>}
      <p class="loading-text">{t.player.loading}</p>
    </div>
  )
}
