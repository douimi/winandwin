import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

const PLAYER_BASE_URL = process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const url = `${PLAYER_BASE_URL}/${slug}`

  const format = _request.nextUrl.searchParams.get('format') || 'png'

  if (format === 'svg') {
    const svg = await QRCode.toString(url, {
      type: 'svg',
      margin: 2,
      errorCorrectionLevel: 'H',
    })
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `inline; filename="qr-${slug}.svg"`,
      },
    })
  }

  // PNG buffer
  const buffer = await QRCode.toBuffer(url, {
    width: 1024,
    margin: 2,
    errorCorrectionLevel: 'H',
  })

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="qr-${slug}.png"`,
    },
  })
}
