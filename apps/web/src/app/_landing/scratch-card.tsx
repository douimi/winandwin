'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Coffee } from 'lucide-react'

// Interactive scratch-card demo featured in the hero — visitors actually
// scratch the gold layer with their finger / cursor to reveal a prize.
// Lives in a stylised phone mockup so it reads as a product demo.
export function ScratchCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [revealed, setRevealed] = useState(false)
  const [scratching, setScratching] = useState(false)

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    setRevealed(false)

    // Golden gradient overlay
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, '#f59e0b')
    grad.addColorStop(0.5, '#fbbf24')
    grad.addColorStop(1, '#d97706')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SCRATCH HERE', w / 2, h / 2 - 6)
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText('Use your finger or mouse', w / 2, h / 2 + 14)

    // Sparkle dots
    for (let i = 0; i < 24; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2 + 1, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3 + 0.1})`
      ctx.fill()
    }
  }, [])

  useEffect(() => {
    initCanvas()
  }, [initCanvas])

  function scratch(x: number, y: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let cleared = 0
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) cleared++
    }
    const pct = cleared / (canvas.width * canvas.height)
    if (pct > 0.5 && !revealed) {
      setRevealed(true)
    }
  }

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const touch = e.touches[0]
      if (!touch) return null
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  function handleStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    setScratching(true)
    const pos = getPos(e)
    if (pos) scratch(pos.x, pos.y)
  }

  function handleMove(e: React.MouseEvent | React.TouchEvent) {
    if (!scratching) return
    e.preventDefault()
    const pos = getPos(e)
    if (pos) scratch(pos.x, pos.y)
  }

  function handleEnd() {
    setScratching(false)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Phone frame */}
        <div className="relative h-[480px] w-[250px] overflow-hidden rounded-[2.5rem] border-[5px] border-slate-900 bg-gradient-to-b from-slate-900 to-slate-800 shadow-xl">
          {/* Notch */}
          <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-slate-900" />

          {/* Screen content */}
          <div className="flex h-full flex-col items-center justify-center px-4 pt-6">
            <div className="mb-2 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/20 text-xs font-bold text-amber-300">
                Logo
              </div>
              <p className="mt-1 text-xs font-medium text-slate-400">Your Brand</p>
            </div>
            <p className="mb-3 text-sm font-bold text-white/90">Scratch to Win!</p>

            {/* Scratch surface */}
            <div className="relative h-[140px] w-[200px] overflow-hidden rounded-xl shadow-lg">
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800">
                <Coffee className="mb-1 h-7 w-7 text-white" />
                <span className="text-sm font-bold text-white">You won a</span>
                <span className="text-lg font-extrabold text-amber-300">Free Coffee!</span>
              </div>
              <canvas
                ref={canvasRef}
                width={200}
                height={140}
                className="absolute inset-0 cursor-pointer touch-none"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
            </div>

            {revealed ? (
              <div className="mt-3 flex flex-col items-center gap-2">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-center text-sm font-semibold text-emerald-300">
                  Congratulations!
                </div>
                <button
                  type="button"
                  onClick={initCanvas}
                  className="text-xs text-slate-400 underline transition-colors hover:text-white"
                >
                  Reset & Try Again
                </button>
              </div>
            ) : (
              <p className="mt-3 text-center text-xs text-slate-400">
                Scratch the golden card above!
              </p>
            )}
          </div>
        </div>

        {/* Soft glow behind the phone — primary tinted */}
        <div className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl" />
      </div>
    </div>
  )
}
