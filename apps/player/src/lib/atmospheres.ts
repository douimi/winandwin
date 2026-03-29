export interface AtmosphereTheme {
  name: string
  label: string
  // Colors
  bgGradient: string
  primaryText: string
  secondaryText: string
  cardBg: string
  cardBorder: string
  buttonBg: string
  buttonText: string
  buttonGlow: string
  accentColor: string
  // Wheel colors (override segment colors)
  wheelColors: string[]
  wheelBorder: string
  wheelCenter: string
  wheelText: string
  // Typography
  fontWeight: string
  titleSize: string
}

export const ATMOSPHERES: Record<string, AtmosphereTheme> = {
  joyful: {
    name: 'joyful',
    label: 'Joyful & Fun',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    primaryText: '#ffffff',
    secondaryText: 'rgba(255,255,255,0.8)',
    cardBg: 'rgba(255,255,255,0.15)',
    cardBorder: 'rgba(255,255,255,0.2)',
    buttonBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    buttonText: '#ffffff',
    buttonGlow: 'rgba(240,147,251,0.4)',
    accentColor: '#f093fb',
    wheelColors: ['#667eea', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#fa709a'],
    wheelBorder: '#ffffff',
    wheelCenter: '#ffffff',
    wheelText: '#ffffff',
    fontWeight: 'bold',
    titleSize: '1.8rem',
  },
  premium: {
    name: 'premium',
    label: 'Premium & Elegant',
    bgGradient: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
    primaryText: '#e8d5b5',
    secondaryText: 'rgba(232,213,181,0.6)',
    cardBg: 'rgba(232,213,181,0.08)',
    cardBorder: 'rgba(232,213,181,0.2)',
    buttonBg: 'linear-gradient(135deg, #b8860b 0%, #daa520 50%, #b8860b 100%)',
    buttonText: '#0a0a0a',
    buttonGlow: 'rgba(218,165,32,0.3)',
    accentColor: '#daa520',
    wheelColors: ['#1a1a2e', '#e8d5b5', '#2a2a3e', '#d4af37', '#1a1a2e', '#c9b896'],
    wheelBorder: '#daa520',
    wheelCenter: '#daa520',
    wheelText: '#ffffff',
    fontWeight: 'normal',
    titleSize: '2rem',
  },
  warm: {
    name: 'warm',
    label: 'Warm & Cozy',
    bgGradient: 'linear-gradient(135deg, #3c1810 0%, #5c2d1a 50%, #8b4513 100%)',
    primaryText: '#fef3e2',
    secondaryText: 'rgba(254,243,226,0.7)',
    cardBg: 'rgba(254,243,226,0.1)',
    cardBorder: 'rgba(254,243,226,0.15)',
    buttonBg: 'linear-gradient(135deg, #d4872c 0%, #e8a849 50%, #d4872c 100%)',
    buttonText: '#3c1810',
    buttonGlow: 'rgba(212,135,44,0.3)',
    accentColor: '#e8a849',
    wheelColors: ['#5c2d1a', '#e8a849', '#8b4513', '#d4872c', '#6b3a1f', '#f0c878'],
    wheelBorder: '#e8a849',
    wheelCenter: '#fef3e2',
    wheelText: '#ffffff',
    fontWeight: 'normal',
    titleSize: '1.8rem',
  },
  kids: {
    name: 'kids',
    label: 'Child-Friendly',
    bgGradient: 'linear-gradient(135deg, #00b4d8 0%, #48cae4 30%, #90e0ef 60%, #ffb703 100%)',
    primaryText: '#ffffff',
    secondaryText: 'rgba(255,255,255,0.85)',
    cardBg: 'rgba(255,255,255,0.25)',
    cardBorder: 'rgba(255,255,255,0.3)',
    buttonBg: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
    buttonText: '#ffffff',
    buttonGlow: 'rgba(255,107,107,0.4)',
    accentColor: '#ffb703',
    wheelColors: ['#ff6b6b', '#4ecdc4', '#ffb703', '#45b7d1', '#96ceb4', '#ff8a65'],
    wheelBorder: '#ffffff',
    wheelCenter: '#ffb703',
    wheelText: '#ffffff',
    fontWeight: 'bold',
    titleSize: '2rem',
  },
}

/**
 * Build a custom atmosphere from merchant's chosen colors.
 * c1 = primary, c2 = secondary, c3 = accent
 */
export function buildCustomAtmosphere(c1: string, c2: string, c3: string): AtmosphereTheme {
  // Determine if background is dark or light to set text colors
  const hex = c1.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const isDark = luminance < 0.5

  return {
    name: 'custom',
    label: 'Custom',
    bgGradient: `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
    primaryText: isDark ? '#ffffff' : '#1a1a2e',
    secondaryText: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)',
    cardBg: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
    cardBorder: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    buttonBg: `linear-gradient(135deg, ${c2} 0%, ${c3} 100%)`,
    buttonText: isDark ? '#ffffff' : '#1a1a2e',
    buttonGlow: `${c3}66`,
    accentColor: c3,
    wheelColors: [c1, c2, c3, c1, c2, c3],
    wheelBorder: isDark ? '#ffffff' : c3,
    wheelCenter: isDark ? '#ffffff' : c1,
    wheelText: '#ffffff',
    fontWeight: 'bold',
    titleSize: '2rem',
  }
}

export function getAtmosphere(name: string, customColors?: { c1: string; c2: string; c3: string }): AtmosphereTheme {
  if (name === 'custom' && customColors) {
    return buildCustomAtmosphere(customColors.c1, customColors.c2, customColors.c3)
  }
  return ATMOSPHERES[name] ?? ATMOSPHERES['joyful']!
}
