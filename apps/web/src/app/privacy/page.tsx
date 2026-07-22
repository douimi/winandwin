import type { Metadata } from 'next'
import { LegalShell } from '../_legal/legal-shell'
import type { LegalSection } from '../_legal/legal-page'

const LAST_UPDATED_FR = '22 juillet 2026'
const LAST_UPDATED_EN = 'July 22, 2026'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Win & Win',
  description:
    'Comment Win & Win collecte, stocke et protège vos données personnelles. Vos droits en tant qu\'utilisateur, conformément au RGPD et à la loi 09-08.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
}

const sections: LegalSection[] = [
  {
    id: 'introduction',
    fr: {
      heading: '1. Introduction',
      body: [
        {
          type: 'p',
          text:
            'La présente politique de confidentialité décrit comment Win & Win (« nous », « notre plateforme ») collecte, utilise, partage et protège les données personnelles des visiteurs du site winandwin.club, des commerçants inscrits sur la plateforme, et des joueurs qui participent aux jeux hébergés par nos commerçants clients.',
        },
        {
          type: 'p',
          text:
            'Nous nous engageons à respecter la vie privée de nos utilisateurs conformément au Règlement Général sur la Protection des Données (RGPD, UE 2016/679) et à la loi marocaine n° 09-08 relative à la protection des personnes physiques à l\'égard du traitement des données à caractère personnel.',
        },
      ],
    },
    en: {
      heading: '1. Introduction',
      body: [
        {
          type: 'p',
          text:
            'This privacy policy describes how Win & Win ("we", "our platform") collects, uses, shares and protects personal data from visitors to winandwin.club, merchants who sign up for the platform, and players who participate in games hosted by our merchant customers.',
        },
        {
          type: 'p',
          text:
            'We are committed to respecting our users\' privacy in accordance with the General Data Protection Regulation (GDPR, EU 2016/679) and Moroccan Law 09-08 on the protection of individuals with regard to the processing of personal data.',
        },
      ],
    },
  },
  {
    id: 'controller',
    fr: {
      heading: '2. Responsable du traitement',
      body: [
        {
          type: 'p',
          text: 'Le responsable du traitement des données personnelles est :',
        },
        {
          type: 'ul',
          items: [
            'Win & Win — société éditrice de la plateforme winandwin.club',
            'Adresse : Casablanca, Maroc',
            'Contact : privacy@winandwin.club',
            'WhatsApp : disponible depuis le site winandwin.club',
          ],
        },
        {
          type: 'p',
          text:
            'Pour toute question relative à vos données personnelles, vous pouvez nous contacter via l\'un des canaux ci-dessus.',
        },
      ],
    },
    en: {
      heading: '2. Data controller',
      body: [
        {
          type: 'p',
          text: 'The data controller for personal data is:',
        },
        {
          type: 'ul',
          items: [
            'Win & Win — the company operating winandwin.club',
            'Address: Casablanca, Morocco',
            'Contact: privacy@winandwin.club',
            'WhatsApp: available from the winandwin.club site',
          ],
        },
        {
          type: 'p',
          text:
            'For any question related to your personal data, you can reach us through any of the above channels.',
        },
      ],
    },
  },
  {
    id: 'data-collected',
    fr: {
      heading: '3. Données que nous collectons',
      body: [
        { type: 'sub', text: 'Données des commerçants (nos clients)' },
        {
          type: 'ul',
          items: [
            'Nom et prénom du représentant du commerce',
            'Adresse email professionnelle',
            'Nom, catégorie et adresse du commerce',
            'Numéro de téléphone (facultatif)',
            'Informations de facturation liées à votre abonnement',
            'Logs techniques d\'utilisation de la plateforme (dates de connexion, adresse IP)',
          ],
        },
        { type: 'sub', text: 'Données des joueurs (clients des commerces)' },
        {
          type: 'ul',
          items: [
            'Nom (facultatif) et adresse email (facultatif) collectés via nos actions (Google Review, follow Instagram, etc.)',
            'Empreinte technique d\'appareil (device fingerprint) utilisée uniquement pour prévenir la fraude',
            'Historique de participation aux jeux (date, jeu, résultat, prix gagné)',
            'Coupons émis, validés ou expirés',
          ],
        },
        { type: 'sub', text: 'Données des visiteurs du site' },
        {
          type: 'ul',
          items: [
            'Adresse IP et informations techniques du navigateur (user-agent, langue)',
            'Pages visitées et parcours de navigation (analytics agrégés)',
            'Contenu des formulaires de contact soumis',
          ],
        },
      ],
    },
    en: {
      heading: '3. Data we collect',
      body: [
        { type: 'sub', text: 'Merchant data (our customers)' },
        {
          type: 'ul',
          items: [
            'First and last name of the business representative',
            'Business email address',
            'Business name, category, and address',
            'Phone number (optional)',
            'Billing information related to your subscription',
            'Platform usage logs (login timestamps, IP address)',
          ],
        },
        { type: 'sub', text: 'Player data (merchants\' customers)' },
        {
          type: 'ul',
          items: [
            'Name (optional) and email (optional) collected via our CTAs (Google Review, Instagram follow, etc.)',
            'Device fingerprint, used exclusively for fraud prevention',
            'Game participation history (date, game, result, prize won)',
            'Coupons issued, redeemed, or expired',
          ],
        },
        { type: 'sub', text: 'Website visitor data' },
        {
          type: 'ul',
          items: [
            'IP address and technical browser information (user-agent, language)',
            'Pages visited and navigation flow (aggregated analytics)',
            'Contents of contact forms submitted',
          ],
        },
      ],
    },
  },
  {
    id: 'purposes',
    fr: {
      heading: '4. Finalités et bases légales du traitement',
      body: [
        {
          type: 'p',
          text: 'Nous traitons vos données personnelles pour les finalités suivantes :',
        },
        {
          type: 'ol',
          items: [
            'Exécution du contrat : fournir la plateforme, gérer votre compte, exécuter les paiements de votre abonnement (base légale : contrat).',
            'Prévention de la fraude : détecter les comportements frauduleux (comptes multiples, triche) via l\'empreinte d\'appareil (base légale : intérêt légitime).',
            'Amélioration du service : analyses agrégées et anonymisées de l\'usage pour améliorer notre plateforme (base légale : intérêt légitime).',
            'Communication commerciale : vous envoyer des informations sur les nouveautés et offres — uniquement si vous y avez consenti et avec possibilité de désinscription à tout moment (base légale : consentement).',
            'Obligations légales : conservation de certaines données pour respecter nos obligations comptables et fiscales (base légale : obligation légale).',
          ],
        },
      ],
    },
    en: {
      heading: '4. Purposes and legal basis for processing',
      body: [
        {
          type: 'p',
          text: 'We process your personal data for the following purposes:',
        },
        {
          type: 'ol',
          items: [
            'Contract performance: providing the platform, managing your account, and processing subscription payments (legal basis: contract).',
            'Fraud prevention: detecting fraudulent behaviour (multiple accounts, cheating) via device fingerprinting (legal basis: legitimate interest).',
            'Service improvement: aggregated and anonymised usage analytics to improve our platform (legal basis: legitimate interest).',
            'Marketing communication: sending you information about updates and offers — only with your consent and with the ability to unsubscribe at any time (legal basis: consent).',
            'Legal obligations: retention of certain data to comply with our accounting and tax obligations (legal basis: legal obligation).',
          ],
        },
      ],
    },
  },
  {
    id: 'retention',
    fr: {
      heading: '5. Durées de conservation',
      body: [
        {
          type: 'ul',
          items: [
            'Compte commerçant : conservé pendant toute la durée d\'utilisation, puis 3 ans après la dernière connexion.',
            'Données de facturation : 10 ans, conformément au Code de commerce.',
            'Données de joueurs : 24 mois après la dernière participation à un jeu.',
            'Coupons validés ou expirés : 3 ans à des fins probatoires.',
            'Logs techniques : 12 mois maximum.',
            'Demandes de contact non converties : 12 mois.',
          ],
        },
      ],
    },
    en: {
      heading: '5. Retention periods',
      body: [
        {
          type: 'ul',
          items: [
            'Merchant account: retained during the entire usage period, then 3 years after last login.',
            'Billing data: 10 years, in accordance with the Commercial Code.',
            'Player data: 24 months after the last game participation.',
            'Redeemed or expired coupons: 3 years for evidentiary purposes.',
            'Technical logs: 12 months maximum.',
            'Unconverted contact requests: 12 months.',
          ],
        },
      ],
    },
  },
  {
    id: 'sharing',
    fr: {
      heading: '6. Partage des données',
      body: [
        {
          type: 'p',
          text:
            'Nous ne vendons ni ne louons vos données personnelles à des tiers. Nous partageons vos données uniquement avec les prestataires suivants, strictement pour opérer notre service :',
        },
        {
          type: 'ul',
          items: [
            'Hébergement du site : Vercel (États-Unis, avec transferts encadrés par les Clauses Contractuelles Types).',
            'Base de données : Neon (États-Unis, chiffrement au repos et en transit).',
            'Infrastructure API : Cloudflare Workers (Union Européenne).',
            'Envoi d\'emails transactionnels : Postmark ou Resend, selon la destination.',
            'Paiement de l\'abonnement : Stripe ou équivalent, pour le traitement sécurisé des paiements.',
          ],
        },
        {
          type: 'p',
          text:
            'Chacun de ces prestataires est soumis à des obligations contractuelles strictes de confidentialité et de sécurité.',
        },
      ],
    },
    en: {
      heading: '6. Data sharing',
      body: [
        {
          type: 'p',
          text:
            'We do not sell or rent your personal data to third parties. We share your data only with the following providers, strictly to operate our service:',
        },
        {
          type: 'ul',
          items: [
            'Website hosting: Vercel (United States, with transfers framed by Standard Contractual Clauses).',
            'Database: Neon (United States, encryption at rest and in transit).',
            'API infrastructure: Cloudflare Workers (European Union).',
            'Transactional email delivery: Postmark or Resend, depending on destination.',
            'Subscription payment: Stripe or equivalent, for secure payment processing.',
          ],
        },
        {
          type: 'p',
          text:
            'Each of these providers is bound by strict contractual obligations of confidentiality and security.',
        },
      ],
    },
  },
  {
    id: 'rights',
    fr: {
      heading: '7. Vos droits',
      body: [
        {
          type: 'p',
          text: 'Conformément à la réglementation applicable, vous disposez des droits suivants :',
        },
        {
          type: 'ul',
          items: [
            'Droit d\'accès : obtenir une copie des données personnelles que nous détenons sur vous.',
            'Droit de rectification : corriger toute donnée inexacte ou incomplète.',
            'Droit à l\'effacement : demander la suppression de vos données (sous réserve de nos obligations légales de conservation).',
            'Droit à la limitation du traitement : demander la suspension du traitement de vos données.',
            'Droit à la portabilité : recevoir vos données dans un format structuré et transférable.',
            'Droit d\'opposition : vous opposer à un traitement fondé sur notre intérêt légitime.',
            'Droit de retirer votre consentement à tout moment (sans effet rétroactif).',
            'Droit d\'introduire une réclamation auprès de l\'autorité de contrôle compétente (CNDP au Maroc, CNIL en France).',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text:
            'Pour exercer l\'un de ces droits, écrivez-nous à privacy@winandwin.club. Nous répondrons dans un délai maximum de 30 jours.',
        },
      ],
    },
    en: {
      heading: '7. Your rights',
      body: [
        {
          type: 'p',
          text: 'In accordance with applicable regulations, you have the following rights:',
        },
        {
          type: 'ul',
          items: [
            'Right of access: obtain a copy of the personal data we hold about you.',
            'Right to rectification: correct any inaccurate or incomplete data.',
            'Right to erasure: request deletion of your data (subject to our legal retention obligations).',
            'Right to restriction of processing: request suspension of the processing of your data.',
            'Right to portability: receive your data in a structured, transferable format.',
            'Right to object: object to processing based on our legitimate interest.',
            'Right to withdraw your consent at any time (without retroactive effect).',
            'Right to lodge a complaint with the competent supervisory authority (CNDP in Morocco, CNIL in France).',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          text:
            'To exercise any of these rights, write to us at privacy@winandwin.club. We will respond within 30 days at most.',
        },
      ],
    },
  },
  {
    id: 'cookies',
    fr: {
      heading: '8. Cookies et technologies similaires',
      body: [
        {
          type: 'p',
          text:
            'Notre site utilise des cookies strictement nécessaires au bon fonctionnement de la plateforme (session, préférence de langue), ainsi que des cookies d\'analyse d\'audience agrégée. Nous n\'utilisons pas de cookies publicitaires tiers.',
        },
        {
          type: 'p',
          text:
            'Vous pouvez à tout moment configurer votre navigateur pour bloquer les cookies. Notez que le blocage des cookies strictement nécessaires peut altérer le fonctionnement de votre compte.',
        },
      ],
    },
    en: {
      heading: '8. Cookies and similar technologies',
      body: [
        {
          type: 'p',
          text:
            'Our site uses cookies that are strictly necessary for the proper functioning of the platform (session, language preference), and aggregated audience analytics cookies. We do not use third-party advertising cookies.',
        },
        {
          type: 'p',
          text:
            'You can configure your browser at any time to block cookies. Note that blocking strictly necessary cookies may impair the operation of your account.',
        },
      ],
    },
  },
  {
    id: 'security',
    fr: {
      heading: '9. Sécurité',
      body: [
        {
          type: 'p',
          text:
            'Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données contre l\'accès non autorisé, la perte, la destruction, la divulgation ou l\'altération :',
        },
        {
          type: 'ul',
          items: [
            'Chiffrement TLS 1.3 pour toutes les communications',
            'Chiffrement au repos de la base de données',
            'Authentification par mot de passe fort et/ou SSO Google',
            'Rotation régulière des clés de chiffrement et des secrets',
            'Sauvegardes régulières et testées',
            'Contrôle d\'accès basé sur le principe du moindre privilège',
          ],
        },
      ],
    },
    en: {
      heading: '9. Security',
      body: [
        {
          type: 'p',
          text:
            'We implement appropriate technical and organisational measures to protect your data against unauthorised access, loss, destruction, disclosure, or alteration:',
        },
        {
          type: 'ul',
          items: [
            'TLS 1.3 encryption for all communications',
            'Encryption at rest of the database',
            'Authentication via strong password and/or Google SSO',
            'Regular rotation of encryption keys and secrets',
            'Regular, tested backups',
            'Access control based on least-privilege principle',
          ],
        },
      ],
    },
  },
  {
    id: 'changes',
    fr: {
      heading: '10. Modifications de cette politique',
      body: [
        {
          type: 'p',
          text:
            'Nous pouvons mettre à jour cette politique de confidentialité pour refléter des changements de nos pratiques ou pour d\'autres raisons opérationnelles, légales ou réglementaires. La date de dernière mise à jour est indiquée en haut de cette page. Les modifications substantielles vous seront notifiées par email ou par un avis affiché sur la plateforme.',
        },
      ],
    },
    en: {
      heading: '10. Changes to this policy',
      body: [
        {
          type: 'p',
          text:
            'We may update this privacy policy to reflect changes in our practices or for other operational, legal, or regulatory reasons. The date of last update is indicated at the top of this page. Substantial changes will be notified to you by email or through a notice displayed on the platform.',
        },
      ],
    },
  },
]

export default function PrivacyPage() {
  return (
    <LegalShell
      slug="privacy"
      fr={{
        title: 'Politique de confidentialité',
        intro:
          'Chez Win & Win, la protection de vos données personnelles est une priorité. Cette politique vous explique quelles données nous collectons, pourquoi, et quels sont vos droits.',
        lastUpdated: LAST_UPDATED_FR,
      }}
      en={{
        title: 'Privacy Policy',
        intro:
          'At Win & Win, protecting your personal data is a priority. This policy explains what data we collect, why, and what your rights are.',
        lastUpdated: LAST_UPDATED_EN,
      }}
      sections={sections}
    />
  )
}
