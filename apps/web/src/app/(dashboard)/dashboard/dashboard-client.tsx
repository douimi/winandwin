'use client'

import { useEffect, useState } from 'react'

export function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setDisplay(Math.floor(progress * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, duration])
  return <>{display.toLocaleString()}</>
}

export function SetupProgressBar({ hasGames, hasActiveGame, hasPlays }: { hasGames: boolean; hasActiveGame: boolean; hasPlays: boolean }) {
  const steps = [
    { label: 'Account', done: true },
    { label: 'Game', done: hasGames },
    { label: 'Activate', done: hasActiveGame },
    { label: 'First Play', done: hasPlays },
  ]
  const completedCount = steps.filter((s) => s.done).length

  if (completedCount === 4) return null

  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-card p-4 shadow-sm">
      <p className="mb-2 text-sm font-medium">
        Getting Started — <span className="tabular-nums text-primary">{completedCount}/4</span> complete
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${(completedCount / 4) * 100}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {steps.map((step) => (
          <span
            key={step.label}
            className={`inline-flex items-center gap-1.5 ${
              step.done ? 'font-medium text-emerald-600' : 'text-muted-foreground'
            }`}
          >
            <span aria-hidden>{step.done ? '✓' : '○'}</span>
            {step.label}
          </span>
        ))}
      </div>
    </div>
  )
}
