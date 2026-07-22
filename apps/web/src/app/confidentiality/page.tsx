import type { Metadata } from 'next'
import { LegalShell } from '../_legal/legal-shell'
import type { LegalSection } from '../_legal/legal-page'

const LAST_UPDATED_FR = '22 juillet 2026'
const LAST_UPDATED_EN = 'July 22, 2026'

export const metadata: Metadata = {
  title: 'Notice de Confidentialité — Win & Win',
  description:
    'Comment Win & Win protège la confidentialité des données de nos commerçants et de leurs joueurs. Mesures techniques, engagements contractuels, et gestion des sous-traitants.',
  alternates: { canonical: '/confidentiality' },
  robots: { index: true, follow: true },
}

const sections: LegalSection[] = [
  {
    id: 'purpose',
    fr: {
      heading: '1. Objet',
      body: [
        {
          type: 'p',
          text:
            'La présente Notice de Confidentialité (« Notice ») décrit les engagements de Win & Win concernant la confidentialité, l\'intégrité et la disponibilité des données que nos commerçants et leurs joueurs nous confient dans le cadre de l\'utilisation de la plateforme.',
        },
        {
          type: 'p',
          text:
            'Elle complète notre Politique de confidentialité (winandwin.club/privacy) et fait partie intégrante de nos Conditions Générales (winandwin.club/terms).',
        },
      ],
    },
    en: {
      heading: '1. Purpose',
      body: [
        {
          type: 'p',
          text:
            'This Confidentiality Notice ("Notice") describes Win & Win\'s commitments regarding the confidentiality, integrity, and availability of the data our merchants and their players entrust to us as part of using the platform.',
        },
        {
          type: 'p',
          text:
            'It complements our Privacy Policy (winandwin.club/privacy) and forms an integral part of our Terms & Conditions (winandwin.club/terms).',
        },
      ],
    },
  },
  {
    id: 'principles',
    fr: {
      heading: '2. Principes fondamentaux',
      body: [
        {
          type: 'ul',
          items: [
            'Vos données restent vos données. Nous n\'y accédons que pour opérer le service ou pour respecter une obligation légale.',
            'Nous ne vendons, ne louons ni n\'échangeons vos données ou celles de vos joueurs avec des tiers.',
            'Nous appliquons le principe du moindre privilège : chaque collaborateur ou système n\'a accès qu\'aux données strictement nécessaires à sa mission.',
            'Nous chiffrons vos données en transit (TLS 1.3) et au repos (AES-256 côté base de données).',
            'Nous conservons vos données uniquement le temps nécessaire aux finalités décrites dans notre Politique de confidentialité.',
          ],
        },
      ],
    },
    en: {
      heading: '2. Core principles',
      body: [
        {
          type: 'ul',
          items: [
            'Your data remains your data. We only access it to operate the service or to comply with a legal obligation.',
            'We do not sell, rent, or exchange your data or your players\' data with third parties.',
            'We apply the least-privilege principle: each employee or system only has access to the data strictly necessary for their role.',
            'We encrypt your data in transit (TLS 1.3) and at rest (AES-256 on the database side).',
            'We retain your data only for the time necessary for the purposes described in our Privacy Policy.',
          ],
        },
      ],
    },
  },
  {
    id: 'technical',
    fr: {
      heading: '3. Mesures techniques de sécurité',
      body: [
        {
          type: 'sub', text: 'Chiffrement',
        },
        {
          type: 'ul',
          items: [
            'Toutes les communications entre le navigateur et nos serveurs utilisent HTTPS avec TLS 1.3.',
            'La base de données est chiffrée au repos avec AES-256.',
            'Les mots de passe sont hashés avec Argon2 (algorithme récent, résistant aux attaques par matériel spécialisé).',
            'Les jetons d\'authentification OAuth sont chiffrés au repos.',
          ],
        },
        { type: 'sub', text: 'Contrôle d\'accès' },
        {
          type: 'ul',
          items: [
            'Authentification obligatoire pour tout accès à la plateforme (mot de passe fort et/ou SSO Google).',
            'Sessions à expiration automatique, avec possibilité de révocation immédiate.',
            'Accès administrateur limité à un cercle très restreint et journalisé.',
            'Rotation régulière des clés et secrets, et audit des accès sensibles.',
          ],
        },
        { type: 'sub', text: 'Sauvegardes et continuité' },
        {
          type: 'ul',
          items: [
            'Sauvegardes automatiques quotidiennes de la base de données.',
            'Réplications multi-zone chez notre hébergeur pour garantir la continuité de service.',
            'Procédure de restauration testée régulièrement.',
          ],
        },
      ],
    },
    en: {
      heading: '3. Technical security measures',
      body: [
        { type: 'sub', text: 'Encryption' },
        {
          type: 'ul',
          items: [
            'All communications between the browser and our servers use HTTPS with TLS 1.3.',
            'The database is encrypted at rest with AES-256.',
            'Passwords are hashed with Argon2 (a modern algorithm resistant to hardware-accelerated attacks).',
            'OAuth authentication tokens are encrypted at rest.',
          ],
        },
        { type: 'sub', text: 'Access control' },
        {
          type: 'ul',
          items: [
            'Mandatory authentication for any access to the platform (strong password and/or Google SSO).',
            'Sessions with automatic expiry and immediate revocation capability.',
            'Administrator access limited to a small, logged set of individuals.',
            'Regular rotation of keys and secrets, and audit of sensitive access.',
          ],
        },
        { type: 'sub', text: 'Backups and continuity' },
        {
          type: 'ul',
          items: [
            'Automatic daily backups of the database.',
            'Multi-zone replication at our hosting provider to ensure service continuity.',
            'Regularly tested restore procedure.',
          ],
        },
      ],
    },
  },
  {
    id: 'sub-processors',
    fr: {
      heading: '4. Sous-traitants et hébergement',
      body: [
        {
          type: 'p',
          text:
            'Pour opérer le service, nous nous appuyons sur un nombre limité de prestataires soigneusement sélectionnés. Chacun est engagé contractuellement à respecter la confidentialité et à mettre en œuvre des mesures de sécurité au moins équivalentes aux nôtres.',
        },
        {
          type: 'ul',
          items: [
            'Vercel (États-Unis) — hébergement du site vitrine et du tableau de bord. Transferts encadrés par les Clauses Contractuelles Types.',
            'Cloudflare Workers (Union Européenne) — hébergement de notre API et du jeu joueur. Certifié ISO 27001 / SOC 2.',
            'Neon (États-Unis) — base de données Postgres managée. Chiffrement au repos, sauvegardes automatiques, conformité GDPR.',
            'Prestataire d\'emails transactionnels (Postmark ou Resend) — envoi des notifications aux commerçants uniquement.',
            'Prestataire de paiement (Stripe ou équivalent) — traitement sécurisé des paiements. Nous ne stockons ni les numéros de carte ni les CVV.',
          ],
        },
        {
          type: 'p',
          text:
            'La liste des sous-traitants est susceptible d\'évoluer. Toute modification substantielle sera communiquée aux Commerçants par email au moins 30 jours avant son entrée en vigueur.',
        },
      ],
    },
    en: {
      heading: '4. Sub-processors and hosting',
      body: [
        {
          type: 'p',
          text:
            'To operate the service, we rely on a limited number of carefully selected providers. Each is contractually bound to respect confidentiality and implement security measures at least equivalent to ours.',
        },
        {
          type: 'ul',
          items: [
            'Vercel (United States) — hosting for the marketing site and dashboard. Transfers framed by Standard Contractual Clauses.',
            'Cloudflare Workers (European Union) — hosting for our API and the player game. ISO 27001 / SOC 2 certified.',
            'Neon (United States) — managed Postgres database. Encryption at rest, automatic backups, GDPR-compliant.',
            'Transactional email provider (Postmark or Resend) — merchant notifications only.',
            'Payment processor (Stripe or equivalent) — secure payment processing. We never store card numbers or CVV codes.',
          ],
        },
        {
          type: 'p',
          text:
            'The list of sub-processors may evolve. Any substantial change will be communicated to Merchants by email at least 30 days before it comes into effect.',
        },
      ],
    },
  },
  {
    id: 'players',
    fr: {
      heading: '5. Confidentialité des données des joueurs',
      body: [
        {
          type: 'p',
          text:
            'Les données que collectent nos commerçants via les jeux (email des joueurs, historique de participation, coupons) appartiennent au commerçant. Nous les traitons en qualité de sous-traitant, uniquement dans le but d\'opérer le service demandé par le commerçant.',
        },
        {
          type: 'p',
          text: 'Concrètement, cela signifie :',
        },
        {
          type: 'ul',
          items: [
            'Aucun croisement de données entre les commerçants. Chaque commerçant voit uniquement ses propres joueurs et ses propres coupons.',
            'Isolation logique de chaque compte commerçant au niveau applicatif et base de données.',
            'Nous n\'utilisons jamais les données des joueurs pour du marketing ou pour former des modèles d\'IA.',
            'À la clôture du compte commerçant, nous supprimons ou anonymisons les données des joueurs dans un délai maximum de 90 jours.',
          ],
        },
      ],
    },
    en: {
      heading: '5. Player data confidentiality',
      body: [
        {
          type: 'p',
          text:
            'Data collected by our merchants through the games (player email, participation history, coupons) belongs to the merchant. We process it as a processor, solely for the purpose of operating the service requested by the merchant.',
        },
        {
          type: 'p',
          text: 'Concretely, this means:',
        },
        {
          type: 'ul',
          items: [
            'No cross-matching of data between merchants. Each merchant only sees their own players and coupons.',
            'Logical isolation of each merchant account at the application and database level.',
            'We never use player data for marketing or to train AI models.',
            'On closure of the merchant account, player data is deleted or anonymised within a maximum of 90 days.',
          ],
        },
      ],
    },
  },
  {
    id: 'employees',
    fr: {
      heading: '6. Engagement des collaborateurs',
      body: [
        {
          type: 'p',
          text:
            'Chaque collaborateur de Win & Win ayant accès à des données personnelles est lié par une obligation contractuelle de confidentialité qui survit à la fin de son contrat. Nous formons régulièrement nos équipes aux bonnes pratiques de sécurité et de protection des données.',
        },
      ],
    },
    en: {
      heading: '6. Employee commitments',
      body: [
        {
          type: 'p',
          text:
            'Every Win & Win employee with access to personal data is bound by a contractual confidentiality obligation that survives the end of their employment. We regularly train our teams on security and data protection best practices.',
        },
      ],
    },
  },
  {
    id: 'incidents',
    fr: {
      heading: '7. Gestion des incidents de sécurité',
      body: [
        {
          type: 'p',
          text: 'En cas d\'incident de sécurité affectant vos données, nous nous engageons à :',
        },
        {
          type: 'ol',
          items: [
            'Contenir l\'incident dans les meilleurs délais.',
            'Analyser son étendue et ses conséquences.',
            'Vous notifier sous 72 heures maximum si l\'incident présente un risque pour vos données.',
            'Vous fournir toutes les informations nécessaires (nature de l\'incident, mesures prises, actions recommandées).',
            'Notifier l\'autorité compétente si nous y sommes tenus par la loi.',
          ],
        },
      ],
    },
    en: {
      heading: '7. Security incident handling',
      body: [
        {
          type: 'p',
          text: 'In the event of a security incident affecting your data, we commit to:',
        },
        {
          type: 'ol',
          items: [
            'Contain the incident as quickly as possible.',
            'Analyse its scope and consequences.',
            'Notify you within 72 hours at most if the incident poses a risk to your data.',
            'Provide you with all necessary information (nature of the incident, measures taken, recommended actions).',
            'Notify the competent authority if we are required to by law.',
          ],
        },
      ],
    },
  },
  {
    id: 'export',
    fr: {
      heading: '8. Portabilité et suppression',
      body: [
        {
          type: 'ul',
          items: [
            'Vous pouvez exporter vos données à tout moment depuis votre tableau de bord (joueurs, coupons, statistiques) au format CSV.',
            'Vous pouvez demander la suppression complète de votre compte et des données associées en écrivant à privacy@winandwin.club. La suppression est effective sous 30 jours, sauf obligation légale de conservation.',
            'Vous pouvez également obtenir une copie de vos données dans un format structuré et interopérable sur simple demande.',
          ],
        },
      ],
    },
    en: {
      heading: '8. Portability and deletion',
      body: [
        {
          type: 'ul',
          items: [
            'You can export your data at any time from your dashboard (players, coupons, statistics) in CSV format.',
            'You can request full deletion of your account and associated data by writing to privacy@winandwin.club. Deletion is effective within 30 days, unless a legal retention obligation applies.',
            'You can also obtain a copy of your data in a structured, interoperable format on request.',
          ],
        },
      ],
    },
  },
  {
    id: 'contact-conf',
    fr: {
      heading: '9. Contact',
      body: [
        {
          type: 'p',
          text:
            'Pour toute question relative à la confidentialité ou à la sécurité de vos données, contactez notre Délégué à la Protection des Données à privacy@winandwin.club.',
        },
        {
          type: 'callout',
          tone: 'info',
          text:
            'Vous souhaitez un accord spécifique de traitement des données (DPA / accord de sous-traitance formel) ? Écrivez-nous à legal@winandwin.club — nous mettrons à votre disposition un modèle prêt à signer.',
        },
      ],
    },
    en: {
      heading: '9. Contact',
      body: [
        {
          type: 'p',
          text:
            'For any question regarding the confidentiality or security of your data, contact our Data Protection Officer at privacy@winandwin.club.',
        },
        {
          type: 'callout',
          tone: 'info',
          text:
            'Do you need a specific Data Processing Agreement (DPA / formal processor agreement)? Write to legal@winandwin.club — we can provide a ready-to-sign template.',
        },
      ],
    },
  },
]

export default function ConfidentialityPage() {
  return (
    <LegalShell
      slug="confidentiality"
      fr={{
        title: 'Notice de Confidentialité',
        intro:
          'Nos engagements concrets sur la protection de vos données et de celles de vos joueurs — mesures techniques, sous-traitants, et gestion des incidents.',
        lastUpdated: LAST_UPDATED_FR,
      }}
      en={{
        title: 'Confidentiality Notice',
        intro:
          'Our concrete commitments on protecting your data and your players\' data — technical measures, sub-processors, and incident handling.',
        lastUpdated: LAST_UPDATED_EN,
      }}
      sections={sections}
    />
  )
}
