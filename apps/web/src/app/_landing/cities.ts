// City-specific landing page metadata. Each entry drives:
//   - the /(maroc|france)/[city] dynamic route
//   - the local-SEO hero copy override
//   - the sitemap generator entry
//
// Add cities here to add landing pages — no other file touched.

export type Country = 'maroc' | 'france'

export interface CityMeta {
  slug: string
  country: Country
  displayName: string
  fr: {
    heroTitle1: string
    heroTitle2: string
    seoTitle: string
    seoDescription: string
    localPitch: string
  }
  en: {
    heroTitle1: string
    heroTitle2: string
    seoTitle: string
    seoDescription: string
    localPitch: string
  }
}

export const CITIES: CityMeta[] = [
  {
    slug: 'casablanca',
    country: 'maroc',
    displayName: 'Casablanca',
    fr: {
      heroTitle1: 'À Casablanca, vos clients passent, oublient,',
      heroTitle2: 'et ne reviennent jamais.',
      seoTitle: 'Win & Win Casablanca — Jeux QR-code pour restaurants, cafés et commerces',
      seoDescription: 'Le jeu qui fait revenir vos clients à Casablanca. Récoltez des avis Google, doublez vos abonnés Instagram, fidélisez vos habitués — en 10 minutes.',
      localPitch: 'Notre équipe basée à Casablanca vous accompagne en français et en darija.',
    },
    en: {
      heroTitle1: 'In Casablanca, customers walk in, forget you,',
      heroTitle2: 'and never come back.',
      seoTitle: 'Win & Win Casablanca — QR-code games for restaurants, cafés and shops',
      seoDescription: 'The game that brings your customers back in Casablanca. Collect Google reviews, double your Instagram, retain loyal customers — in 10 minutes.',
      localPitch: 'Our Casablanca-based team helps you in French, English and Darija.',
    },
  },
  {
    slug: 'rabat',
    country: 'maroc',
    displayName: 'Rabat',
    fr: {
      heroTitle1: 'À Rabat, chaque visite peut devenir',
      heroTitle2: 'un client fidèle.',
      seoTitle: 'Win & Win Rabat — Jeux QR-code pour commerces',
      seoDescription: 'Le jeu qui fait revenir vos clients à Rabat. Avis Google, Instagram, WhatsApp — tout intégré en un scan.',
      localPitch: 'On équipe déjà des commerces à Rabat : cafés, salons, boutiques.',
    },
    en: {
      heroTitle1: 'In Rabat, every visit can become',
      heroTitle2: 'a loyal customer.',
      seoTitle: 'Win & Win Rabat — QR-code games for local businesses',
      seoDescription: 'The game that brings your customers back in Rabat. Google reviews, Instagram, WhatsApp — all in one scan.',
      localPitch: 'We already equip merchants in Rabat: cafés, salons, boutiques.',
    },
  },
  {
    slug: 'marrakech',
    country: 'maroc',
    displayName: 'Marrakech',
    fr: {
      heroTitle1: 'À Marrakech, transformez chaque touriste',
      heroTitle2: 'en avis 5 étoiles.',
      seoTitle: 'Win & Win Marrakech — Jeux QR pour hôtels, riads et restaurants',
      seoDescription: 'À Marrakech, vos clients repartent avec un souvenir et un avis Google 5 étoiles. Fait pour l\'hôtellerie, la restauration et les commerces touristiques.',
      localPitch: 'Adapté au trafic touristique : jeu disponible en français, anglais, espagnol, arabe.',
    },
    en: {
      heroTitle1: 'In Marrakech, turn every tourist',
      heroTitle2: 'into a 5-star review.',
      seoTitle: 'Win & Win Marrakech — QR games for hotels, riads and restaurants',
      seoDescription: 'In Marrakech, your customers leave with a memory and a 5-star Google review. Made for hospitality, restaurants, and tourist-facing shops.',
      localPitch: 'Adapted to tourist traffic: game available in French, English, Spanish, and Arabic.',
    },
  },
  {
    slug: 'tanger',
    country: 'maroc',
    displayName: 'Tanger',
    fr: {
      heroTitle1: 'À Tanger, vos clients méritent',
      heroTitle2: 'plus qu\'une carte de fidélité.',
      seoTitle: 'Win & Win Tanger — QR loyalty et jeux pour commerces',
      seoDescription: 'À Tanger, remplacez vos vieilles cartes de fidélité par un jeu QR qui fait vraiment revenir vos clients.',
      localPitch: 'Support en français et darija. Livraison de vos flyers QR à Tanger.',
    },
    en: {
      heroTitle1: 'In Tangier, your customers deserve',
      heroTitle2: 'more than a loyalty card.',
      seoTitle: 'Win & Win Tangier — QR loyalty and games for local businesses',
      seoDescription: 'In Tangier, replace old loyalty cards with a QR game that actually brings customers back.',
      localPitch: 'Support in French and Darija. Delivery of your QR flyers in Tangier.',
    },
  },
  {
    slug: 'agadir',
    country: 'maroc',
    displayName: 'Agadir',
    fr: {
      heroTitle1: 'À Agadir, le trafic saisonnier',
      heroTitle2: 'devient votre base de données.',
      seoTitle: 'Win & Win Agadir — Jeux QR pour l\'hôtellerie et la restauration',
      seoDescription: 'À Agadir, capturez chaque touriste, chaque famille, chaque client de la haute saison. Emails, avis Google, Instagram — collectés automatiquement.',
      localPitch: 'Pensé pour l\'hôtellerie saisonnière : email collect + avis Google + Instagram en un scan.',
    },
    en: {
      heroTitle1: 'In Agadir, seasonal traffic',
      heroTitle2: 'becomes your database.',
      seoTitle: 'Win & Win Agadir — QR games for hospitality and F&B',
      seoDescription: 'In Agadir, capture every tourist, family, and peak-season visitor. Emails, Google reviews, Instagram — collected automatically.',
      localPitch: 'Built for seasonal hospitality: email collect + Google reviews + Instagram in one scan.',
    },
  },
  {
    slug: 'fes',
    country: 'maroc',
    displayName: 'Fès',
    fr: {
      heroTitle1: 'À Fès, chaque visite dans votre commerce',
      heroTitle2: 'peut devenir un avis 5 étoiles.',
      seoTitle: 'Win & Win Fès — Jeux QR pour commerces et restaurants',
      seoDescription: 'À Fès, transformez chaque visite en avis Google et en client récurrent. Setup en 10 minutes.',
      localPitch: 'Équipe francophone joignable sur WhatsApp — support depuis Casablanca.',
    },
    en: {
      heroTitle1: 'In Fès, every visit',
      heroTitle2: 'can become a 5-star review.',
      seoTitle: 'Win & Win Fès — QR games for shops and restaurants',
      seoDescription: 'In Fès, turn every visit into a Google review and a recurring customer. Setup in 10 minutes.',
      localPitch: 'French-speaking team on WhatsApp — support from Casablanca.',
    },
  },
  {
    slug: 'paris',
    country: 'france',
    displayName: 'Paris',
    fr: {
      heroTitle1: 'À Paris, vos clients passent une fois',
      heroTitle2: 'et disparaissent dans la ville.',
      seoTitle: 'Win & Win Paris — Jeux QR pour restaurants, cafés et boutiques',
      seoDescription: 'À Paris, faites revenir vos clients avec un jeu QR simple, sans app à télécharger. Avis Google, Instagram, coupons intelligents.',
      localPitch: 'Support en français, facturation avec TVA française. Livré partout à Paris.',
    },
    en: {
      heroTitle1: 'In Paris, customers pass through',
      heroTitle2: 'and vanish into the city.',
      seoTitle: 'Win & Win Paris — QR games for restaurants, cafés and shops',
      seoDescription: 'In Paris, bring customers back with a simple QR game — no app to install. Google reviews, Instagram, smart coupons.',
      localPitch: 'French-language support, French VAT invoicing. Delivered anywhere in Paris.',
    },
  },
  {
    slug: 'lyon',
    country: 'france',
    displayName: 'Lyon',
    fr: {
      heroTitle1: 'À Lyon, chaque scan devient',
      heroTitle2: 'un client qui revient.',
      seoTitle: 'Win & Win Lyon — QR loyalty pour commerces lyonnais',
      seoDescription: 'À Lyon, transformez vos visiteurs en habitués. Wheel of Fortune, coupons intelligents, dashboard temps réel.',
      localPitch: 'Support français depuis Casablanca. Facturation TVA française.',
    },
    en: {
      heroTitle1: 'In Lyon, every scan becomes',
      heroTitle2: 'a returning customer.',
      seoTitle: 'Win & Win Lyon — QR loyalty for local businesses',
      seoDescription: 'In Lyon, turn visitors into regulars. Wheel of Fortune, smart coupons, real-time dashboard.',
      localPitch: 'French support from Casablanca. French VAT invoicing.',
    },
  },
  {
    slug: 'marseille',
    country: 'france',
    displayName: 'Marseille',
    fr: {
      heroTitle1: 'À Marseille, un simple QR',
      heroTitle2: 'peut relancer votre commerce.',
      seoTitle: 'Win & Win Marseille — QR games pour restaurants et cafés',
      seoDescription: 'À Marseille, capturez les touristes, fidélisez vos habitués, et boostez votre note Google. En moins de 10 minutes.',
      localPitch: 'Adapté au trafic mixte touristes/locaux. Livraison rapide.',
    },
    en: {
      heroTitle1: 'In Marseille, a simple QR',
      heroTitle2: 'can jump-start your business.',
      seoTitle: 'Win & Win Marseille — QR games for restaurants and cafés',
      seoDescription: 'In Marseille, capture tourists, retain regulars, and boost your Google rating. In under 10 minutes.',
      localPitch: 'Built for mixed tourist / local traffic. Fast delivery.',
    },
  },
]

export function findCity(country: Country, slug: string): CityMeta | null {
  return CITIES.find((c) => c.country === country && c.slug === slug) ?? null
}
