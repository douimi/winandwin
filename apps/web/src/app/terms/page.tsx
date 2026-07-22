import type { Metadata } from 'next'
import { LegalShell } from '../_legal/legal-shell'
import type { LegalSection } from '../_legal/legal-page'

const LAST_UPDATED_FR = '22 juillet 2026'
const LAST_UPDATED_EN = 'July 22, 2026'

export const metadata: Metadata = {
  title: 'Conditions Générales — Win & Win',
  description:
    'Conditions générales d\'utilisation et de vente de la plateforme Win & Win. Droits, obligations, paiements, et modalités du service.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
}

const sections: LegalSection[] = [
  {
    id: 'preamble',
    fr: {
      heading: '1. Préambule',
      body: [
        {
          type: 'p',
          text:
            'Les présentes Conditions Générales (les « Conditions ») régissent l\'accès et l\'utilisation de la plateforme Win & Win (le « Service »), éditée par la société Win & Win, ainsi que la souscription à ses offres d\'abonnement.',
        },
        {
          type: 'p',
          text:
            'En créant un compte ou en utilisant le Service, vous acceptez expressément et sans réserve l\'ensemble des présentes Conditions.',
        },
      ],
    },
    en: {
      heading: '1. Preamble',
      body: [
        {
          type: 'p',
          text:
            'These Terms and Conditions (the "Terms") govern access to and use of the Win & Win platform (the "Service"), operated by Win & Win, as well as subscription to its paid offerings.',
        },
        {
          type: 'p',
          text:
            'By creating an account or using the Service, you expressly and unconditionally accept all of these Terms.',
        },
      ],
    },
  },
  {
    id: 'definitions',
    fr: {
      heading: '2. Définitions',
      body: [
        {
          type: 'ul',
          items: [
            '« Plateforme » : le site winandwin.club et les services associés.',
            '« Commerçant » ou « Utilisateur » : toute personne physique ou morale ayant créé un compte sur la Plateforme pour exploiter un ou plusieurs jeux.',
            '« Joueur » : tout client final du Commerçant qui participe à un jeu hébergé par la Plateforme.',
            '« Contenu » : tout élément textuel, graphique, audiovisuel ou autre publié par le Commerçant sur la Plateforme.',
            '« Abonnement » : la formule payante choisie par le Commerçant (Free, Starter, Pro, Enterprise).',
          ],
        },
      ],
    },
    en: {
      heading: '2. Definitions',
      body: [
        {
          type: 'ul',
          items: [
            '"Platform": the winandwin.club website and associated services.',
            '"Merchant" or "User": any individual or entity who has created an account on the Platform to run one or more games.',
            '"Player": any end customer of the Merchant who participates in a game hosted by the Platform.',
            '"Content": any text, graphic, audiovisual, or other element published by the Merchant on the Platform.',
            '"Subscription": the paid plan chosen by the Merchant (Free, Starter, Pro, Enterprise).',
          ],
        },
      ],
    },
  },
  {
    id: 'account',
    fr: {
      heading: '3. Création et gestion du compte',
      body: [
        {
          type: 'p',
          text:
            'Pour utiliser le Service, vous devez créer un compte en fournissant des informations exactes, complètes et à jour. Vous êtes responsable de la confidentialité de vos identifiants et de toutes les actions effectuées sous votre compte.',
        },
        {
          type: 'p',
          text:
            'Certaines inscriptions peuvent être soumises à une validation préalable par notre équipe. Dans ce cas, vous serez informé du statut de votre compte par email.',
        },
        {
          type: 'callout',
          tone: 'warn',
          text:
            'En cas d\'utilisation non autorisée de votre compte ou de toute atteinte à sa sécurité, vous devez nous en informer immédiatement à support@winandwin.club.',
        },
      ],
    },
    en: {
      heading: '3. Account creation and management',
      body: [
        {
          type: 'p',
          text:
            'To use the Service, you must create an account by providing accurate, complete, and up-to-date information. You are responsible for the confidentiality of your credentials and all actions carried out under your account.',
        },
        {
          type: 'p',
          text:
            'Certain sign-ups may be subject to prior validation by our team. In that case, you will be informed of your account status by email.',
        },
        {
          type: 'callout',
          tone: 'warn',
          text:
            'In case of unauthorised use of your account or any breach of its security, you must inform us immediately at support@winandwin.club.',
        },
      ],
    },
  },
  {
    id: 'service',
    fr: {
      heading: '4. Description du Service',
      body: [
        {
          type: 'p',
          text:
            'Win & Win met à disposition des Commerçants une plateforme SaaS permettant de créer, gérer et diffuser des jeux QR-code (roue de la fortune, machine à sous, boîte mystère, grattage) destinés à leurs clients finaux.',
        },
        {
          type: 'p',
          text:
            'Le Service inclut, selon le plan souscrit : la configuration des jeux et prix, la gestion des coupons, l\'accès à un tableau de bord d\'analyse, et un support par email ou WhatsApp.',
        },
      ],
    },
    en: {
      heading: '4. Description of the Service',
      body: [
        {
          type: 'p',
          text:
            'Win & Win provides Merchants with a SaaS platform to create, manage, and distribute QR-code games (wheel of fortune, slot machine, mystery box, scratch card) intended for their end customers.',
        },
        {
          type: 'p',
          text:
            'The Service includes, depending on the plan chosen: game and prize configuration, coupon management, access to an analytics dashboard, and support via email or WhatsApp.',
        },
      ],
    },
  },
  {
    id: 'pricing',
    fr: {
      heading: '5. Tarifs, paiement et facturation',
      body: [
        {
          type: 'p',
          text:
            'Le Service est proposé sous forme d\'abonnement mensuel ou annuel. Les tarifs en vigueur sont indiqués sur la page « Tarifs » du site et peuvent être modifiés à tout moment pour les futures souscriptions, avec effet immédiat pour les nouveaux clients et sous préavis de 30 jours pour les abonnements en cours.',
        },
        {
          type: 'p',
          text:
            'Le paiement s\'effectue par carte bancaire ou virement, selon les modalités indiquées lors de la souscription. Une facture est émise à chaque échéance et disponible dans votre tableau de bord.',
        },
        {
          type: 'p',
          text:
            'En cas de non-paiement à l\'échéance, l\'accès au Service peut être suspendu après une mise en demeure de 7 jours restée sans effet.',
        },
      ],
    },
    en: {
      heading: '5. Pricing, payment, and billing',
      body: [
        {
          type: 'p',
          text:
            'The Service is offered as a monthly or annual subscription. Current pricing is shown on the "Pricing" page of the site and may be modified at any time for future subscriptions, with immediate effect for new customers and with 30 days notice for ongoing subscriptions.',
        },
        {
          type: 'p',
          text:
            'Payment is made by credit card or bank transfer, according to the terms indicated at the time of subscription. An invoice is issued at each due date and available in your dashboard.',
        },
        {
          type: 'p',
          text:
            'In case of non-payment on the due date, access to the Service may be suspended after a 7-day formal notice that has remained without effect.',
        },
      ],
    },
  },
  {
    id: 'obligations',
    fr: {
      heading: '6. Obligations du Commerçant',
      body: [
        {
          type: 'p',
          text: 'Le Commerçant s\'engage à :',
        },
        {
          type: 'ul',
          items: [
            'Fournir des informations exactes et à jour sur son commerce et ses représentants.',
            'Respecter la réglementation en vigueur, notamment les règles applicables aux jeux promotionnels dans son pays.',
            'Honorer les prix promis aux joueurs gagnants dans les conditions annoncées.',
            'Ne pas utiliser le Service à des fins frauduleuses, trompeuses ou contraires à la loi.',
            'Ne pas porter atteinte aux droits de tiers ni diffuser de contenu illicite, offensant ou discriminant.',
            'Protéger la confidentialité des données de ses propres clients.',
          ],
        },
      ],
    },
    en: {
      heading: '6. Merchant obligations',
      body: [
        {
          type: 'p',
          text: 'The Merchant undertakes to:',
        },
        {
          type: 'ul',
          items: [
            'Provide accurate, up-to-date information about their business and representatives.',
            'Comply with applicable regulations, in particular the rules governing promotional games in their country.',
            'Honour the prizes promised to winning players under the announced conditions.',
            'Not use the Service for fraudulent, misleading, or unlawful purposes.',
            'Not infringe third-party rights or publish unlawful, offensive, or discriminatory content.',
            'Protect the confidentiality of their own customers\' data.',
          ],
        },
      ],
    },
  },
  {
    id: 'ip',
    fr: {
      heading: '7. Propriété intellectuelle',
      body: [
        {
          type: 'p',
          text:
            'La Plateforme, son code source, ses interfaces, ses marques et ses éléments visuels sont la propriété exclusive de Win & Win et sont protégés par les lois relatives à la propriété intellectuelle. Toute reproduction ou représentation, même partielle, non expressément autorisée est interdite.',
        },
        {
          type: 'p',
          text:
            'Le Commerçant conserve l\'ensemble des droits sur le Contenu qu\'il publie sur la Plateforme et accorde à Win & Win une licence non exclusive et gratuite pour l\'héberger, l\'afficher et le transmettre aux joueurs dans le cadre du fonctionnement du Service.',
        },
      ],
    },
    en: {
      heading: '7. Intellectual property',
      body: [
        {
          type: 'p',
          text:
            'The Platform, its source code, interfaces, trademarks, and visual elements are the exclusive property of Win & Win and are protected by intellectual property laws. Any reproduction or representation, even partial, not expressly authorised, is prohibited.',
        },
        {
          type: 'p',
          text:
            'The Merchant retains all rights to the Content they publish on the Platform and grants Win & Win a non-exclusive, royalty-free licence to host, display, and transmit it to players as part of the Service.',
        },
      ],
    },
  },
  {
    id: 'liability',
    fr: {
      heading: '8. Responsabilité',
      body: [
        {
          type: 'p',
          text:
            'Win & Win s\'engage à fournir le Service avec diligence et selon les règles de l\'art, mais est tenu à une obligation de moyens, non de résultat. Nous ne saurions être tenus responsables des dommages indirects, tels que la perte de chiffre d\'affaires, de clientèle ou de données, résultant de l\'utilisation ou de l\'impossibilité d\'utiliser le Service.',
        },
        {
          type: 'p',
          text:
            'En tout état de cause, notre responsabilité totale au titre des présentes Conditions est plafonnée au montant des sommes payées par le Commerçant au cours des 12 derniers mois précédant le fait générateur.',
        },
      ],
    },
    en: {
      heading: '8. Liability',
      body: [
        {
          type: 'p',
          text:
            'Win & Win undertakes to provide the Service diligently and according to industry best practice, but is subject to an obligation of means, not of result. We cannot be held liable for indirect damages such as loss of revenue, customers, or data resulting from use or inability to use the Service.',
        },
        {
          type: 'p',
          text:
            'In any event, our total liability under these Terms is capped at the amounts paid by the Merchant during the 12 months preceding the triggering event.',
        },
      ],
    },
  },
  {
    id: 'termination',
    fr: {
      heading: '9. Résiliation',
      body: [
        {
          type: 'p',
          text:
            'Vous pouvez résilier votre Abonnement à tout moment depuis votre tableau de bord ou en nous contactant. La résiliation prend effet à la fin de la période de facturation en cours ; aucun remboursement au prorata n\'est dû.',
        },
        {
          type: 'p',
          text:
            'Win & Win peut résilier ou suspendre l\'accès à un compte en cas de manquement grave aux présentes Conditions, notamment fraude, non-paiement, ou publication de contenu illicite, sans préjudice de tout dommage-intérêt.',
        },
      ],
    },
    en: {
      heading: '9. Termination',
      body: [
        {
          type: 'p',
          text:
            'You may terminate your Subscription at any time from your dashboard or by contacting us. Termination takes effect at the end of the current billing period; no pro-rata refund is due.',
        },
        {
          type: 'p',
          text:
            'Win & Win may terminate or suspend access to an account in case of serious breach of these Terms, including fraud, non-payment, or publication of unlawful content, without prejudice to any damages.',
        },
      ],
    },
  },
  {
    id: 'privacy',
    fr: {
      heading: '10. Données personnelles',
      body: [
        {
          type: 'p',
          text:
            'Le traitement des données personnelles dans le cadre du Service est décrit dans notre Politique de confidentialité, accessible à l\'adresse winandwin.club/privacy. Notre engagement en matière de confidentialité et de sécurité des données des Commerçants et de leurs joueurs est détaillé dans notre Notice de Confidentialité, accessible à l\'adresse winandwin.club/confidentiality.',
        },
      ],
    },
    en: {
      heading: '10. Personal data',
      body: [
        {
          type: 'p',
          text:
            'The processing of personal data as part of the Service is described in our Privacy Policy, available at winandwin.club/privacy. Our commitment to the confidentiality and security of Merchants\' and Players\' data is detailed in our Confidentiality Notice, available at winandwin.club/confidentiality.',
        },
      ],
    },
  },
  {
    id: 'law',
    fr: {
      heading: '11. Droit applicable et juridiction',
      body: [
        {
          type: 'p',
          text:
            'Les présentes Conditions sont soumises au droit marocain. Tout litige relatif à leur interprétation ou à leur exécution sera de la compétence exclusive des tribunaux de Casablanca, sauf disposition légale contraire impérative.',
        },
      ],
    },
    en: {
      heading: '11. Governing law and jurisdiction',
      body: [
        {
          type: 'p',
          text:
            'These Terms are governed by Moroccan law. Any dispute relating to their interpretation or performance shall fall within the exclusive jurisdiction of the courts of Casablanca, unless otherwise required by mandatory law.',
        },
      ],
    },
  },
  {
    id: 'contact-terms',
    fr: {
      heading: '12. Contact',
      body: [
        {
          type: 'p',
          text:
            'Pour toute question relative aux présentes Conditions, écrivez-nous à legal@winandwin.club ou contactez-nous via WhatsApp depuis notre site.',
        },
      ],
    },
    en: {
      heading: '12. Contact',
      body: [
        {
          type: 'p',
          text:
            'For any question regarding these Terms, write to us at legal@winandwin.club or contact us via WhatsApp from our website.',
        },
      ],
    },
  },
]

export default function TermsPage() {
  return (
    <LegalShell
      slug="terms"
      fr={{
        title: 'Conditions Générales',
        intro:
          'Les règles qui encadrent l\'utilisation de la plateforme Win & Win — vos droits, nos engagements, et les modalités du service.',
        lastUpdated: LAST_UPDATED_FR,
      }}
      en={{
        title: 'Terms & Conditions',
        intro:
          'The rules that govern the use of the Win & Win platform — your rights, our commitments, and the terms of service.',
        lastUpdated: LAST_UPDATED_EN,
      }}
      sections={sections}
    />
  )
}
