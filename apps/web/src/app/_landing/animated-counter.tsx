'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  target: number
  suffix?: string
  duration?: number
}

// Animates a number from 0 → target the first time it scrolls into view.
// Used for the hero stat row (500+ businesses, 2M+ plays, 4.8/5 rating).
export function AnimatedCounter({ target, suffix = '', duration = 2000 }: Props) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        let start = 0
        const step = (timestamp: number) => {
          if (!start) start = timestamp
          const progress = Math.min((timestamp - start) / duration, 1)
          setCount(Math.floor(progress * target))
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        observer.disconnect()
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}
