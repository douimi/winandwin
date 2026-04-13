import { useState } from 'preact/hooks'
import { useT } from '../lib/i18n'

interface MysteryBoxProps {
  prizes: { id: string; name: string; emoji?: string }[]
  branding: { primaryColor: string; secondaryColor: string }
  onComplete: (result: { outcome: 'win' | 'lose'; selectedIndex: number }) => void
  targetIndex: number | null
  isWin: boolean
  merchantLogo?: string
}

export function MysteryBox({
  prizes,
  branding,
  onComplete,
  targetIndex,
  isWin,
  merchantLogo,
}: MysteryBoxProps) {
  const t = useT()
  const [selectedBox, setSelectedBox] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [animating, setAnimating] = useState(false)

  // Generate box count: between 3 and 6 based on prize count
  const boxCount = Math.min(Math.max(prizes.length + 2, 3), 6)

  // Build box content based on targetIndex
  function getBoxContent(index: number): { emoji: string; label: string; isWinner: boolean } {
    if (targetIndex === null) {
      return { emoji: '\uD83C\uDF81', label: '', isWinner: false }
    }

    if (isWin && index === (targetIndex % boxCount)) {
      const prize = prizes[targetIndex]
      return {
        emoji: prize?.emoji || '\uD83C\uDF89',
        label: prize?.name || 'Prize',
        isWinner: true,
      }
    }

    // Losing boxes or non-target
    return {
      emoji: '\uD83C\uDF40',
      label: 'Try Again',
      isWinner: false,
    }
  }

  function handleBoxTap(index: number) {
    if (selectedBox !== null || animating || targetIndex === null) return

    setSelectedBox(index)
    setAnimating(true)

    // The box they tap doesn't matter for the outcome — the result is predetermined
    // But we assign the winning content to the tapped box if it's a win
    setTimeout(() => {
      setRevealed(true)
    }, 400)

    setTimeout(() => {
      setAnimating(false)
      const outcome = isWin ? 'win' : 'lose'
      onComplete({ outcome, selectedIndex: index })
    }, 2000)
  }

  // For display, if the user taps a box and it's a win, show the prize in THAT box
  function getDisplayContent(index: number): { emoji: string; label: string; isWinner: boolean } {
    if (selectedBox === null || !revealed) {
      return { emoji: '\uD83C\uDF81', label: '', isWinner: false }
    }

    if (index === selectedBox) {
      if (isWin) {
        const prize = prizes[targetIndex! % prizes.length]
        return {
          emoji: prize?.emoji || '\uD83C\uDF89',
          label: prize?.name || 'Prize',
          isWinner: true,
        }
      }
      return { emoji: '\uD83C\uDF40', label: 'Try Again', isWinner: false }
    }

    // Other boxes — show random miss symbols
    const missEmojis = ['\u2753', '\uD83D\uDCA8', '\uD83C\uDF2C\uFE0F', '\uD83D\uDCAB', '\u2728']
    return {
      emoji: missEmojis[index % missEmojis.length]!,
      label: '',
      isWinner: false,
    }
  }

  // Grid layout
  const cols = boxCount <= 3 ? 3 : boxCount <= 4 ? 2 : 3
  const gridClass = `mystery-grid cols-${cols}`

  return (
    <div class="mystery-container" style={{ position: 'relative' }}>
      {/* Brand watermark */}
      {merchantLogo && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.08,
          pointerEvents: 'none',
          zIndex: 0,
        }}>
          <img src={merchantLogo} alt="" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }} />
        </div>
      )}
      <p class="mystery-instruction" style={{ position: 'relative', zIndex: 1 }}>
        {selectedBox === null ? t.player.tapToReveal : revealed ? (isWin ? t.player.congratulations : t.player.almostMessage) : t.player.opening}
      </p>

      <div class={gridClass}>
        {Array.from({ length: boxCount }).map((_, i) => {
          const display = getDisplayContent(i)
          const isSelected = selectedBox === i
          const isOther = selectedBox !== null && selectedBox !== i

          return (
            <div
              key={i}
              class={`mystery-box${isSelected ? ' selected' : ''}${revealed && isSelected && display.isWinner ? ' winner' : ''}${revealed && isSelected && !display.isWinner ? ' revealed' : ''}${revealed && isOther ? ' faded' : ''}${!revealed && selectedBox === null ? ' idle' : ''}`}
              onClick={() => handleBoxTap(i)}
              style={{
                '--box-color': branding.primaryColor,
                '--box-delay': `${i * 0.08}s`,
              } as Record<string, string>}
            >
              <div class="mystery-box-inner">
                {revealed && isSelected ? (
                  <div class="mystery-box-content">
                    <span class="mystery-box-emoji-reveal">{display.emoji}</span>
                    {display.label && (
                      <span class="mystery-box-label">{display.label}</span>
                    )}
                  </div>
                ) : (
                  <div class="mystery-box-gift">
                    <span class="mystery-box-emoji">{'\uD83C\uDF81'}</span>
                    <span class="mystery-box-qmark">?</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
