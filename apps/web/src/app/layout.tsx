import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Win & Win — Gamification Marketing for Physical Businesses',
  description:
    'Deploy interactive QR-code games to collect Google reviews, grow social media, and drive repeat visits. Wheel of Fortune, Slot Machine, Mystery Box — set up in under 10 minutes.',
  keywords: [
    'gamification',
    'marketing',
    'QR code',
    'Google reviews',
    'customer engagement',
    'loyalty',
    'restaurant marketing',
    'wheel of fortune',
    'slot machine',
  ],
  authors: [{ name: 'Win & Win' }],
  openGraph: {
    title: 'Win & Win — Turn Every Visit Into a Game Your Customers Love',
    description:
      'Deploy interactive QR-code games to collect Google reviews, grow social media, and drive repeat visits.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Win & Win',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Win & Win — Gamification Marketing for Physical Businesses',
    description:
      'Deploy interactive QR-code games to collect Google reviews, grow social media, and drive repeat visits.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <head>
        <link rel="preconnect" href="https://winandwin-api.douimiotmane.workers.dev" />
      </head>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  )
}
