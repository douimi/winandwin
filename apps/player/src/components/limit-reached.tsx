import { useT } from '../lib/i18n'

interface Props {
  merchantName: string
}

export function LimitReachedScreen({ merchantName }: Props) {
  const t = useT()
  return (
    <div class="screen" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      minHeight: '100vh',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏸️</div>
      <h1 style={{
        fontSize: '1.8rem',
        fontWeight: 800,
        marginBottom: '0.5rem',
        color: 'var(--atm-text, #fff)',
      }}>
        {t.player.gamePaused}
      </h1>
      <p style={{
        fontSize: '1.05rem',
        color: 'var(--atm-text-secondary, rgba(255,255,255,0.7))',
        maxWidth: '320px',
        lineHeight: 1.5,
        marginBottom: '1.5rem',
      }}>
        {merchantName} {t.player.gamePausedMessage}
      </p>
      <div style={{
        background: 'var(--atm-card-bg, rgba(255,255,255,0.1))',
        border: '1px solid var(--atm-card-border, rgba(255,255,255,0.15))',
        borderRadius: '12px',
        padding: '1.25rem',
        maxWidth: '320px',
        width: '100%',
      }}>
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--atm-text-secondary, rgba(255,255,255,0.7))',
          margin: 0,
        }}>
          {t.player.gameBackSoon}
        </p>
      </div>
      <p style={{
        marginTop: '2rem',
        fontSize: '0.75rem',
        color: 'var(--atm-text-secondary, rgba(255,255,255,0.4))',
      }}>
        {t.player.poweredBy}
      </p>
    </div>
  )
}
