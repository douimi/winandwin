export interface BusinessTheme {
  category: string
  label: string
  // Decorative elements
  bgEmojis: string[]           // 6-8 emojis that float in background
  spinButtonText: string       // e.g., "SPIN!" or "TOURNER!"
  spinButtonIcon: string       // emoji on the spin button
  tryAgainText: string         // text for "try again" segments
  tryAgainEmoji: string        // emoji for try again segments
  // Themed text
  defaultTitle: string         // default game title if none set
  defaultSubtitle: string      // default subtitle if none set
  winTitle: string             // "You Won!" equivalent
  loseTitle: string            // "Almost!" equivalent
  loseMessage: string          // encouragement message
  // Visual accents
  accentEmoji: string          // main emoji for the business
  decorPattern: string         // CSS pattern for subtle background texture
}

export const BUSINESS_THEMES: Record<string, BusinessTheme> = {
  restaurant: {
    category: 'restaurant',
    label: 'Restaurant',
    bgEmojis: ['\u{1F355}', '\u{1F35D}', '\u{1F377}', '\u{1F957}', '\u{1F370}', '\u{1F37D}\u{FE0F}', '\u{1F9D1}\u{200D}\u{1F373}', '\u{1F942}'],
    spinButtonText: 'SPIN!',
    spinButtonIcon: '\u{1F37D}\u{FE0F}',
    tryAgainText: 'Next time!',
    tryAgainEmoji: '\u{1F340}',
    defaultTitle: 'Spin & Dine!',
    defaultSubtitle: 'Try your luck and win a delicious treat!',
    winTitle: 'Bon App\u00E9tit! \u{1F389}',
    loseTitle: 'Almost! \u{1F340}',
    loseMessage: 'Come back next time for another chance to win a tasty prize!',
    accentEmoji: '\u{1F37D}\u{FE0F}',
    decorPattern: 'radial-gradient(circle at 20% 80%, rgba(255,165,0,0.05) 0%, transparent 50%)',
  },
  cafe: {
    category: 'cafe',
    label: 'Caf\u00E9',
    bgEmojis: ['\u{2615}', '\u{1F9C1}', '\u{1F950}', '\u{1F369}', '\u{1FAD6}', '\u{1F36A}', '\u{1F96F}', '\u{2615}'],
    spinButtonText: 'SPIN!',
    spinButtonIcon: '\u{2615}',
    tryAgainText: 'Try again!',
    tryAgainEmoji: '\u{2615}',
    defaultTitle: 'Spin & Sip!',
    defaultSubtitle: 'Win a free coffee or treat on your next visit!',
    winTitle: 'Sweet Win! \u{2615}',
    loseTitle: 'Not this time! \u{1F950}',
    loseMessage: 'Come back tomorrow for another shot at a free coffee!',
    accentEmoji: '\u{2615}',
    decorPattern: 'radial-gradient(circle at 80% 20%, rgba(139,90,43,0.04) 0%, transparent 50%)',
  },
  bar: {
    category: 'bar',
    label: 'Bar',
    bgEmojis: ['\u{1F378}', '\u{1F379}', '\u{1F3B5}', '\u{1F37A}', '\u{1F943}', '\u{1F3B6}', '\u{1F37B}', '\u{1F3A4}'],
    spinButtonText: 'SPIN!',
    spinButtonIcon: '\u{1F378}',
    tryAgainText: 'Cheers!',
    tryAgainEmoji: '\u{1F37B}',
    defaultTitle: 'Lucky Spin!',
    defaultSubtitle: 'Spin the wheel for a chance to win a free drink!',
    winTitle: 'Cheers! \u{1F389}',
    loseTitle: 'Close one! \u{1F378}',
    loseMessage: 'Come back for happy hour and try again!',
    accentEmoji: '\u{1F378}',
    decorPattern: 'radial-gradient(circle at 50% 100%, rgba(128,0,128,0.04) 0%, transparent 50%)',
  },
  retail: {
    category: 'retail',
    label: 'Retail Store',
    bgEmojis: ['\u{1F6CD}\u{FE0F}', '\u{1F381}', '\u{1F48E}', '\u{1F457}', '\u{1F3F7}\u{FE0F}', '\u{2728}', '\u{1F6D2}', '\u{1F4B0}'],
    spinButtonText: 'SPIN!',
    spinButtonIcon: '\u{1F6CD}\u{FE0F}',
    tryAgainText: 'Try again!',
    tryAgainEmoji: '\u{1F3F7}\u{FE0F}',
    defaultTitle: 'Shop & Win!',
    defaultSubtitle: 'Spin for exclusive discounts and surprises!',
    winTitle: 'Great Deal! \u{1F381}',
    loseTitle: 'So close! \u{1F3F7}\u{FE0F}',
    loseMessage: 'Visit us again for another chance at amazing deals!',
    accentEmoji: '\u{1F6CD}\u{FE0F}',
    decorPattern: 'radial-gradient(circle at 30% 30%, rgba(255,20,147,0.04) 0%, transparent 50%)',
  },
  salon: {
    category: 'salon',
    label: 'Salon',
    bgEmojis: ['\u{1F487}', '\u{1F485}', '\u{2728}', '\u{1F486}', '\u{1FA9E}', '\u{1F490}', '\u{1F338}', '\u{1F4AB}'],
    spinButtonText: 'SPIN!',
    spinButtonIcon: '\u{2728}',
    tryAgainText: 'Next visit!',
    tryAgainEmoji: '\u{1F338}',
    defaultTitle: 'Glow & Win!',
    defaultSubtitle: 'Spin for a free beauty treatment!',
    winTitle: 'Beautiful Win! \u{2728}',
    loseTitle: 'Almost! \u{1F4AB}',
    loseMessage: 'Book your next appointment and try again!',
    accentEmoji: '\u{1F487}',
    decorPattern: 'radial-gradient(circle at 70% 70%, rgba(255,182,193,0.05) 0%, transparent 50%)',
  },
  gym: {
    category: 'gym',
    label: 'Gym / Fitness',
    bgEmojis: ['\u{1F4AA}', '\u{1F3CB}\u{FE0F}', '\u{1F947}', '\u{26A1}', '\u{1F3C3}', '\u{1F3AF}', '\u{1F525}', '\u{1F3C6}'],
    spinButtonText: 'GO!',
    spinButtonIcon: '\u{1F4AA}',
    tryAgainText: 'Keep going!',
    tryAgainEmoji: '\u{1F4AA}',
    defaultTitle: 'Power Spin!',
    defaultSubtitle: 'Win a free session or exclusive fitness perk!',
    winTitle: 'Champion! \u{1F3C6}',
    loseTitle: 'Keep pushing! \u{1F4AA}',
    loseMessage: 'Winners never quit! Come back tomorrow!',
    accentEmoji: '\u{1F3CB}\u{FE0F}',
    decorPattern: 'radial-gradient(circle at 20% 50%, rgba(255,69,0,0.04) 0%, transparent 50%)',
  },
  entertainment: {
    category: 'entertainment',
    label: 'Entertainment',
    bgEmojis: ['\u{1F3AC}', '\u{1F3AD}', '\u{1F3AA}', '\u{1F3AF}', '\u{1F3AE}', '\u{1F3B5}', '\u{1F3B8}', '\u{1F31F}'],
    spinButtonText: 'PLAY!',
    spinButtonIcon: '\u{1F3AC}',
    tryAgainText: 'Encore!',
    tryAgainEmoji: '\u{1F3AD}',
    defaultTitle: 'Show Time!',
    defaultSubtitle: 'Spin for free tickets and exclusive experiences!',
    winTitle: 'Standing Ovation! \u{1F3AD}',
    loseTitle: 'Intermission! \u{1F3AC}',
    loseMessage: 'The show must go on! Try again tomorrow!',
    accentEmoji: '\u{1F3AC}',
    decorPattern: 'radial-gradient(circle at 50% 50%, rgba(255,215,0,0.04) 0%, transparent 50%)',
  },
  hotel: {
    category: 'hotel',
    label: 'Hotel',
    bgEmojis: ['\u{1F3E8}', '\u{1F6CE}\u{FE0F}', '\u{1F305}', '\u{1F9F3}', '\u{2708}\u{FE0F}', '\u{1F334}', '\u{1F37E}', '\u{2B50}'],
    spinButtonText: 'SPIN!',
    spinButtonIcon: '\u{1F6CE}\u{FE0F}',
    tryAgainText: 'Next stay!',
    tryAgainEmoji: '\u{1F305}',
    defaultTitle: 'VIP Spin!',
    defaultSubtitle: 'Win room upgrades and exclusive hotel perks!',
    winTitle: 'VIP Treatment! \u{1F31F}',
    loseTitle: 'Next stay! \u{1F3E8}',
    loseMessage: 'Your next visit could be the lucky one!',
    accentEmoji: '\u{1F3E8}',
    decorPattern: 'radial-gradient(circle at 80% 80%, rgba(0,100,200,0.04) 0%, transparent 50%)',
  },
  other: {
    category: 'other',
    label: 'Other',
    bgEmojis: ['\u{1F381}', '\u{2B50}', '\u{1F389}', '\u{1F3C6}', '\u{1F4AB}', '\u{2728}', '\u{1F3AF}', '\u{1F31F}'],
    spinButtonText: 'SPIN!',
    spinButtonIcon: '\u{1F3AF}',
    tryAgainText: 'Try again!',
    tryAgainEmoji: '\u{1F340}',
    defaultTitle: 'Lucky Spin!',
    defaultSubtitle: 'Try your luck and win amazing prizes!',
    winTitle: 'You Won! \u{1F389}',
    loseTitle: 'So Close! \u{1F340}',
    loseMessage: 'Come back tomorrow for another chance!',
    accentEmoji: '\u{1F381}',
    decorPattern: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 50%)',
  },
}

export function getBusinessTheme(category: string): BusinessTheme {
  return BUSINESS_THEMES[category] ?? BUSINESS_THEMES['other']!
}
