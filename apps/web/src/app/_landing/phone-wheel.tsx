'use client'

// Static wheel-of-fortune SVG used as the Wheel card illustration in the
// Games showcase section. The wheel keeps the brand colour wheel feel,
// but the surrounding card uses neutral tokens.
export function PhoneWheelSVG() {
  const segments = [
    { color: '#f59e0b' },
    { color: '#6366f1' },
    { color: '#10b981' },
    { color: '#ec4899' },
    { color: '#f97316' },
    { color: '#8b5cf6' },
    { color: '#14b8a6' },
    { color: '#ef4444' },
  ]
  const n = segments.length
  const r = 100
  const cx = 110
  const cy = 110

  return (
    <svg viewBox="0 0 220 220" className="h-full w-full">
      {segments.map((seg, i) => {
        const startAngle = (i * 360) / n
        const endAngle = ((i + 1) * 360) / n
        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180
        const x1 = cx + r * Math.cos(startRad)
        const y1 = cy + r * Math.sin(startRad)
        const x2 = cx + r * Math.cos(endRad)
        const y2 = cy + r * Math.sin(endRad)
        return (
          <path
            key={i}
            d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
            fill={seg.color}
            stroke="white"
            strokeWidth="2"
          />
        )
      })}
      <circle cx={cx} cy={cy} r="14" fill="white" stroke="#0369A1" strokeWidth="3" />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="10"
        fontWeight="bold"
        fill="#0369A1"
      >
        SPIN
      </text>
    </svg>
  )
}
