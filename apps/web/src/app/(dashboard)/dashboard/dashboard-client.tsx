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
    <div className="mb-6 rounded-xl p-4" style={{ border: '2px solid transparent', borderImage: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899) 1' }}>
      <p className="text-sm font-medium mb-2">Getting Started — {completedCount}/4 complete</p>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${(completedCount / 4) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
        />
      </div>
      <div className="flex gap-4 mt-3 text-xs">
        {steps.map((step) => (
          <span key={step.label} className={step.done ? 'text-green-600' : 'text-muted-foreground'}>
            {step.done ? '\u2713' : '\u25CB'} {step.label}
          </span>
        ))}
      </div>
    </div>
  )
}
