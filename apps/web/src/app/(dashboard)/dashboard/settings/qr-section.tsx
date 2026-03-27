'use client'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@winandwin/ui'
import { useEffect, useState } from 'react'

interface Props {
  merchantSlug: string
}

export function QRSection({ merchantSlug }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const playerUrl = `${process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001'}/${merchantSlug}`

  useEffect(() => {
    // Fetch QR as PNG from our API route
    fetch(`/api/qr/${merchantSlug}?format=png`)
      .then((res) => res.blob())
      .then((blob) => {
        setQrDataUrl(URL.createObjectURL(blob))
      })
      .catch(() => {
        // silently fail — QR preview not critical
      })
  }, [merchantSlug])

  function downloadQR(format: 'png' | 'svg') {
    const a = document.createElement('a')
    a.href = `/api/qr/${merchantSlug}?format=${format}`
    a.download = `qr-${merchantSlug}.${format}`
    a.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code & Game Link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {/* QR Preview */}
          <div className="flex h-48 w-48 items-center justify-center rounded-lg border bg-white p-2">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="h-full w-full" />
            ) : (
              <span className="text-sm text-muted-foreground">Loading...</span>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-medium">Player Game URL</p>
              <p className="mt-1 rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {playerUrl}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Print this QR code on table tents, posters, receipts, or stickers. When customers scan
              it, they&apos;ll land directly on your game page.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => downloadQR('png')}>
                Download PNG (1024px)
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadQR('svg')}>
                Download SVG (vector)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(playerUrl)
                }}
              >
                Copy Link
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
