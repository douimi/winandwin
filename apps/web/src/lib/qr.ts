import QRCode from 'qrcode'

const PLAYER_BASE_URL = process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001'

export function getPlayerUrl(merchantSlug: string): string {
  return `${PLAYER_BASE_URL}/${merchantSlug}`
}

export async function generateQRCodeDataURL(merchantSlug: string): Promise<string> {
  const url = getPlayerUrl(merchantSlug)
  return QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  })
}

export async function generateQRCodeSVG(merchantSlug: string): Promise<string> {
  const url = getPlayerUrl(merchantSlug)
  return QRCode.toString(url, {
    type: 'svg',
    margin: 2,
    errorCorrectionLevel: 'H',
  })
}
