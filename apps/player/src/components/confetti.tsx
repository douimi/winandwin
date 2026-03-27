import { useEffect, useState } from 'preact/hooks'

const COLORS = [
  '#FFD700', '#FFC107', '#FFE082', // Gold shades
  '#C0C0C0', '#E8E8E8',           // Silver
  '#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4',
  '#FF6B6B', '#4ECDC4', '#45B7D1',
]
const PIECE_COUNT = 90

interface Piece {
  id: number
  left: string
  bg: string
  delay: string
  duration: string
  shape: 'circle' | 'square' | 'rect'
  size: number
}

export function Confetti() {
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    const items: Piece[] = []
    for (let i = 0; i < PIECE_COUNT; i++) {
      const shapes: Array<'circle' | 'square' | 'rect'> = ['circle', 'square', 'rect']
      items.push({
        id: i,
        left: `${Math.random() * 100}%`,
        bg: COLORS[i % COLORS.length]!,
        delay: `${Math.random() * 2}s`,
        duration: `${2.5 + Math.random() * 3}s`,
        shape: shapes[i % 3]!,
        size: 6 + Math.random() * 8,
      })
    }
    setPieces(items)
  }, [])

  if (pieces.length === 0) return null

  return (
    <div class="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          class={`confetti-piece confetti-${p.shape}`}
          style={{
            left: p.left,
            backgroundColor: p.bg,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: `${p.size}px`,
            height: p.shape === 'rect' ? `${p.size * 1.8}px` : `${p.size}px`,
          }}
        />
      ))}
    </div>
  )
}
