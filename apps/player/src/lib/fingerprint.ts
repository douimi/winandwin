/**
 * Browser fingerprint generation for player identification.
 * Uses multiple browser signals to create a stable, deterministic fingerprint
 * that survives page refresh, incognito mode, and different tabs.
 */

const STORAGE_KEY = 'winandwin_fingerprint'

/** FNV-1a hash — fast with good distribution */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5 // FNV offset basis (32-bit)
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) // FNV prime (32-bit)
  }
  // Convert to unsigned 32-bit, then to hex
  const unsigned = hash >>> 0
  return unsigned.toString(16).padStart(8, '0')
}

/** Canvas fingerprint — draws specific shapes/text and hashes the result */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'no_canvas'

    // Draw "Win&Win" with specific styling
    ctx.textBaseline = 'top'
    ctx.font = '16px Arial'
    ctx.fillStyle = '#4a90d9'
    ctx.fillText('Win&Win', 10, 10)

    // Add a gradient rectangle for more entropy
    ctx.fillStyle = '#e74c3c'
    ctx.fillRect(100, 5, 40, 20)

    // Add arc
    ctx.beginPath()
    ctx.arc(170, 25, 15, 0, Math.PI * 2)
    ctx.fillStyle = '#2ecc71'
    ctx.fill()

    return canvas.toDataURL()
  } catch {
    return 'canvas_error'
  }
}

/** WebGL renderer string */
function getWebGLRenderer(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl || !(gl instanceof WebGLRenderingContext)) return 'no_webgl'
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return 'no_debug_info'
    return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown'
  } catch {
    return 'webgl_error'
  }
}

/** Audio context fingerprint */
function getAudioFingerprint(): string {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtx) return 'no_audio'
    const ctx = new AudioCtx()
    const result = `${ctx.sampleRate}_${ctx.destination.channelCount}`
    ctx.close()
    return result
  } catch {
    return 'audio_error'
  }
}

/** Collect all signals and produce a deterministic fingerprint */
export async function generateFingerprint(): Promise<string> {
  // Check localStorage first for consistency
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return stored
  } catch {
    /* storage unavailable */
  }

  const signals: string[] = [
    // Canvas fingerprint
    getCanvasFingerprint(),
    // WebGL renderer
    getWebGLRenderer(),
    // Screen
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    String(window.devicePixelRatio),
    // Navigator
    navigator.userAgent,
    navigator.language,
    (navigator.languages || []).join(','),
    navigator.platform,
    String(navigator.hardwareConcurrency || 0),
    String((navigator as unknown as { deviceMemory?: number }).deviceMemory || 0),
    // Timezone
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    // Touch support
    String(navigator.maxTouchPoints || 0),
    // Audio context
    getAudioFingerprint(),
  ]

  const combined = signals.join('|||')

  // Double-hash for better distribution into 16 hex chars
  const hash1 = fnv1a(combined)
  const hash2 = fnv1a(combined + hash1)
  const fingerprint = `fp_${hash1}${hash2}`

  // Persist to localStorage for stability
  try {
    localStorage.setItem(STORAGE_KEY, fingerprint)
  } catch {
    /* storage unavailable */
  }

  return fingerprint
}
