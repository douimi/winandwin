export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
  playerUrl: process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production',
}
