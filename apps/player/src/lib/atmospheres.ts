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

export function getAtmosphere(name: string): AtmosphereTheme {
  return ATMOSPHERES[name] ?? ATMOSPHERES['joyful']!
}
