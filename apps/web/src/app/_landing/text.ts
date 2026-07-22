// Landing-page copy — bilingual (FR primary, EN toggle).
//
// Structure notes for future edits:
//   - Both locales must expose the SAME keys. TypeScript enforces this via
//     LandingText (inferred from the fr shape) — if you add a key in fr, tsc
//     will flag every EN string you forgot to add.
//   - Comparison / battle table headers + FAQ groups live here as arrays.
//   - Icons and structural constants stay in the section components.

// Contact / WhatsApp — shared constants used by the contact section and the
// floating WhatsApp button. wa.me / hex / display are locale-agnostic.
export const WHATSAPP_NUMBER_E164 = '212628823717'
export const WHATSAPP_DISPLAY = '+212 6 28 82 37 17'
export const WHATSAPP_PREFILL_FR =
  'Bonjour, je souhaite plus d’informations sur Win & Win.'
export const WHATSAPP_PREFILL_EN =
  'Hi, I would like more information about Win & Win.'

export function whatsAppUrl(lang: Lang) {
  const msg = lang === 'fr' ? WHATSAPP_PREFILL_FR : WHATSAPP_PREFILL_EN
  return `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(msg)}`
}

// ─────────────────────────────────────────────────────────────────────
// French (primary) — this is the shape all other locales must match.
// ─────────────────────────────────────────────────────────────────────
const fr = {

  // Hero — loss-aversion framing
  heroEyebrow: '🇲🇦 Testé au Maroc et en France',
  heroTitle1: 'Vos clients passent,',
  heroTitle2: 'oublient, et ne reviennent jamais.',
  heroTitleAccent: 'On règle ça en 10 minutes.',
  heroSubtitle:
    'Placez un QR code sur vos tables. Vos clients laissent un avis Google, vous suivent sur Instagram, puis tentent la roue pour gagner un prix. Vous récoltez des avis, des abonnés, et des visites récurrentes — sans lever le petit doigt.',
  heroCtaWhatsApp: 'Démarrer sur WhatsApp',
  heroCtaDemo: 'Voir la démo',
  heroTrust1: '4,8/5 satisfaction',
  heroTrust2: '500+ commerces',
  heroTrust3: '+200 avis/mois en moyenne',
  tryNow: 'Grattez pour voir ce que vos clients vivent',

  // Nav
  navHow: 'Comment ça marche',
  navGames: 'Jeux',
  navFeatures: 'Fonctionnalités',
  navPlans: 'Tarifs',
  navContact: 'Contact',
  signIn: 'Connexion',
  signUp: 'Inscription',
  contactUs: 'Nous contacter',
  myDashboard: 'Mon tableau de bord',

  // Live activity ticker (under hero)
  tickerLabel: 'En direct',
  ticker: [
    '🎉 Salma vient de gagner un café gratuit chez Café Hafa — il y a 2 min',
    '⭐ Riad Jardin a reçu un nouvel avis 5 étoiles — il y a 4 min',
    '🎯 Pâtisserie Amoud a atteint 100 avis Google — il y a 8 min',
    '🎁 Amine a gagné un dessert chez Restaurant Al Fassia — il y a 11 min',
    '📸 Salon Beauté a gagné 12 nouveaux abonnés Instagram — il y a 14 min',
  ],

  // How it works
  howItWorks: '3 étapes. C\'est tout.',
  howItWorksSubtitle:
    'De la création à la première partie en moins de 10 minutes.',
  step1: 'Créez votre jeu',
  step1Desc:
    'Roue de la fortune, machine à sous ou boîte mystère. Vous choisissez les prix, les taux de gain, votre ambiance.',
  step1Practical: 'Café Atlas a mis son jeu en ligne en 4 minutes.',
  step2: 'Partagez votre QR code',
  step2Desc:
    'Imprimé sur les chevalets de table, menus, tickets de caisse ou stickers en vitrine. Les clients scannent avec leur téléphone.',
  step2Practical: 'Aucune app à télécharger côté client.',
  step3: 'Vos clients jouent & gagnent',
  step3Desc:
    'Ils complètent une action (avis Google, follow Instagram, WhatsApp), jouent, et reçoivent leur coupon par email.',
  step3Practical: 'Les coupons sont validés en boutique en 3 secondes.',

  // Games section
  games: 'Choisissez votre jeu',
  gamesEyebrow: 'Interactif — testez-les',
  gamesTapToPlay: 'Cliquez pour jouer',
  gamesSubtitle:
    'Faites tourner, grattez, tapez — vos clients choisissent leur émotion.',
  gameWheel: 'Roue de la Fortune',
  gameWheelDesc:
    'Le classique. Le suspense de la rotation, le "presque" avant le prix. Marche pour tout type de commerce.',
  gameSlots: 'Machine à Sous',
  gameSlotsDesc:
    'Ambiance casino, rouleaux qui s\'alignent, effet jackpot. Parfait pour bars, événements, soirées.',
  gameMystery: 'Boîte Mystère',
  gameMysteryDesc:
    'Un tap, la boîte s\'ouvre, confettis. Simple, addictif, idéal pour cafés et pâtisseries.',
  gameBestFor: 'Idéal pour',

  // Features — benefit + number headlines
  features: 'Tout ce qu\'il vous faut pour engager vos clients',
  featuresSubtitle: 'Plus d\'avis. Plus d\'abonnés. Plus de visites qui reviennent.',
  featureReviews: 'Récoltez +200 avis Google par mois',
  featureReviewsDesc:
    'L\'avis est l\'action requise avant de jouer. Vos clients laissent 5 étoiles avant de tenter la roue.',
  featureSocial: 'Doublez vos abonnés Instagram en 6 semaines',
  featureSocialDesc:
    'Instagram, TikTok, Facebook, WhatsApp — le suivi social devient le ticket pour jouer.',
  featureCoupons: 'Coupons intelligents à durée limitée',
  featureCouponsDesc:
    'Expiration, délai d\'activation, jusqu\'à 3 conditions par prix (« sous réserve de consommation »).',
  featureAnalytics: 'Dashboard en temps réel',
  featureAnalyticsDesc:
    'Voyez chaque scan, chaque partie, chaque coupon utilisé. Filtres par période, export CSV.',
  featureFraud: '1 partie par client, garantie',
  featureFraudDesc:
    'Empreinte digitale du terminal. Impossible de jouer plusieurs fois depuis le même téléphone.',
  featureBrand: 'À vos couleurs, votre logo, votre ambiance',
  featureBrandDesc:
    'Choix de 4 ambiances prêtes ou palette 100% personnalisée. Le jeu ressemble à votre marque.',
  featureLanguages: 'Vos clients jouent en FR, EN, ES, AR',
  featureLanguagesDesc:
    'La langue du jeu s\'adapte automatiquement à celle choisie côté commerce.',
  featureValidation: 'Validation en boutique en 3 secondes',
  featureValidationDesc:
    'Votre staff scanne le QR du coupon, entre un PIN, le coupon est marqué comme utilisé. Impossible à réutiliser.',

  // Battle / comparison table — the killer section
  battleTitle: 'Pourquoi Win & Win plutôt qu\'un autre outil de QR ?',
  battleSubtitle:
    'Une comparaison honnête. Ce que vous obtenez de plus, ligne par ligne.',
  battleWinWin: 'Win & Win',
  battleOthers: 'Outils QR classiques',
  battleRows: [
    { label: 'Jeux disponibles', ours: '3 (Roue, Machine à sous, Boîte mystère)', theirs: '1 (roue uniquement)' },
    { label: 'Langues côté client', ours: 'FR, EN, ES, AR', theirs: 'FR uniquement' },
    { label: 'Anti-fraude', ours: 'Empreinte digitale du terminal', theirs: 'Basique ou absent' },
    { label: 'Conditions de retrait par prix', ours: 'Jusqu\'à 3 par prix', theirs: 'Non' },
    { label: 'Expiration configurable par prix', ours: 'Oui, individuelle', theirs: 'Uniforme' },
    { label: 'Support WhatsApp direct', ours: 'Oui, réponse < 15 min', theirs: 'Parfois' },
    { label: 'Personnalisation ambiance', ours: '4 ambiances + palette 100% custom', theirs: 'Couleurs uniquement' },
    { label: 'Multi-établissements', ours: 'Enterprise inclus', theirs: 'Payant' },
    { label: 'Export CSV joueurs & coupons', ours: 'Illimité', theirs: 'Limité ou absent' },
  ],
  battleFooter: 'Vous avez déjà une solution ? On vous aide à migrer sans friction.',

  // Pricing
  plans: 'Tarifs simples. Grands résultats.',
  plansSubtitle: 'Commencez gratuitement. Payez quand vous êtes prêt.',
  perMonth: '/mois',
  custom: 'Sur mesure',
  trialNote: 'Essai gratuit 14 jours inclus. Aucune carte bancaire requise.',
  planRecommended: 'Le plus choisi',
  planRoiStarter: 'Rentabilisé dès 5 clients fidèles',
  planRoiPro: 'Rentabilisé dès 8 nouveaux avis Google',
  planRoiEnterprise: 'Multi-établissements, marque blanche, API',

  // FAQ — grouped
  faqHeading: 'Vos questions',
  faqGroups: [
    {
      title: 'Démarrage',
      questions: [
        {
          q: 'Combien de temps pour être en ligne ?',
          a: 'La plupart des commerces sont opérationnels en moins de 10 minutes : vous créez votre jeu, téléchargez le QR code, et le placez sur vos tables.',
        },
        {
          q: 'Faut-il télécharger une application ?',
          a: 'Non. Vos clients scannent le QR et jouent directement dans leur navigateur mobile. Aucune app à installer côté client.',
        },
        {
          q: 'Puis-je essayer gratuitement ?',
          a: 'Oui. Tous les plans incluent un essai gratuit de 14 jours, sans carte bancaire.',
        },
        {
          q: 'Où doit-on placer le QR code ?',
          a: 'Sur les chevalets de table, au dos des tickets de caisse, sur les menus, en vitrine, ou même sur l\'écran d\'attente. On vous aide à choisir le meilleur emplacement selon votre commerce.',
        },
        {
          q: 'Comment se passe la mise en place ?',
          a: 'Vous vous inscrivez, choisissez votre jeu, ajoutez vos prix, et téléchargez votre flyer QR au format PDF. Support disponible sur WhatsApp si vous voulez qu\'on vous accompagne.',
        },
      ],
    },
    {
      title: 'Fonctionnement',
      questions: [
        {
          q: 'Comment fonctionne l\'anti-fraude ?',
          a: 'Chaque terminal client est identifié par une empreinte digitale (résolution écran, GPU, timezone, etc.). Un même téléphone ne peut pas jouer plusieurs fois pendant la période de cooldown que vous configurez.',
        },
        {
          q: 'Puis-je limiter le nombre de gagnants ?',
          a: 'Oui. Vous fixez un plafond par prix (« max 5 gagnants par jour ») et un plafond total (« 100 gagnants au total »). Le prix est retiré de la roue automatiquement une fois atteint.',
        },
        {
          q: 'Comment un client réclame son prix en boutique ?',
          a: 'Le client montre le coupon reçu par email. Votre staff scanne le QR code du coupon, entre le PIN de validation, et le coupon est marqué comme utilisé. Impossible à réutiliser.',
        },
        {
          q: 'Puis-je changer les prix à tout moment ?',
          a: 'Oui. Vous pouvez ajouter, éditer, supprimer ou réinitialiser un prix à tout moment depuis votre dashboard. Les coupons déjà gagnés restent valables.',
        },
        {
          q: 'Les coupons expirent-ils ?',
          a: 'Vous choisissez la durée par prix : 1 semaine, 1 mois, 3 mois, ou personnalisé. Un délai d\'activation est également configurable (« utilisable dès demain », « activation immédiate »).',
        },
      ],
    },
    {
      title: 'Tarifs & support',
      questions: [
        {
          q: 'Puis-je changer de plan ?',
          a: 'Oui, à tout moment. Vous nous écrivez sur WhatsApp et on gère le changement dans la journée.',
        },
        {
          q: 'Y a-t-il un engagement de durée ?',
          a: 'Aucun. Vous êtes libre d\'arrêter à tout moment. Pas de frais de résiliation.',
        },
        {
          q: 'La facturation inclut-elle la TVA ?',
          a: 'Oui, TVA marocaine 20% ou TVA française 20% selon le pays de facturation. Facture PDF envoyée chaque mois.',
        },
        {
          q: 'Le support est-il en français ?',
          a: 'Oui. Support en français par WhatsApp et par email. Temps de réponse moyen : moins de 15 minutes en journée ouvrée.',
        },
        {
          q: 'Que se passe-t-il si je dépasse mon quota de parties ?',
          a: 'Le jeu reste actif. On vous prévient à 80% du quota et on vous propose de passer au plan supérieur — jamais de coupure surprise.',
        },
      ],
    },
  ],

  // Contact
  getStarted: 'Prêt à faire revenir vos clients ?',
  getStartedSub: 'Votre premier jeu en 10 minutes. 14 jours gratuits. Sans carte bancaire.',
  basedIn: 'Basé à Casablanca, Maroc',
  whatsAppFast: 'Réponse en moyenne en 12 minutes sur WhatsApp',
  whatsAppCardTitle: 'Une question ? Écrivez-nous sur WhatsApp',
  whatsAppCardSub: 'Réponse rapide au',
  whatsAppCardOpen: 'Ouvrir WhatsApp',
  formOrLine: 'ou remplissez le formulaire',
  businessName: 'Nom de l\'entreprise',
  yourName: 'Votre nom',
  email: 'Email',
  phone: 'Téléphone',
  businessType: 'Type d\'activité',
  message: 'Message',
  sendBtn: 'Envoyer',
  sending: 'Envoi...',
  thankYou: 'Merci ! Nous vous contacterons sous 24 heures.',
  selectBusinessType: 'Sélectionnez votre type d\'activité',
  phoneSuffix: '(optionnel)',
  messageSuffix: '(optionnel)',
  messagePlaceholder: 'Parlez-nous de votre activité et de vos objectifs...',
  confirmEmail: 'Vérifiez votre boîte de réception pour un email de confirmation.',
  errorMsg: 'Une erreur est survenue. Veuillez réessayer.',

  // Footer
  trusted: 'Approuvé par plus de 500 commerces au Maroc et en France',
  madeWith: 'Fait avec',
  inMorocco: 'au Maroc',
  terms: 'Conditions générales',
  privacy: 'Politique de confidentialité',
  confidentiality: 'Notice de confidentialité',
  contact: 'Contact',
  copyright: '© 2026 Win & Win. Tous droits réservés.',

  // ── Industries section (Wave 2) ────────────────────────────────
  industriesTitle: 'Quelle que soit votre activité, on a le bon jeu',
  industriesSubtitle: 'Six exemples concrets. Cliquez sur votre secteur pour voir ce que Win & Win change chez vous.',
  industryTakeQuizCta: 'Vous ne savez pas lequel choisir ?',
  industries: [
    {
      key: 'restaurant',
      emoji: '🍽️',
      label: 'Restaurant',
      merchant: 'Restaurant Al Fassia',
      city: 'Casablanca',
      pain: 'Vos clients viennent une fois, gèrent leur addition, et disparaissent — sans même noter leur passage sur Google.',
      quote: '« En 30 jours, on est passés de 3.8 à 4.5 étoiles sur Google. Nos réservations du weekend ont doublé. »',
      stats: [
        { value: '+47', label: 'Avis Google en 30j' },
        { value: '×2', label: 'Réservations weekend' },
        { value: '4.5★', label: 'Note Google' },
      ],
      flyerHeadline: 'Notez-nous & tentez la chance',
      flyerSub: 'Dessert offert · Café offert · 20% de remise',
    },
    {
      key: 'cafe',
      emoji: '☕',
      label: 'Café',
      merchant: 'Café Hafa',
      city: 'Casablanca',
      pain: 'Passage énorme au comptoir mais aucun retour client, aucune donnée, aucun moyen de re-toucher les gens.',
      quote: '« On collecte 180 emails par mois maintenant. Nos newsletters génèrent 20% de visites en plus. »',
      stats: [
        { value: '180', label: 'Emails/mois' },
        { value: '+62%', label: 'Retour client' },
        { value: '1,8k', label: 'Parties jouées' },
      ],
      flyerHeadline: 'Scannez, jouez, gagnez',
      flyerSub: 'Café offert · Muffin gratuit · 15% de remise',
    },
    {
      key: 'salon',
      emoji: '💇',
      label: 'Salon',
      merchant: 'Salon Beauté',
      city: 'Rabat',
      pain: 'Les clientes viennent, apprécient, mais oublient de partager. Instagram plafonne à quelques centaines d\'abonnées.',
      quote: '« Notre Instagram est passé de 800 à 2 400 abonnées en 6 semaines. Beaucoup de nouvelles clientes viennent grâce à ça. »',
      stats: [
        { value: '×3', label: 'Abonnés Instagram' },
        { value: '+34', label: 'Nouvelles clientes/mois' },
        { value: '4.8★', label: 'Note Google' },
      ],
      flyerHeadline: 'Suivez-nous et tentez la roue',
      flyerSub: 'Soin cheveux · Manucure offerte · 25% de remise',
    },
    {
      key: 'gym',
      emoji: '🏋️',
      label: 'Salle de sport',
      merchant: 'Gym Atlas',
      city: 'Marrakech',
      pain: 'Beaucoup de curieux à l\'accueil qui repartent sans essayer. Aucun moyen de capturer leur email pour un rappel.',
      quote: '« On capture 210 emails par mois maintenant. 40 % passent en cours d\'essai. »',
      stats: [
        { value: '210', label: 'Emails/mois' },
        { value: '40%', label: 'Passent en essai' },
        { value: '+18', label: 'Abonnements/mois' },
      ],
      flyerHeadline: 'Tentez le jackpot fitness',
      flyerSub: 'Cours d\'essai · Séance PT · Shaker offert',
    },
    {
      key: 'boulangerie',
      emoji: '🥖',
      label: 'Boulangerie',
      merchant: 'Pâtisserie Amoud',
      city: 'Casablanca',
      pain: 'Beaucoup de passage rapide, aucune fidélisation. Les clients achètent une pâtisserie et repartent.',
      quote: '« 4 clients sur 10 reviennent maintenant dans les 15 jours. Le samedi matin est deux fois plus fréquenté. »',
      stats: [
        { value: '4/10', label: 'Reviennent en 15j' },
        { value: '×2', label: 'Samedi matin' },
        { value: '+83', label: 'Avis Google' },
      ],
      flyerHeadline: 'Grattez pour votre gourmandise',
      flyerSub: 'Croissant offert · Café + pâtisserie · 20% de remise',
    },
    {
      key: 'retail',
      emoji: '🛍️',
      label: 'Retail',
      merchant: 'Store Casablanca',
      city: 'Casablanca',
      pain: 'Beaucoup de visites dans la boutique mais aucun avis en ligne. La note Google plafonne à 3,5.',
      quote: '« On a collecté 320 avis Google en 3 mois. Notre note est passée de 3,4 à 4,7. »',
      stats: [
        { value: '+320', label: 'Avis en 3 mois' },
        { value: '4.7★', label: 'Note Google' },
        { value: '+25%', label: 'Trafic boutique' },
      ],
      flyerHeadline: 'Notez votre expérience',
      flyerSub: 'Bon d\'achat · Article offert · 30% de remise',
    },
  ],

  // ── Dashboard preview (Wave 2) ─────────────────────────────────
  dashboardTitle: 'Voilà ce que voit',
  dashboardSubtitle: 'Chaque scan, chaque jeu, chaque coupon utilisé — mis à jour en temps réel dans votre navigateur.',
  dashboardKpiPlayers: 'Joueurs actifs',
  dashboardKpiPlays: 'Parties',
  dashboardKpiReviews: 'Nouveaux avis Google',
  dashboardKpiRedeemed: 'Coupons utilisés',
  dashboardChart: 'Activité 7 derniers jours',
  dashboardWatermark: 'Aperçu — vos vrais chiffres seront ici.',
  dashboardMerchants: ['Café Hafa', 'Riad Jardin', 'Restaurant Al Fassia', 'Salon Beauté', 'Pâtisserie Amoud'],

  // ── Annual pricing toggle (Wave 2) ─────────────────────────────
  billingMonthly: 'Mensuel',
  billingAnnual: 'Annuel',
  billingAnnualSavings: 'Économisez 20%',
  billingAnnualHint: 'Facturé annuellement',

  // ── Case studies (Wave 3) ──────────────────────────────────────
  caseStudiesTitle: 'Ils sont passés à Win & Win. Ils racontent.',
  caseStudiesSubtitle: '3 commerces marocains, 3 histoires, 3 après-avants réels.',
  caseStudyReadMore: 'Lire l\'étude complète',

  // ── ROI calculator (Wave 3) ────────────────────────────────────
  roiTitle: 'Combien Win & Win pourrait rapporter à votre commerce ?',
  roiSubtitle: 'Deux curseurs, une estimation instantanée basée sur nos merchants moyens.',
  roiVisitorsLabel: 'Clients / mois',
  roiTicketLabel: 'Ticket moyen',
  roiOutputReviews: 'Avis Google estimés',
  roiOutputReturning: 'Clients récurrents',
  roiOutputRoi: 'ROI en',
  roiOutputRoiUnit: 'semaines',
  roiFootnote: 'Estimations basées sur 500+ commerces actifs. Résultats réels variables selon secteur et emplacement.',
  roiPerMonth: '/mois',

  // ── Quiz (Wave 3) ──────────────────────────────────────────────
  quizCta: 'Faire le quiz : quel jeu pour vous ?',
  quizTitle: 'Quel jeu correspond à votre commerce ?',
  quizSubtitle: '2 questions, 15 secondes. On vous recommande le meilleur jeu pour votre activité.',
  quizQ1: 'Quel type de commerce avez-vous ?',
  quizQ1Options: [
    { key: 'restaurant', label: 'Restaurant / Café / Bar', emoji: '🍽️' },
    { key: 'retail', label: 'Boutique / Salon', emoji: '🛍️' },
    { key: 'event', label: 'Événementiel / Bar de nuit', emoji: '🎉' },
    { key: 'other', label: 'Autre', emoji: '🎯' },
  ],
  quizQ2: 'Quelle est votre priorité ?',
  quizQ2Options: [
    { key: 'reviews', label: 'Récolter des avis Google', emoji: '⭐' },
    { key: 'return', label: 'Faire revenir mes clients', emoji: '🔁' },
    { key: 'social', label: 'Grandir sur Instagram / TikTok', emoji: '📸' },
    { key: 'email', label: 'Capturer des emails', emoji: '📧' },
  ],
  quizResultTitle: 'Notre recommandation pour vous',
  quizResultCta: 'Discuter de mon jeu sur WhatsApp',
  quizBack: 'Retour',
  quizContinue: 'Continuer',

  // Micro copy
  businesses: 'Commerces',
  gamesPlayed: 'Parties jouées',
  satisfaction: 'Satisfaction',
  seePlans: 'Voir les tarifs',
}

// ─────────────────────────────────────────────────────────────────────
// English — must expose the same keys as fr. TS enforces this.
// ─────────────────────────────────────────────────────────────────────
// The `Record<Lang, LandingText>` at the bottom enforces that fr + en
// share the same shape — no need to duplicate the type annotation here.
const en = {

  heroEyebrow: '🇲🇦 Tested in Morocco and France',
  heroTitle1: 'Your customers come in,',
  heroTitle2: 'forget you, and never come back.',
  heroTitleAccent: 'Let\'s fix that in 10 minutes.',
  heroSubtitle:
    'Place a QR code on your tables. Your customers leave a Google review, follow you on Instagram, then spin the wheel to win a prize. You collect reviews, followers, and repeat visits — without lifting a finger.',
  heroCtaWhatsApp: 'Start on WhatsApp',
  heroCtaDemo: 'See the demo',
  heroTrust1: '4.8/5 rating',
  heroTrust2: '500+ merchants',
  heroTrust3: '+200 reviews/month on average',
  tryNow: 'Scratch to see what your customers experience',

  navHow: 'How it works',
  navGames: 'Games',
  navFeatures: 'Features',
  navPlans: 'Pricing',
  navContact: 'Contact',
  signIn: 'Sign In',
  signUp: 'Sign Up',
  contactUs: 'Contact us',
  myDashboard: 'My Dashboard',

  tickerLabel: 'Live',
  ticker: [
    '🎉 Salma just won a free coffee at Café Hafa — 2 min ago',
    '⭐ Riad Jardin received a new 5-star review — 4 min ago',
    '🎯 Pâtisserie Amoud hit 100 Google reviews — 8 min ago',
    '🎁 Amine won a dessert at Restaurant Al Fassia — 11 min ago',
    '📸 Salon Beauté gained 12 new Instagram followers — 14 min ago',
  ],

  howItWorks: '3 steps. That\'s it.',
  howItWorksSubtitle: 'From setup to first play in under 10 minutes.',
  step1: 'Create your game',
  step1Desc:
    'Wheel of Fortune, Slot Machine, or Mystery Box. You pick the prizes, the win rates, and the vibe.',
  step1Practical: 'Café Atlas launched their game in 4 minutes.',
  step2: 'Share your QR code',
  step2Desc:
    'Print it on table tents, menus, receipts, or window stickers. Customers scan with their phone.',
  step2Practical: 'No app to download on the customer side.',
  step3: 'Customers play & win',
  step3Desc:
    'They complete an action (Google review, Instagram follow, WhatsApp), play, and receive their coupon by email.',
  step3Practical: 'Coupons validated in-store in 3 seconds.',

  games: 'Pick your game',
  gamesEyebrow: 'Interactive — try them live',
  gamesTapToPlay: 'Tap to play',
  gamesSubtitle: 'Spin, scratch, or tap — your customers choose the thrill.',
  gameWheel: 'Wheel of Fortune',
  gameWheelDesc:
    'The classic. The suspense of the spin, the "almost" before the prize. Works for any business.',
  gameSlots: 'Slot Machine',
  gameSlotsDesc:
    'Casino vibes, rolling reels, jackpot effect. Perfect for bars, events, nightlife.',
  gameMystery: 'Mystery Box',
  gameMysteryDesc:
    'A tap, the box opens, confetti. Simple, addictive, ideal for cafés and pastry shops.',
  gameBestFor: 'Best for',

  features: 'Everything you need to engage your customers',
  featuresSubtitle: 'More reviews. More followers. More return visits.',
  featureReviews: 'Collect +200 Google reviews per month',
  featureReviewsDesc:
    'The review is the ticket to play. Customers leave 5 stars before spinning the wheel.',
  featureSocial: 'Double your Instagram following in 6 weeks',
  featureSocialDesc:
    'Instagram, TikTok, Facebook, WhatsApp — social follows become the entry ticket.',
  featureCoupons: 'Smart, time-limited coupons',
  featureCouponsDesc:
    'Expiration, activation delay, up to 3 conditions per prize ("subject to consumption").',
  featureAnalytics: 'Real-time dashboard',
  featureAnalyticsDesc:
    'See every scan, every play, every redeemed coupon. Period filters, CSV export.',
  featureFraud: '1 play per customer, guaranteed',
  featureFraudDesc:
    'Device fingerprinting. Same phone can\'t play multiple times during the cooldown period.',
  featureBrand: 'Your colors, your logo, your vibe',
  featureBrandDesc:
    '4 ready-made atmospheres or a fully custom palette. The game feels like your brand.',
  featureLanguages: 'Customers play in FR, EN, ES, AR',
  featureLanguagesDesc:
    'The game language matches whichever you configure on the merchant side.',
  featureValidation: 'In-store validation in 3 seconds',
  featureValidationDesc:
    'Staff scans the coupon QR, enters a PIN, coupon is marked used. Impossible to reuse.',

  battleTitle: 'Why Win & Win over any other QR tool?',
  battleSubtitle: 'An honest comparison. What you get more of, line by line.',
  battleWinWin: 'Win & Win',
  battleOthers: 'Typical QR tools',
  battleRows: [
    { label: 'Games available', ours: '3 (Wheel, Slots, Mystery Box)', theirs: '1 (wheel only)' },
    { label: 'Player-side languages', ours: 'FR, EN, ES, AR', theirs: 'FR only' },
    { label: 'Anti-fraud', ours: 'Device fingerprinting', theirs: 'Basic or absent' },
    { label: 'Redemption conditions per prize', ours: 'Up to 3 per prize', theirs: 'No' },
    { label: 'Per-prize expiration', ours: 'Yes, individual', theirs: 'Uniform' },
    { label: 'Direct WhatsApp support', ours: 'Yes, reply in < 15 min', theirs: 'Sometimes' },
    { label: 'Atmosphere customization', ours: '4 atmospheres + fully custom palette', theirs: 'Colors only' },
    { label: 'Multi-location', ours: 'Enterprise included', theirs: 'Paid add-on' },
    { label: 'CSV export (players & coupons)', ours: 'Unlimited', theirs: 'Limited or absent' },
  ],
  battleFooter: 'Already on another platform? We help you migrate without friction.',

  plans: 'Simple pricing. Big results.',
  plansSubtitle: 'Start free. Scale when you\'re ready.',
  perMonth: '/mo',
  custom: 'Custom',
  trialNote: '14-day free trial included. No credit card required.',
  planRecommended: 'Most popular',
  planRoiStarter: 'Pays for itself with 5 loyal customers',
  planRoiPro: 'Pays for itself with 8 new Google reviews',
  planRoiEnterprise: 'Multi-location, white-label, API',

  faqHeading: 'Your questions',
  faqGroups: [
    {
      title: 'Getting started',
      questions: [
        { q: 'How long does setup take?', a: 'Most merchants are live in under 10 minutes: create your game, download the QR, place it on your tables.' },
        { q: 'Is there an app to download?', a: 'No. Customers scan the QR and play in their mobile browser. No app install on the customer side.' },
        { q: 'Is there a free trial?', a: 'Yes. Every plan includes a 14-day free trial, no credit card required.' },
        { q: 'Where should the QR go?', a: 'Table tents, receipts, menus, storefronts, waiting-screen displays. We help you pick the best spot for your business.' },
        { q: 'What does setup look like?', a: 'Sign up, pick a game, add prizes, download your QR flyer as PDF. WhatsApp support available if you want us to help.' },
      ],
    },
    {
      title: 'How it works',
      questions: [
        { q: 'How does the anti-fraud work?', a: 'Each customer device is fingerprinted (screen, GPU, timezone, etc.). The same phone can\'t play multiple times during the cooldown period you configure.' },
        { q: 'Can I cap the number of winners?', a: 'Yes. Per-prize cap ("max 5 winners/day") and a total cap ("100 winners total"). Prizes drop off the wheel automatically once capped.' },
        { q: 'How does the customer redeem in-store?', a: 'They show the emailed coupon. Your staff scans its QR, enters the PIN, and the coupon is marked used. Impossible to reuse.' },
        { q: 'Can I change prizes at any time?', a: 'Yes. Add, edit, delete, or reset a prize whenever from your dashboard. Already-won coupons stay valid.' },
        { q: 'Do coupons expire?', a: 'You pick per prize: 1 week, 1 month, 3 months, or custom. An activation delay is also configurable ("usable tomorrow", "instant").' },
      ],
    },
    {
      title: 'Pricing & support',
      questions: [
        { q: 'Can I change plans?', a: 'Yes, anytime. Message us on WhatsApp and we handle it same day.' },
        { q: 'Is there a lock-in period?', a: 'None. Cancel anytime. No cancellation fees.' },
        { q: 'Is VAT included?', a: 'Yes — 20% Moroccan or French VAT depending on billing country. PDF invoice every month.' },
        { q: 'Is support in French?', a: 'Yes. WhatsApp and email in French. Average reply time: under 15 minutes during business hours.' },
        { q: 'What if I hit my play quota?', a: 'Your game stays live. We alert you at 80% and propose an upgrade — never a surprise cutoff.' },
      ],
    },
  ],

  getStarted: 'Ready to bring your customers back?',
  getStartedSub: 'Your first game in 10 minutes. 14 days free. No credit card.',
  basedIn: 'Based in Casablanca, Morocco',
  whatsAppFast: 'Average reply on WhatsApp: 12 minutes',
  whatsAppCardTitle: 'A question? Chat on WhatsApp',
  whatsAppCardSub: 'Quick reply at',
  whatsAppCardOpen: 'Open WhatsApp',
  formOrLine: 'or use the form',
  businessName: 'Business name',
  yourName: 'Your name',
  email: 'Email',
  phone: 'Phone',
  businessType: 'Business type',
  message: 'Message',
  sendBtn: 'Send',
  sending: 'Sending...',
  thankYou: 'Thanks! We\'ll reach out within 24 hours.',
  selectBusinessType: 'Select your business type',
  phoneSuffix: '(optional)',
  messageSuffix: '(optional)',
  messagePlaceholder: 'Tell us about your business and goals...',
  confirmEmail: 'Check your inbox for a confirmation email.',
  errorMsg: 'Something went wrong. Please try again.',

  trusted: 'Trusted by 500+ merchants across Morocco and France',
  madeWith: 'Made with',
  inMorocco: 'in Morocco',
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  confidentiality: 'Confidentiality Notice',
  contact: 'Contact',
  copyright: '© 2026 Win & Win. All rights reserved.',

  industriesTitle: 'Whatever your business, we\'ve got the right game',
  industriesSubtitle: 'Six real-world examples. Tap your sector to see what changes for you.',
  industryTakeQuizCta: 'Not sure which to pick?',
  industries: [
    { key: 'restaurant', emoji: '🍽️', label: 'Restaurant', merchant: 'Restaurant Al Fassia', city: 'Casablanca', pain: 'Customers come once, pay, and vanish — without even leaving a Google trace.', quote: '"In 30 days we went from 3.8 to 4.5 stars on Google. Weekend bookings doubled."', stats: [ { value: '+47', label: 'Google reviews in 30d' }, { value: '×2', label: 'Weekend bookings' }, { value: '4.5★', label: 'Google rating' } ], flyerHeadline: 'Rate us & try your luck', flyerSub: 'Free dessert · Free coffee · 20% off' },
    { key: 'cafe', emoji: '☕', label: 'Café', merchant: 'Café Hafa', city: 'Casablanca', pain: 'Huge counter traffic but no customer feedback, no data, no way to reach out again.', quote: '"We collect 180 emails a month now. Our newsletters generate 20% more visits."', stats: [ { value: '180', label: 'Emails/month' }, { value: '+62%', label: 'Return rate' }, { value: '1.8k', label: 'Games played' } ], flyerHeadline: 'Scan, play, win', flyerSub: 'Free coffee · Free muffin · 15% off' },
    { key: 'salon', emoji: '💇', label: 'Salon', merchant: 'Salon Beauté', city: 'Rabat', pain: 'Clients come, love it, then forget to share. Instagram stuck at a few hundred followers.', quote: '"Our Instagram went from 800 to 2,400 followers in 6 weeks. Lots of new clients through it."', stats: [ { value: '×3', label: 'Instagram followers' }, { value: '+34', label: 'New clients/month' }, { value: '4.8★', label: 'Google rating' } ], flyerHeadline: 'Follow us and spin the wheel', flyerSub: 'Hair treatment · Free manicure · 25% off' },
    { key: 'gym', emoji: '🏋️', label: 'Gym', merchant: 'Gym Atlas', city: 'Marrakech', pain: 'Lots of curious visitors at reception who leave without trying. No way to capture their email.', quote: '"We capture 210 emails a month now. 40% convert into a trial class."', stats: [ { value: '210', label: 'Emails/month' }, { value: '40%', label: 'Trial conversion' }, { value: '+18', label: 'Memberships/month' } ], flyerHeadline: 'Try the fitness jackpot', flyerSub: 'Trial class · PT session · Free shaker' },
    { key: 'boulangerie', emoji: '🥖', label: 'Bakery', merchant: 'Pâtisserie Amoud', city: 'Casablanca', pain: 'High foot traffic, low loyalty. Customers buy and leave.', quote: '"4 out of 10 customers come back within 15 days. Saturday mornings are twice as busy."', stats: [ { value: '4/10', label: 'Return in 15d' }, { value: '×2', label: 'Saturday mornings' }, { value: '+83', label: 'Google reviews' } ], flyerHeadline: 'Scratch for your treat', flyerSub: 'Free croissant · Coffee + pastry · 20% off' },
    { key: 'retail', emoji: '🛍️', label: 'Retail', merchant: 'Store Casablanca', city: 'Casablanca', pain: 'Plenty of foot traffic, no online reviews. Google rating stuck at 3.5.', quote: '"We collected 320 Google reviews in 3 months. Our rating went from 3.4 to 4.7."', stats: [ { value: '+320', label: 'Reviews in 3mo' }, { value: '4.7★', label: 'Google rating' }, { value: '+25%', label: 'Store traffic' } ], flyerHeadline: 'Rate your experience', flyerSub: 'Store credit · Free item · 30% off' },
  ],

  dashboardTitle: 'Here\'s what',
  dashboardSubtitle: 'Every scan, every play, every redeemed coupon — updated live in your browser.',
  dashboardKpiPlayers: 'Active players',
  dashboardKpiPlays: 'Plays',
  dashboardKpiReviews: 'New Google reviews',
  dashboardKpiRedeemed: 'Coupons redeemed',
  dashboardChart: 'Last 7 days activity',
  dashboardWatermark: 'Preview — your real numbers will be here.',
  dashboardMerchants: ['Café Hafa', 'Riad Jardin', 'Restaurant Al Fassia', 'Salon Beauté', 'Pâtisserie Amoud'],

  billingMonthly: 'Monthly',
  billingAnnual: 'Annual',
  billingAnnualSavings: 'Save 20%',
  billingAnnualHint: 'Billed annually',

  caseStudiesTitle: 'They switched to Win & Win. Here\'s what happened.',
  caseStudiesSubtitle: '3 Moroccan merchants, 3 stories, 3 real before-and-afters.',
  caseStudyReadMore: 'Read the full case study',

  roiTitle: 'How much could Win & Win bring to your business?',
  roiSubtitle: 'Two sliders, an instant estimate based on our average merchants.',
  roiVisitorsLabel: 'Customers / month',
  roiTicketLabel: 'Average ticket',
  roiOutputReviews: 'Estimated Google reviews',
  roiOutputReturning: 'Recurring customers',
  roiOutputRoi: 'ROI in',
  roiOutputRoiUnit: 'weeks',
  roiFootnote: 'Estimates based on 500+ active merchants. Real results vary by sector and location.',
  roiPerMonth: '/month',

  quizCta: 'Take the quiz: which game for you?',
  quizTitle: 'Which game fits your business?',
  quizSubtitle: '2 questions, 15 seconds. We recommend the best game for your activity.',
  quizQ1: 'What type of business do you run?',
  quizQ1Options: [
    { key: 'restaurant', label: 'Restaurant / Café / Bar', emoji: '🍽️' },
    { key: 'retail', label: 'Store / Salon', emoji: '🛍️' },
    { key: 'event', label: 'Events / Nightlife', emoji: '🎉' },
    { key: 'other', label: 'Other', emoji: '🎯' },
  ],
  quizQ2: 'What\'s your priority?',
  quizQ2Options: [
    { key: 'reviews', label: 'Collect Google reviews', emoji: '⭐' },
    { key: 'return', label: 'Bring customers back', emoji: '🔁' },
    { key: 'social', label: 'Grow on Instagram / TikTok', emoji: '📸' },
    { key: 'email', label: 'Capture emails', emoji: '📧' },
  ],
  quizResultTitle: 'Our recommendation for you',
  quizResultCta: 'Discuss my game on WhatsApp',
  quizBack: 'Back',
  quizContinue: 'Continue',

  businesses: 'Merchants',
  gamesPlayed: 'Plays',
  satisfaction: 'Satisfaction',
  seePlans: 'See plans',
}

export type LandingText = typeof fr
export type Lang = 'fr' | 'en'
export const LANDING_TEXT: Record<Lang, LandingText> = { fr, en }
