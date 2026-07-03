// Contact / WhatsApp — shared constants used by the contact section and the
// floating WhatsApp button. `WHATSAPP_NUMBER_E164` is the raw E.164 form used
// by wa.me; `WHATSAPP_DISPLAY` is the pretty version rendered on screen.
export const WHATSAPP_NUMBER_E164 = '212628823717'
export const WHATSAPP_DISPLAY = '+212 6 28 82 37 17'
export const WHATSAPP_PREFILL =
  'Bonjour, je souhaite plus d’informations sur Win & Win.'
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`

// Landing-page copy. Original two-language scaffold is preserved here so
// future toggle work can re-enable FR without re-extracting strings.
export const LANDING_TEXT = {
  en: {
    heroTitle1: 'Your Customers Play.',
    heroTitle2: 'Your Business Wins.',
    heroSubtitle: 'Boost engagement and drive growth with fun',
    heroHighlight1: 'QR code games',
    heroMid: 'at your business. Collect reviews, grow followers, and drive',
    heroHighlight2: 'return visits',
    seePlans: 'See Plans',
    contactUs: 'Contact Us',
    tryNow: 'Try it now — scratch to see what your customers experience',
    navHow: 'How It Works',
    navGames: 'Games',
    navFeatures: 'Why Us',
    navPlans: 'Pricing',
    navContact: 'Get Started',
    howItWorks: '3 Steps. That\'s It.',
    howItWorksSubtitle: 'From setup to first play in under 10 minutes.',
    step1: 'Create Your Game',
    step1Desc: 'Choose Wheel of Fortune, Slots, or Mystery Box. Set your prizes and branding in minutes.',
    step2: 'Share Your QR Code',
    step2Desc: 'Print it on table tents, menus, or receipts. Customers scan with any phone.',
    step3: 'Customers Play & Win',
    step3Desc: 'They complete an action (Google review, Instagram follow), play your game, and win prizes.',
    games: 'Pick Your Game',
    features: 'Why Businesses Love Us',
    plans: 'Simple Pricing. Big Results.',
    trialNote: '14-day free trial included. No credit card required.',
    getStarted: 'Let\'s Build Something Fun',
    getStartedSub: 'Tell us about your business. We\'ll have you live in 24 hours.',
    businessName: 'Business Name',
    yourName: 'Your Name',
    email: 'Email',
    phone: 'Phone',
    businessType: 'Business Type',
    message: 'Message',
    sendBtn: 'Get Started',
    sending: 'Sending...',
    thankYou: 'Thanks! We\'ll reach out within 24 hours.',
    basedIn: 'Based in Casablanca, Morocco',
    madeWith: 'Made with',
    inMorocco: 'in Morocco',
    signIn: 'Sign In',
    myDashboard: 'My Dashboard',
    trusted: 'Trusted by 500+ businesses across Morocco',
    faq: 'FAQ',
    faq1q: 'Is there a free trial?',
    faq1a: 'Yes, all plans include a 14-day free trial. No credit card required.',
    faq2q: 'Can I change plans?',
    faq2a: 'Yes, you can upgrade or downgrade at any time by contacting us.',
    faq3q: 'How long does setup take?',
    faq3a: 'Most businesses are live within 10 minutes.',
    perMonth: '/mo',
    custom: 'Custom',
    businesses: 'Businesses',
    gamesPlayed: 'Games Played',
    satisfaction: 'Satisfaction',
    howItWorksSubtitle2: 'Three simple steps to gamify your business',
    gamesSubtitle: 'Spin, scratch, or tap — your customers choose the thrill.',
    featuresSubtitle: 'More reviews. More followers. More return visits.',
    plansSubtitle: 'Start free. Scale when you\'re ready.',
    faqHeading: 'Got Questions?',
    terms: 'Terms',
    privacy: 'Privacy',
    contact: 'Contact',
    copyright: '© 2026 Win & Win. All rights reserved.',
    selectBusinessType: 'Select your business type',
    phoneSuffix: '(optional)',
    messageSuffix: '(optional)',
    messagePlaceholder: 'Tell us about your business and goals...',
    confirmEmail: 'Check your inbox for a confirmation email.',
    errorMsg: 'Something went wrong. Please try again.',
  },
} as const

export type Lang = keyof typeof LANDING_TEXT
export type LandingText = typeof LANDING_TEXT[Lang]
