/**
 * Enhanced browser fingerprint generation.
 *
 * Two fingerprints are generated:
 * 1. Full fingerprint — includes browser-specific signals (canvas, userAgent)
 * 2. Hardware fingerprint — only hardware/device signals that stay the same
 *    across different browsers on the same phone (screen, GPU, CPU, memory, touch)
 *
 * The server uses both: full for primary identification, hardware for
 * cross-browser detection on the same device.
 */

const STORAGE_KEY = 'winandwin_fingerprint'
const HW_STORAGE_KEY = 'winandwin_hw_fingerprint'

/** FNV-1a hash — fast with good distribution */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/** Canvas fingerprint — draws shapes/text and hashes the pixel data */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 260
    canvas.height = 60
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'no_canvas'

    ctx.textBaseline = 'top'

    // Text with specific font stack — rendering varies per browser/GPU
    ctx.font = '16px Arial, sans-serif'
    ctx.fillStyle = '#4a90d9'
    ctx.fillText('Win&Win!@#$%^', 10, 10)

    // Second text with different font
    ctx.font = 'italic 14px Georgia, serif'
    ctx.fillStyle = '#e74c3c'
    ctx.fillText('Fingerprint2026', 10, 35)

    // Gradient rectangle
    const gradient = ctx.createLinearGradient(150, 0, 250, 50)
    gradient.addColorStop(0, '#ff6600')
    gradient.addColorStop(1, '#0066ff')
    ctx.fillStyle = gradient
    ctx.fillRect(150, 5, 100, 40)

    // Arc with transparency
    ctx.beginPath()
    ctx.arc(200, 30, 20, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(46, 204, 113, 0.7)'
    ctx.fill()

    // Bezier curve
    ctx.beginPath()
    ctx.moveTo(10, 55)
    ctx.bezierCurveTo(50, 0, 100, 55, 150, 10)
    ctx.strokeStyle = '#9b59b6'
    ctx.lineWidth = 2
    ctx.stroke()

    return canvas.toDataURL()
  } catch {
    return 'canvas_error'
  }
}

/** WebGL renderer + vendor strings — stable across browsers (same GPU) */
function getWebGLInfo(): { renderer: string; vendor: string } {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl || !(gl instanceof WebGLRenderingContext)) return { renderer: 'no_webgl', vendor: 'no_webgl' }
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return { renderer: 'no_debug', vendor: 'no_debug' }
    return {
      renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown',
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown',
    }
  } catch {
    return { renderer: 'error', vendor: 'error' }
  }
}

/** Audio context fingerprint */
function getAudioFingerprint(): string {
  try {
    const AudioCtx = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return 'no_audio'
    const ctx = new AudioCtx()
    const result = `${ctx.sampleRate}_${ctx.destination.channelCount}_${ctx.destination.maxChannelCount}`
    ctx.close()
    return result
  } catch {
    return 'audio_error'
  }
}

/** Detect installed fonts by measuring text width differences */
function getFontFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'no_ctx'
    const testStr = 'mmmmmmmmmmlli'
    const baseFonts = ['monospace', 'sans-serif', 'serif']
    const testFonts = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana', 'Helvetica', 'Comic Sans MS', 'Impact', 'Trebuchet MS']

    const baseWidths: Record<string, number> = {}
    for (const base of baseFonts) {
      ctx.font = `16px ${base}`
      baseWidths[base] = ctx.measureText(testStr).width
    }

    const detected: string[] = []
    for (const font of testFonts) {
      for (const base of baseFonts) {
        ctx.font = `16px "${font}", ${base}`
        if (ctx.measureText(testStr).width !== baseWidths[base]) {
          detected.push(font)
          break
        }
      }
    }
    return detected.join(',')
  } catch {
    return 'font_error'
  }
}

/** Get device-specific signals that DON'T change across browsers */
function getHardwareSignals(): string[] {
  const nav = navigator as unknown as Record<string, unknown>
  const webgl = getWebGLInfo()

  return [
    // Screen — identical across browsers on same device
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    String(window.devicePixelRatio),
    String(screen.availWidth),
    String(screen.availHeight),
    // GPU — same hardware regardless of browser
    webgl.renderer,
    webgl.vendor,
    // CPU/Memory — hardware level
    String(navigator.hardwareConcurrency || 0),
    String((nav.deviceMemory as number) || 0),
    // Touch — hardware capability
    String(navigator.maxTouchPoints || 0),
    // Timezone — user setting, not browser-specific
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    // Platform
    navigator.platform,
    // Audio hardware
    getAudioFingerprint(),
  ]
}

/** Generate hardware-only fingerprint (cross-browser stable) */
function generateHardwareFingerprint(): string {
  const signals = getHardwareSignals()
  const combined = signals.join('|||')
  const h1 = fnv1a(combined)
  const h2 = fnv1a(combined + h1)
  return `hw_${h1}${h2}`
}

/** Generate full fingerprint (browser-specific, more unique) */
function generateFullFingerprint(): string {
  const nav = navigator as unknown as Record<string, unknown>
  const webgl = getWebGLInfo()

  const signals: string[] = [
    // Canvas — varies slightly per browser/GPU combo
    getCanvasFingerprint(),
    // WebGL
    webgl.renderer,
    webgl.vendor,
    // Screen
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    String(window.devicePixelRatio),
    String(screen.availWidth),
    String(screen.availHeight),
    // Navigator — userAgent is browser-specific
    navigator.userAgent,
    navigator.language,
    (navigator.languages || []).join(','),
    navigator.platform,
    String(navigator.hardwareConcurrency || 0),
    String((nav.deviceMemory as number) || 0),
    // Timezone
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    // Touch
    String(navigator.maxTouchPoints || 0),
    // Audio
    getAudioFingerprint(),
    // Fonts
    getFontFingerprint(),
    // Storage availability
    String(typeof localStorage !== 'undefined'),
    String(typeof sessionStorage !== 'undefined'),
    String(typeof indexedDB !== 'undefined'),
    // Color scheme
    String(window.matchMedia('(prefers-color-scheme: dark)').matches),
    // Connection type (stable per device/network)
    String((nav.connection as Record<string, unknown>)?.type || 'unknown'),
  ]

  const combined = signals.join('|||')
  const h1 = fnv1a(combined)
  const h2 = fnv1a(combined + h1)
  return `fp_${h1}${h2}`
}

export interface FingerprintData {
  fingerprintId: string
  hardwareId: string
}

/** Generate both fingerprints — returns cached versions if available */
export async function generateFingerprint(): Promise<string> {
  // Check localStorage cache first
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return stored
  } catch { /* storage unavailable */ }

  const fp = generateFullFingerprint()

  try {
    localStorage.setItem(STORAGE_KEY, fp)
  } catch { /* storage unavailable */ }

  return fp
}

/** Generate the hardware-only fingerprint for cross-browser detection */
export function getHardwareFingerprint(): string {
  try {
    const stored = localStorage.getItem(HW_STORAGE_KEY)
    if (stored) return stored
  } catch { /* storage unavailable */ }

  const hw = generateHardwareFingerprint()

  try {
    localStorage.setItem(HW_STORAGE_KEY, hw)
  } catch { /* storage unavailable */ }

  return hw
}
