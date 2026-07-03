import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  // Was 300/400/500/600/700/800 — six weights ≈ 150 KB. In practice we
  // render body at 400, medium UI at 600, and headings at 700. Cutting
  // the other three cuts the font payload roughly in half without any
  // visible change.
  weight: ['400', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
})

const SITE_URL = 'https://winandwin.club'

const TITLE = 'Win & Win — QR-Code Games for Restaurants, Cafés & Retail'
const DESCRIPTION =
  'Turn every customer visit into a game. Deploy a Wheel of Fortune, Slot Machine or Mystery Box behind a QR code — collect Google reviews, grow your Instagram, drive repeat visits. Live in under 10 minutes.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s — Win & Win',
  },
  description: DESCRIPTION,
  applicationName: 'Win & Win',
  keywords: [
    'gamification marketing',
    'QR code game',
    'wheel of fortune game',
    'slot machine game',
    'mystery box game',
    'Google reviews growth',
    'customer loyalty SaaS',
    'restaurant marketing tool',
    'café loyalty program',
    'retail QR marketing',
    'jeu QR code',
    'roue de la fortune restaurant',
    'marketing gamifié',
    'gagner des avis Google',
  ],
  authors: [{ name: 'Win & Win', url: SITE_URL }],
  creator: 'Win & Win',
  publisher: 'Win & Win',
  category: 'Marketing Technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['fr_FR', 'fr_MA'],
    siteName: 'Win & Win',
    url: SITE_URL,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Win & Win — Turn every customer visit into a game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
  width: 'device-width',
  initialScale: 1,
}

// JSON-LD structured data — two objects (Organization + SoftwareApplication).
// Search engines use this for rich results; LLM-powered search (Perplexity,
// ChatGPT search, Google AI Overviews) prefers pages that ship this because
// the answer they cite comes verbatim from these fields.
const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Win & Win',
  alternateName: 'winandwin.club',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  slogan: 'Turn every customer visit into a game',
  foundingLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MA',
      addressLocality: 'Casablanca',
    },
  },
  areaServed: ['MA', 'FR', 'EU'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    url: `${SITE_URL}/#contact`,
    availableLanguage: ['en', 'fr'],
  },
}

const SOFTWARE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Win & Win',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Marketing Automation',
  operatingSystem: 'Web',
  description: DESCRIPTION,
  url: SITE_URL,
  screenshot: `${SITE_URL}/og.png`,
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '299',
      priceCurrency: 'MAD',
      description: '500 plays/month, 1 active game, basic analytics.',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '599',
      priceCurrency: 'MAD',
      description: '2,000 plays/month, 3 games, marketing automation, WhatsApp support.',
    },
    {
      '@type': 'Offer',
      name: 'Enterprise',
      price: 'Custom',
      priceCurrency: 'MAD',
      description: 'Unlimited plays and games, multi-location, white-label.',
    },
  ],
  featureList: [
    'Wheel of Fortune',
    'Slot Machine',
    'Mystery Box',
    'Google Reviews collection',
    'Instagram follow requirement',
    'Time-limited coupon rewards',
    'Real-time analytics',
    'Anti-fraud device fingerprinting',
    'Custom branding',
    'Multi-language (English, French, Spanish, Arabic)',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '500',
    bestRating: '5',
    worstRating: '1',
  },
}

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is there a free trial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, every plan includes a 14-day free trial. No credit card required to start.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does setup take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most businesses go live in under 10 minutes: create a game, print the QR code, place it on your tables or receipts.',
      },
    },
    {
      '@type': 'Question',
      name: 'What games can I offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Wheel of Fortune, Slot Machine and Mystery Box, each with customizable prizes and win rates.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Win & Win drive Google reviews?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Before playing, customers can complete a Call-to-Action such as leaving a Google review, following your Instagram, or joining your WhatsApp list. This is the ticket to spin the wheel.',
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <head>
        {/* API host is on Cloudflare Workers — DNS + TLS handshake in parallel with HTML parse. */}
        <link rel="preconnect" href="https://winandwin-api.douimiotmane.workers.dev" />
        <link rel="dns-prefetch" href="https://winandwin-api.douimiotmane.workers.dev" />
        {/* Logo is above-the-fold on every page — preload avoids a second RTT on first paint. */}
        <link rel="preload" as="image" href="/logo.png" />
      </head>
      <body className="min-h-screen font-sans antialiased">
        {children}

        {/*
          JSON-LD structured data. Placed after content so it doesn't
          delay first paint. next/script strategy="afterInteractive" is
          the default; we use "beforeInteractive" only for the parts
          crawlers must see in the initial HTML.
        */}
        <Script
          id="ld-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <Script
          id="ld-software"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_JSONLD) }}
        />
        <Script
          id="ld-faq"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
        />
      </body>
    </html>
  )
}
