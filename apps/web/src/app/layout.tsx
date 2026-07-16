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

// French-first metadata — the landing is FR-primary. The `alternateLocale`
// hint below still tells search engines EN content exists via the client-
// side toggle. If we later ship an /en/ route we'll split these per-locale.
const TITLE =
  'Win & Win — Jeux QR-code pour restaurants, cafés et commerces'
const DESCRIPTION =
  'Vos clients scannent un QR code, laissent un avis Google, vous suivent sur Instagram, et jouent à la roue pour gagner un prix. En moins de 10 minutes vous récoltez des avis, des abonnés, et des visites récurrentes. Essai gratuit 14 jours.'

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
    locale: 'fr_MA',
    alternateLocale: ['fr_FR', 'en_US'],
    siteName: 'Win & Win',
    url: SITE_URL,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Win & Win — Le jeu qui fait revenir vos clients',
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

// JSON-LD FAQPage — mirrors the 15-question grouped FAQ shipped in the
// landing UI. Kept in French because the site is FR-primary; Google
// indexes the FR content for the .club domain based on the marketing
// audience. When we add an EN /en/ route we'll ship an EN FAQ variant
// under that path with the same shape.
const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    // Démarrage
    { '@type': 'Question', name: 'Combien de temps pour être en ligne ?', acceptedAnswer: { '@type': 'Answer', text: 'La plupart des commerces sont opérationnels en moins de 10 minutes : vous créez votre jeu, téléchargez le QR code, et le placez sur vos tables.' } },
    { '@type': 'Question', name: 'Faut-il télécharger une application ?', acceptedAnswer: { '@type': 'Answer', text: 'Non. Vos clients scannent le QR et jouent directement dans leur navigateur mobile. Aucune app à installer côté client.' } },
    { '@type': 'Question', name: 'Puis-je essayer Win & Win gratuitement ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui. Tous les plans incluent un essai gratuit de 14 jours, sans carte bancaire.' } },
    { '@type': 'Question', name: 'Où doit-on placer le QR code ?', acceptedAnswer: { '@type': 'Answer', text: 'Sur les chevalets de table, au dos des tickets de caisse, sur les menus, en vitrine, ou même sur l\'écran d\'attente. On vous aide à choisir le meilleur emplacement.' } },
    { '@type': 'Question', name: 'Comment se passe la mise en place ?', acceptedAnswer: { '@type': 'Answer', text: 'Vous vous inscrivez, choisissez votre jeu, ajoutez vos prix, et téléchargez votre flyer QR au format PDF. Support disponible sur WhatsApp.' } },
    // Fonctionnement
    { '@type': 'Question', name: 'Comment fonctionne l\'anti-fraude ?', acceptedAnswer: { '@type': 'Answer', text: 'Chaque terminal client est identifié par une empreinte digitale (résolution écran, GPU, timezone, etc.). Un même téléphone ne peut pas jouer plusieurs fois pendant la période de cooldown que vous configurez.' } },
    { '@type': 'Question', name: 'Puis-je limiter le nombre de gagnants ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui. Vous fixez un plafond par prix (max 5 gagnants par jour) et un plafond total. Le prix est retiré de la roue automatiquement une fois atteint.' } },
    { '@type': 'Question', name: 'Comment un client réclame son prix en boutique ?', acceptedAnswer: { '@type': 'Answer', text: 'Le client montre le coupon reçu par email. Votre staff scanne le QR code du coupon, entre le PIN de validation, et le coupon est marqué comme utilisé. Impossible à réutiliser.' } },
    { '@type': 'Question', name: 'Puis-je changer les prix à tout moment ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui. Vous pouvez ajouter, éditer, supprimer ou réinitialiser un prix à tout moment depuis votre dashboard. Les coupons déjà gagnés restent valables.' } },
    { '@type': 'Question', name: 'Les coupons expirent-ils ?', acceptedAnswer: { '@type': 'Answer', text: 'Vous choisissez la durée par prix : 1 semaine, 1 mois, 3 mois, ou personnalisé. Un délai d\'activation est également configurable.' } },
    // Tarifs & support
    { '@type': 'Question', name: 'Puis-je changer de plan ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui, à tout moment. Vous nous écrivez sur WhatsApp et on gère le changement dans la journée.' } },
    { '@type': 'Question', name: 'Y a-t-il un engagement de durée ?', acceptedAnswer: { '@type': 'Answer', text: 'Aucun. Vous êtes libre d\'arrêter à tout moment. Pas de frais de résiliation.' } },
    { '@type': 'Question', name: 'La facturation inclut-elle la TVA ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui, TVA marocaine 20% ou TVA française 20% selon le pays de facturation. Facture PDF envoyée chaque mois.' } },
    { '@type': 'Question', name: 'Le support est-il en français ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui. Support en français par WhatsApp et par email. Temps de réponse moyen : moins de 15 minutes en journée ouvrée.' } },
    { '@type': 'Question', name: 'Que se passe-t-il si je dépasse mon quota de parties ?', acceptedAnswer: { '@type': 'Answer', text: 'Le jeu reste actif. On vous prévient à 80% du quota et on vous propose de passer au plan supérieur — jamais de coupure surprise.' } },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={jakarta.variable}>
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
