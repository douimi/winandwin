# PRODUCT REQUIREMENTS DOCUMENT

# [Product Name]

**Gamification Marketing & Customer Loyalty Platform**

---

**Version 1.0 | March 2026 | CONFIDENTIAL**

**Author:** Otmane Douimi — Technical Architect & Founder

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 24, 2026 | Otmane Douimi | Initial PRD creation |

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Functional Requirements](#2-functional-requirements)
3. [Technical Architecture](#3-technical-architecture)
4. [Business Model & Pricing](#4-business-model--pricing)
5. [Development Roadmap](#5-development-roadmap)
6. [User Flows & Player Journey](#6-user-flows--player-journey)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Legal & Compliance Considerations](#8-legal--compliance-considerations)
9. [Risks & Mitigations](#9-risks--mitigations)
10. [Glossary](#10-glossary)

---

## 1. Executive Summary

### 1.1 Product Vision

This document defines the complete product requirements for a next-generation gamification marketing and customer loyalty SaaS platform designed to compete directly with Kadow Club and surpass it through superior technology, unique differentiating features, and a modern scalable architecture.

The platform enables brick-and-mortar businesses (restaurants, retail stores, entertainment venues, salons, gyms, hotels) to deploy interactive marketing games that customers access by scanning QR codes. Before playing, customers complete high-value marketing actions (leaving Google reviews, following on Instagram, sharing stories, providing email addresses). Winners receive time-limited gift coupons designed to drive rapid return visits, creating a self-reinforcing engagement loop.

### 1.2 Mission Statement

To become the global standard for gamified customer engagement in physical retail by offering the most technologically advanced, data-driven, and merchant-friendly loyalty gamification platform on the market.

### 1.3 Core Differentiators vs. Kadow Club

| Differentiator | Description |
|----------------|-------------|
| **Advanced Device Fingerprinting** | Cross-browser, cross-session device recognition using hardware-level signals, canvas/WebGL/audio fingerprinting, and ML-based matching. Prevents fraud, detects multi-accounting, and enables recognition of returning users even after cookie clearing or browser switching. |
| **AI-Powered Game Optimization** | Machine learning engine that automatically adjusts win rates, prize selection, game type displayed, and call-to-action sequencing based on individual player behavior profiles and aggregate merchant performance data. |
| **Cross-Merchant Gift Marketplace** | A network effect where merchants in the same area can offer cross-promotional gifts: win at restaurant A, receive a coupon for salon B nearby. Creates a local commerce ecosystem and a defensible competitive moat. |
| **Universal Loyalty Score** | Leveraging the fingerprinting engine, an anonymized loyalty score follows consumers across all merchants on the platform. New merchants can instantly identify high-value returning customers from the network and offer VIP treatment. |
| **Competitive Leaderboards** | Player rankings per merchant with monthly exclusive rewards for top participants. Transforms passive customers into competitive brand ambassadors. |
| **Self-Service + Free Trial** | Unlike Kadow Club's demo-driven sales model, merchants can sign up, configure their first game, and go live within minutes. Free tier available for small businesses. |
| **Public API & Integrations** | Open REST/GraphQL API, Zapier/Make integration, POS system connectors (Square, Toast, Lightspeed), CRM integration (HubSpot, Salesforce). |
| **Advanced Analytics** | Cohort analysis, customer lifetime value tracking, conversion funnels, A/B test results, heatmaps, predictive churn scoring. |
| **White-Label Option** | Full branding removal for agencies and enterprise clients who want to offer the platform under their own brand. |
| **Mobile App for Merchants** | Native iOS/Android app (React Native) for real-time stats monitoring and game management on the go. |

### 1.4 Target Users

- **Primary:** Owners and managers of physical businesses (restaurants, cafes, bars, retail shops, salons, gyms, entertainment venues, hotels) seeking to increase customer engagement, online reviews, social media following, and repeat visits.
- **Secondary:** Marketing agencies managing multiple client locations who need a white-label gamification solution.
- **Tertiary:** Franchise and chain operators who need centralized multi-location management with per-location customization.

### 1.5 Success Metrics (KPIs)

| Metric | Target (Year 1) |
|--------|-----------------|
| Merchants onboarded | 500+ active merchants |
| Monthly Active Players (MAPs) | 100,000+ |
| Avg. Google reviews generated per merchant | +200/month |
| Customer return rate increase | +25% vs. baseline |
| Platform uptime | 99.95% |
| Player-facing latency (p95) | <100ms globally |
| Merchant churn rate | <5% monthly |
| Net Promoter Score (NPS) | >50 |

---

## 2. Functional Requirements

### 2.1 Game Engine

#### 2.1.1 Supported Game Types

| Game | Mechanic | Best For |
|------|----------|----------|
| **Wheel of Fortune** | Spin a wheel with configurable segments, each mapped to a prize or "try again." | High engagement, visual appeal. Best for restaurants and retail. |
| **Slot Machine (Jackpot)** | 3-reel slot machine. Matching symbols = win. Configurable symbol sets. | Casino-style excitement. Appeals to younger demographics. |
| **Mystery Boxes** | 3–6 boxes displayed. Player picks one to reveal prize or "try again." | Simple, universal appeal. Low barrier to engagement. |
| **Scratch Card** | Virtual scratch-off card revealing prize underneath. | Familiar mechanic from physical scratch cards. Nostalgic appeal. |
| **Advent Calendar** | Numbered doors (1–25 or custom). One door openable per day. | Christmas/holiday season. Daily engagement over extended period. |
| **Quiz / Trivia** | Answer questions correctly to unlock prize draw entry. | Educational brands, event venues. Collects preference data. |
| **Sports Predictor** | Predict match outcomes. Correct predictions earn prize entries. | Sports bars, during major events (World Cup, Champions League). |
| **Memory Match** | Card-matching game. Complete within time limit to win. | Family-friendly venues. Longer engagement time. |
| **Claw Machine** | Virtual claw grab mechanic. Animated prize grabbing. | High entertainment value. Social media shareability. |

#### 2.1.2 Game Configuration

For each game, merchants can configure:

- **Prize Pool:** Unlimited prizes with name, emoji/icon, description, win percentage (0.1–100%), maximum total quantity, maximum per day/week, and validity period for the coupon.
- **Win Rate Control:** Global win rate (percentage of plays that result in any win), individual prize win rates, and "no win" messaging customization.
- **Scheduling:** Start date, end date, active days of week, active hours (e.g., only during lunch service 11:00–14:00).
- **Frequency Limits:** Maximum plays per user per day/week/month. Configurable cooldown period between plays.
- **Visual Customization:** Upload brand colors, logo, background image. Select from pre-designed seasonal themes or create custom themes.
- **A/B Testing:** Create variant configurations (different prizes, win rates, game types) and split traffic automatically. Statistical significance calculation with automatic winner declaration.

#### 2.1.3 AI-Powered Optimization Engine

The AI optimization engine continuously improves game performance without merchant intervention:

- **Dynamic Win Rate Adjustment:** ML model analyzes player behavior (play frequency, return rate, coupon redemption) and adjusts win rates per player segment to maximize ROI. New players get slightly higher win rates to hook them; returning players get optimized rates.
- **Smart Game Selection:** When multiple games are active, the system selects which game to show each player based on their profile and historical engagement data across the network.
- **Prize Optimization:** Recommends prize changes based on redemption rates, player feedback signals, and seasonal patterns. Example: "Your dessert prize has 3x higher redemption than your drink prize — consider increasing dessert allocation."
- **Churn Prediction:** Identifies players at risk of disengagement and triggers re-engagement campaigns (push notifications, special bonus plays) automatically.
- **Timing Optimization:** Learns optimal times to send follow-up emails, push notifications, and re-engagement messages per player segment.

---

### 2.2 Calls-to-Action (CTA) System

Before accessing a game, players must complete one or more configurable marketing actions. These are the core value drivers for merchants.

#### 2.2.1 Ambassador Actions (Acquisition & Visibility)

| Action | Implementation Details |
|--------|----------------------|
| **Leave a Google Review** | Deep-link to merchant's Google Business Profile review form. Verification via Google Places API — checks that a new review appeared within 30 minutes of action completion. Star rating optionally tracked. |
| **Leave a TripAdvisor Review** | Deep-link to TripAdvisor listing. Verification via scraping/webhook or honor-based with screenshot upload. |
| **Follow on Instagram** | Deep-link to Instagram profile. Verification via Instagram Basic Display API (follower check) or screenshot upload with AI verification. |
| **Post Instagram Story** | Player creates and posts a story tagging/mentioning the merchant. Verification via Instagram API mention detection or screenshot upload with AI-based brand mention verification. |
| **Follow on TikTok** | Deep-link to TikTok profile. Screenshot verification with AI analysis. |
| **Subscribe on YouTube** | Deep-link to YouTube channel. Subscriber count monitoring. |
| **Invite a Friend** | Generates unique referral link/QR code. Tracked via fingerprinting — confirms friend is a genuinely new device, not the same person on a different browser. |
| **Share on WhatsApp** | Pre-composed WhatsApp message with share link. Click tracking via unique URL parameters. |
| **Like Facebook Page** | Deep-link to Facebook page. Facebook Graph API verification of page like. |

#### 2.2.2 Loyalty Actions (Retention & Data Collection)

| Action | Implementation Details |
|--------|----------------------|
| **Stamp a Visit** | Digital loyalty card — scan QR at each visit to accumulate stamps. After N stamps, unlock bonus game or guaranteed prize. Integrates with fingerprinting to prevent stamp fraud. |
| **Photograph Receipt** | Player photographs their receipt/bill. OCR extracts total amount. Tracks average spend per visit. Optionally gate game access on minimum spend. |
| **Provide Email Address** | Email collection with double opt-in. GDPR-compliant consent tracking. Auto-tags for email marketing segmentation. |
| **Provide Phone Number** | SMS opt-in for marketing. Verification via OTP. GDPR/TCPA compliant. |
| **Complete a Survey** | Configurable 1–5 question micro-survey. Question types: multiple choice, rating (1–5 stars), NPS (0–10), free text. Results aggregated in analytics. |
| **Join WhatsApp Group** | One-click join link to merchant's WhatsApp community/group. |
| **Join Telegram Channel** | Deep-link to Telegram channel with membership verification. |
| **Download Mobile App** | Deep-link to merchant's own app on App Store/Play Store. Verification via referral tracking. |

#### 2.2.3 CTA Configuration Rules

- **Minimum Actions:** Merchant sets minimum number of actions required before game unlock (default: 1). Can require up to all available actions.
- **Action Weighting:** Some actions can be worth more "points" than others (e.g., Google review = 3 points, email = 1 point, minimum 3 points to play).
- **Smart CTA Rotation:** AI engine rotates which actions are displayed first based on which ones the player hasn't completed yet and which are most valuable to the merchant.
- **Fraud Prevention:** Device fingerprinting ensures the same person cannot complete the same action multiple times from different browsers/incognito modes. Cross-references action completion with actual platform data (did a Google review actually appear?).

---

### 2.3 Coupon & Reward System

#### 2.3.1 Coupon Configuration

- **Validity Period:** Configurable from 1 day to 1 year. Default recommendation: 7 days (drives urgency for return visit).
- **Activation Delay:** Coupon becomes valid after a configurable delay (default: next day). Prevents immediate same-visit redemption.
- **Minimum Purchase:** Optional minimum spend required to redeem coupon (e.g., "10% off on orders over 30€").
- **Redemption Method:** Staff scans coupon QR code on player's phone via merchant app, or manual code entry on POS. Digital validation prevents screenshot sharing/reuse.
- **Single Use:** Each coupon has a unique ID and can only be redeemed once. Real-time validation against backend.
- **Transferability:** Configurable — coupons can be locked to the winning device (via fingerprint) or shareable.

#### 2.3.2 Cross-Merchant Gift Marketplace

This is a unique differentiating feature not found in any competitor:

- **Network Enrollment:** Merchants opt into the cross-promotion network. They define gifts they're willing to offer to customers from partner merchants.
- **Geographic Clustering:** The system automatically groups merchants by proximity (same street, same neighborhood, same mall) to create local commerce ecosystems.
- **Cross-Prize Pool:** When a player wins at Merchant A, they may receive a coupon redeemable at nearby Merchant B. Example: win a free coffee at the cafe next to the restaurant where you played.
- **Revenue Model:** Merchant B pays a small fee when a cross-referral coupon is redeemed (cost-per-acquisition model). Merchant A gets credit toward their subscription.
- **Mutual Benefit Analytics:** Dashboard shows each merchant how many customers they sent vs. received from the network, with financial impact tracking.

---

### 2.4 Device Fingerprinting & Anti-Fraud System

This is the core technical differentiator. The fingerprinting system serves three critical functions: fraud prevention, user recognition, and the Universal Loyalty Score.

#### 2.4.1 Signal Collection Layer

The fingerprinting SDK (deployed on edge workers) collects 40+ signals from the player's device:

**Browser-Level Signals:** User agent string, language settings, timezone, screen resolution, color depth, device pixel ratio, available fonts (font enumeration), installed plugins, Do Not Track setting, cookie support, local/session storage availability, WebRTC local IP detection, connection type (4G/WiFi/broadband).

**Hardware-Level Signals:** Canvas fingerprint (rendering unique to GPU/driver combination), WebGL renderer string, WebGL vendor string, WebGL unmasked renderer, audio context fingerprint (AudioContext oscillator output), available CPU cores (navigator.hardwareConcurrency), device memory (navigator.deviceMemory), GPU hash, touchscreen capability and max touch points.

**Behavioral Signals:** Mouse movement patterns, scroll behavior, typing cadence, touch pressure patterns (mobile), gyroscope/accelerometer signatures (mobile), time-to-interact patterns.

**Network Signals:** TLS fingerprint (JA3/JA4 hash), HTTP/2 settings fingerprint, IP geolocation, ASN (Autonomous System Number), VPN/proxy detection, Tor exit node detection.

#### 2.4.2 Fingerprint Matching Engine

- **Fuzzy Matching:** Signals are combined into a composite fingerprint vector. ML model (TensorFlow.js or ONNX) performs similarity matching with configurable threshold. Handles natural signal drift (browser updates, OS updates) without breaking recognition.
- **Cross-Browser Recognition:** Hardware-level signals (canvas, WebGL, audio, GPU) remain consistent across browsers on the same device. The ML model is trained to identify same-device fingerprints even when browser-level signals differ completely.
- **Confidence Scoring:** Each match returns a confidence score (0–100%). Configurable thresholds: High confidence (>85%) = automatic recognition, Medium (60–85%) = recognized with caution, Low (<60%) = treated as new device.
- **Vector Database:** Fingerprint vectors stored in Qdrant (vector similarity search engine). Enables sub-10ms lookup against millions of stored fingerprints.
- **Privacy Compliance:** Fingerprints are hashed and anonymized. No PII is stored in the fingerprint database. Full GDPR Article 6(1)(f) legitimate interest basis documented. Opt-out mechanism available.

#### 2.4.3 Anti-Fraud Applications

| Fraud Type | Detection & Prevention |
|------------|----------------------|
| **Multi-Account Abuse** | Same device attempting to play as multiple "new" users. Fingerprint match triggers block or cooldown. Alert sent to merchant. |
| **Referral Fraud** | Self-referral detection: "inviter" and "invitee" on same device or same network. Fingerprint + IP correlation analysis. |
| **Review Fraud** | Detects if multiple Google reviews originate from the same physical location/device within a short window. Protects merchant from Google penalties. |
| **Bot/Automation** | Headless browser detection (missing WebGL, suspicious canvas output), automation tool signatures (Selenium, Puppeteer, Playwright), behavioral analysis (inhuman click/scroll patterns). |
| **VPN/Proxy Abuse** | Detects VPN/proxy usage via IP intelligence databases, WebRTC leak analysis, and TLS fingerprint anomalies. Configurable: block, flag, or allow with reduced trust score. |
| **Coupon Screenshot Sharing** | Coupons bound to device fingerprint. Redemption requires matching fingerprint on the device presenting the coupon. |

#### 2.4.4 Universal Loyalty Score

The most powerful application of the fingerprinting system:

- **Score Calculation:** Each recognized device accumulates a loyalty score based on: number of merchants visited, frequency of visits, actions completed, coupons redeemed, referrals generated, time on platform.
- **Score Tiers:** Bronze (new), Silver (regular), Gold (loyal), Platinum (super-ambassador). Thresholds configurable per merchant or network-wide.
- **Merchant Benefits:** When a new customer walks into Merchant B for the first time, the merchant can see this person is a Platinum-tier player on the network. They can offer an instant VIP welcome gift or upgraded experience.
- **Player Benefits:** Higher loyalty scores unlock better prizes, exclusive games, or priority access to limited-edition offers across all network merchants.
- **Privacy:** Merchants see the tier and anonymized stats only — never the player's identity, name, or data from other merchants. The player controls visibility.

---

### 2.5 Competitive Leaderboard System

#### 2.5.1 Player Leaderboards

- **Per-Merchant Rankings:** Monthly leaderboard showing top players by points earned (plays, actions completed, referrals). Resets monthly to keep competition fresh.
- **Point System:** Configurable points: play a game (+1), complete an action (+2–10 depending on type), redeem a coupon (+5), successful referral (+15).
- **Monthly Prizes:** Top 3/5/10 players each month win exclusive rewards (higher-value prizes, VIP experiences, partner gifts from the cross-merchant network).
- **Social Sharing:** Players can share their ranking on social media with branded graphics. Viral acquisition channel.

#### 2.5.2 Merchant Leaderboards (Internal)

- **Network Rankings:** Anonymous benchmarking: "Your establishment is in the top 15% for review generation in your city."
- **Best Practices:** Top-performing merchants' configurations (anonymized) suggested to lower-performing ones by the AI engine.

---

### 2.6 Merchant Back-Office Dashboard

#### 2.6.1 Dashboard Home

- Quick stats: active players today, games played today, actions completed today, coupons redeemed today
- Live activity feed: real-time stream of player interactions
- Game preview: interactive preview of current game as players see it
- Health score: AI-generated score (0–100) rating overall campaign effectiveness with improvement suggestions
- Quick actions: edit prizes, pause/resume games, download QR materials

#### 2.6.2 Configuration Modules

- **Branding:** Logo upload, primary/secondary colors, custom CSS (enterprise), background images, QR code style customization.
- **Games:** Full game configuration as described in Section 2.1.2. Visual drag-and-drop game builder for creating custom game themes.
- **Prizes:** Prize management with AI-powered suggestions. Bulk import/export. Inventory tracking with low-stock alerts.
- **Calls-to-Action:** Enable/disable individual CTAs. Configure action-specific parameters (Google Business Profile URL, Instagram handle, survey questions). Set requirements and weighting.
- **Automated Emails:** Visual email flow builder (triggered sequences). Templates: welcome, post-play, coupon reminder, re-engagement, birthday. MJML-based responsive email rendering.
- **Communication Materials:** Auto-generated QR code posters, table tents, flyers, stickers. Available in multiple sizes (A4, A5, tent card, sticker). Customizable with merchant branding. Direct print-ready PDF download.

#### 2.6.3 Analytics & Reporting

Comprehensive analytics with three depth levels:

**Overview Dashboard:** At-a-glance KPIs with trend arrows (vs. last week/month). Players, revenue boost, actions, redemptions, referrals.

**Detailed Analytics:** Cohort analysis (retention curves per acquisition week), customer lifetime value tracking, conversion funnels (visit → scan → action → play → win → redeem), A/B test results with statistical significance, channel attribution (which CTA drives most repeat visits).

**Export & API:** CSV/Excel export for all data views. Automated weekly/monthly email reports (PDF). API access for custom dashboards and BI tool integration (Looker, Tableau, Power BI).

---

### 2.7 Merchant Mobile App (iOS & Android)

Native mobile application built with React Native (Expo) providing merchants with on-the-go management:

- **Real-Time Notifications:** Push alerts for milestones (100th player today, prize inventory low, new 5-star review generated).
- **Stats Dashboard:** Simplified mobile-first analytics view with key metrics and trend charts.
- **Coupon Validation:** Built-in QR scanner for staff to validate customer coupons at the counter.
- **Quick Configuration:** Pause/resume games, adjust prize quantities, toggle CTAs — all from the phone.
- **Multi-Location Switcher:** For merchants with multiple establishments, switch between locations instantly.
- **Team Management:** Invite staff members with role-based permissions (viewer, editor, admin).

---

### 2.8 Public API & Integrations

#### 2.8.1 REST & GraphQL API

- **Authentication:** OAuth 2.0 with API keys for server-to-server. JWT tokens for session-based access.
- **Rate Limiting:** Tiered rate limits based on subscription plan. Burst allowance for legitimate traffic spikes.
- **Endpoints:** Full CRUD for games, prizes, CTAs, coupons, analytics. Webhook subscriptions for real-time event streaming (new player, action completed, coupon redeemed).
- **Documentation:** OpenAPI 3.1 specification. Interactive API explorer (Swagger UI). SDKs for JavaScript, Python, PHP, Ruby.

#### 2.8.2 Third-Party Integrations

| Integration | Details |
|-------------|---------|
| **Zapier / Make** | Pre-built triggers (new player, action completed, coupon redeemed) and actions (create game, update prizes). Enables connection to 5,000+ apps. |
| **POS Systems** | Native connectors for Square, Toast, Lightspeed, SumUp. Auto-validates coupon redemption at checkout. Tracks spend per player. |
| **CRM** | HubSpot, Salesforce, Zoho CRM sync. Player data automatically pushed as contacts/leads with engagement history. |
| **Email Marketing** | Mailchimp, Brevo (Sendinblue), Klaviyo. Segments sync automatically. Triggers available for external campaign automation. |
| **Google Business Profile** | Direct API integration for review monitoring, response management, and review generation tracking. |
| **WhatsApp Business API** | Automated messages via WhatsApp Business API. Coupon delivery, re-engagement messages, welcome sequences. |
| **Booking Systems** | TheFork (LaFourchette), OpenTable, Booksy. Game integration with reservation confirmation flow. |

---

### 2.9 White-Label Solution

For agencies, franchises, and enterprise clients:

- **Complete Branding Removal:** All platform branding removed from player-facing interfaces, emails, and merchant dashboard.
- **Custom Domain:** Player games served from client's own domain (e.g., play.clientbrand.com). Merchant dashboard on client's subdomain.
- **Custom Themes:** Full CSS/design customization of the merchant dashboard. Custom email templates.
- **API-First:** White-label clients can build entirely custom front-ends using the API while leveraging the backend game engine, fingerprinting, and analytics.
- **Reseller Billing:** Built-in reseller billing system. Agency sets their own pricing for their clients. Revenue sharing model available.

---

## 3. Technical Architecture

### 3.1 Architecture Overview

The platform follows a modern edge-first, event-driven microservices architecture designed for global scale, sub-100ms latency, and millions of concurrent players.

#### 3.1.1 Architecture Principles

1. **Edge-First:** Player-facing experiences run on Cloudflare Workers (300+ global PoPs). No cold starts, sub-50ms response times worldwide.
2. **Event-Driven:** All state changes emit events via NATS JetStream. Services are loosely coupled. Enables real-time analytics, notifications, and audit logging.
3. **TypeScript Everywhere:** Monorepo with shared types, validators, and business logic between frontend, backend, and edge workers. Maximum code reuse and developer productivity for a solo architect.
4. **Infrastructure as Code:** 100% Terraform-managed infrastructure. Reproducible, version-controlled, auditable.
5. **Zero Trust Security:** All services communicate via mTLS. No implicit trust between services. API gateway enforces authentication at the edge.

---

### 3.2 Technology Stack

#### 3.2.1 Monorepo Structure

| Package | Technology & Purpose |
|---------|---------------------|
| **apps/web** | Next.js 15 (App Router, React Server Components) — Merchant back-office dashboard. Server-side rendering for SEO on marketing pages. Client-side interactivity for dashboard. |
| **apps/mobile** | React Native + Expo — Merchant mobile app for iOS and Android. Shared component library with web where possible. |
| **apps/player** | Preact + Vite — Ultra-lightweight player-facing game UI. Bundle size target: <50KB gzipped. Deployed to Cloudflare Pages. |
| **services/api** | Hono framework on Cloudflare Workers — Main REST/GraphQL API gateway. Handles authentication, rate limiting, routing to backend services. |
| **services/game-engine** | Hono on Cloudflare Workers + Durable Objects — Game state management, win/loss calculation, prize allocation. Durable Objects ensure exactly-once prize distribution. |
| **services/fingerprint** | Hono on Cloudflare Workers — Signal collection, fingerprint generation, matching queries. Edge-deployed for minimal latency. Communicates with Qdrant vector DB. |
| **services/analytics** | Fastify on Fly.io — Event ingestion pipeline, ClickHouse query service, report generation. Handles heavy aggregation workloads. |
| **services/notifications** | Fastify on Fly.io — Email (Resend API), SMS (Twilio), push notifications (Firebase Cloud Messaging), WhatsApp Business API. |
| **services/ml** | Python (FastAPI) on Fly.io GPU instances — Fingerprint ML model training, A/B test analysis, churn prediction, game optimization. ONNX model export for edge inference. |
| **packages/shared** | Shared TypeScript types, Zod validators, utility functions, API client, constants. Used by all apps and services. |
| **packages/db** | Drizzle ORM schemas, migrations, and query builders for PostgreSQL. Single source of truth for database schema. |
| **packages/ui** | Shared React component library (shadcn/ui based) used by web dashboard and mobile app. |
| **infra/** | Terraform modules for all cloud infrastructure. GitHub Actions CI/CD pipelines. |

#### 3.2.2 Database Architecture

| Database | Technology | Purpose & Data |
|----------|-----------|----------------|
| **Primary OLTP** | PostgreSQL (Neon) | Merchants, users, games, prizes, coupons, CTAs, configurations, subscriptions, billing. Neon provides serverless auto-scaling, branching for development, and point-in-time recovery. |
| **Analytics OLAP** | ClickHouse (ClickHouse Cloud) | All player events (plays, wins, actions, redemptions, page views). Columnar storage handles billions of events with sub-second query times. Materialized views for real-time dashboards. |
| **Cache & Sessions** | Redis (Upstash) | Session management, rate limiting counters, leaderboard sorted sets (ZRANGEBYSCORE), game state caching, API response caching. Serverless Redis with per-request pricing. |
| **Vector Store** | Qdrant (Qdrant Cloud) | Device fingerprint vectors for similarity search. HNSW index for sub-10ms nearest-neighbor queries against millions of fingerprints. |
| **Object Storage** | Cloudflare R2 | Merchant logos, game assets, generated QR codes, communication material PDFs, email attachments. Zero egress fees. |
| **Edge KV** | Cloudflare KV | Game configuration cache at edge (read-heavy, write-infrequent). Merchant branding/theme cache. Feature flags. |

#### 3.2.3 Infrastructure & DevOps

| Component | Technology |
|-----------|-----------|
| **Edge Compute** | Cloudflare Workers (game engine, API gateway, fingerprinting) — 300+ PoPs, 0ms cold starts, 128MB memory, 30s CPU time. |
| **Backend Compute** | Fly.io (analytics, notifications, ML services) — auto-scaling, global deployment, built-in Wireguard networking. |
| **CI/CD** | GitHub Actions — automated testing (Vitest), linting (Biome), type-checking (TypeScript), deployment (Wrangler for CF, flyctl for Fly.io). |
| **Monitoring** | Grafana Cloud (metrics, logs, traces) — OpenTelemetry instrumentation across all services. Alerting via PagerDuty. |
| **Error Tracking** | Sentry — real-time error tracking, performance monitoring, session replay for debugging player issues. |
| **Infrastructure as Code** | Terraform — all cloud resources version-controlled. Terraform Cloud for state management and plan reviews. |
| **Secret Management** | Doppler — centralized secrets management with environment-specific configs and automatic syncing. |
| **DNS & CDN** | Cloudflare — DNS management, DDoS protection, WAF (Web Application Firewall), Bot Management, SSL/TLS. |

#### 3.2.4 Scalability Targets

| Metric | Target Capacity |
|--------|----------------|
| Concurrent players | 1,000,000+ simultaneous game sessions |
| API requests/second | 100,000+ sustained, 500,000+ burst |
| Fingerprint lookups/second | 50,000+ with <10ms p99 latency |
| Event ingestion | 1,000,000+ events/minute into ClickHouse |
| Database connections | Auto-scaling via Neon serverless (no connection pooling limits) |
| Global latency (player-facing) | <50ms p50, <100ms p95, <200ms p99 |
| Availability | 99.95% SLA (26 minutes downtime/year maximum) |

---

### 3.3 Security Architecture

#### 3.3.1 Authentication & Authorization

- **Merchant Authentication:** Email/password with bcrypt hashing, magic link (passwordless), Google/Apple OAuth SSO. MFA via TOTP (authenticator app) mandatory for admin accounts.
- **API Authentication:** OAuth 2.0 authorization code flow for third-party integrations. API keys (hashed, rotatable) for server-to-server. Short-lived JWT access tokens (15 min) + refresh tokens (7 days).
- **Role-Based Access Control (RBAC):** Roles: Owner, Admin, Manager, Staff, Viewer. Granular permissions per module (games, analytics, billing, team). Multi-location RBAC: different roles per establishment.
- **Player Authentication:** Players do not create accounts. Identity is managed via device fingerprinting + optional email/phone. Reduces friction to zero.

#### 3.3.2 Data Protection

- **Encryption at Rest:** AES-256 encryption for all databases. Neon provides transparent encryption. R2 objects encrypted by default.
- **Encryption in Transit:** TLS 1.3 enforced on all connections. mTLS between internal services. HSTS headers on all domains.
- **PII Handling:** Personally Identifiable Information (emails, phone numbers) encrypted at application level with per-merchant encryption keys. Key rotation every 90 days.
- **Data Isolation:** Multi-tenant architecture with row-level security in PostgreSQL. Each merchant's data is logically isolated. No cross-tenant data leakage possible at the database level.

#### 3.3.3 Compliance

- **GDPR:** Full compliance with EU General Data Protection Regulation. Right to access, right to deletion, right to portability, consent management, DPO contact, privacy impact assessments.
- **Cookie Consent:** The platform uses fingerprinting (not cookies) for player recognition, but still displays a consent banner explaining data processing under legitimate interest (Article 6(1)(f)) with easy opt-out.
- **Data Residency:** EU data stored in EU regions only. Configurable per merchant for other jurisdictions (US, APAC).
- **SOC 2 Type II:** Target certification within 18 months of launch. Annual penetration testing by third-party firm.

---

## 4. Business Model & Pricing

### 4.1 Pricing Strategy

Freemium model with self-service onboarding to maximize adoption velocity, contrasting with Kadow Club's demo-only approach.

#### 4.1.1 Pricing Tiers

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| **Price/month** | 0€ | 49€ | 149€ | Custom |
| **Monthly plays** | 200 | 2,000 | 20,000 | Unlimited |
| **Game types** | 2 (Wheel + Mystery) | 5 | All | All + Custom |
| **Active prizes** | 3 | 10 | Unlimited | Unlimited |
| **CTAs** | 3 | All | All | All + Custom |
| **Analytics** | Basic overview | Detailed | Advanced + cohorts | Full + API export |
| **A/B Testing** | No | 1 active test | Unlimited | Unlimited |
| **AI Optimization** | No | Basic | Full | Full + custom models |
| **Fingerprinting** | Basic | Standard | Advanced | Advanced + API access |
| **Cross-Merchant Network** | No | Join only | Full participation | Private networks |
| **Leaderboards** | No | Basic | Full | Custom + global |
| **White Label** | No | No | Add-on (99€/mo) | Included |
| **API Access** | No | Read-only | Full | Full + webhooks |
| **Integrations** | None | Zapier basic | All integrations | All + custom |
| **Mobile App** | View only | Full | Full | Full + custom |
| **Support** | Community | Email (48h) | Priority (4h) | Dedicated CSM |
| **Locations** | 1 | 1 | Up to 5 | Unlimited |

#### 4.1.2 Add-Ons

- **Additional Locations:** 19€/month per extra location (Starter/Pro plans).
- **White-Label:** 99€/month add-on for Pro plan. Included in Enterprise.
- **Additional Plays:** 5€ per 1,000 additional plays beyond plan limit.
- **SMS Credits:** 0.05€ per SMS for OTP verification and marketing messages.
- **Priority Onboarding:** 299€ one-time fee for personalized onboarding session with setup assistance.

### 4.2 Revenue Streams

1. **Subscription Revenue (primary):** Monthly/annual SaaS subscriptions. Annual billing at 20% discount incentivizes commitment.
2. **Overage Revenue:** Pay-per-use beyond plan limits (plays, SMS, locations).
3. **Cross-Merchant Marketplace Commission:** 10–15% commission on cross-referral coupon redemptions between merchants.
4. **White-Label Licensing:** Premium recurring revenue from agencies and brands.
5. **Enterprise Custom Development:** Professional services for custom game development, integrations, and dedicated infrastructure.
6. **Data Insights (Future):** Anonymized, aggregated market intelligence reports for industry benchmarking (opt-in only, privacy-first).

### 4.3 Go-to-Market Strategy

#### 4.3.1 Phase 1: Launch (Months 1–3)

- Target market: France (Paris, Lyon, Marseille, Bordeaux) — direct Kadow Club territory
- Self-service freemium launch to capture small businesses underserved by Kadow Club's demo-only model
- Content marketing: SEO-optimized blog (gamification marketing, review generation, customer loyalty best practices)
- Product Hunt and Indie Hackers launch for tech-savvy early adopters
- Partnership with 10–20 restaurants for case studies and testimonials

#### 4.3.2 Phase 2: Growth (Months 4–9)

- Agency partnerships: onboard marketing agencies as white-label resellers
- Launch cross-merchant marketplace in Paris as pilot market
- Paid acquisition: Google Ads targeting Kadow Club comparison keywords, Instagram/Facebook ads targeting restaurant owners
- Referral program: merchants earn 1 month free for each successful referral
- Event sponsorships: local restaurant/retail trade shows

#### 4.3.3 Phase 3: Scale (Months 10–18)

- International expansion: Belgium, Switzerland, Morocco, Spain, UK
- Multi-language platform launch
- Enterprise sales team hiring for chain/franchise accounts
- Strategic partnerships with POS providers for bundled distribution
- Series A fundraising for accelerated growth (if desired)

---

## 5. Development Roadmap

### 5.1 MVP (Months 1–3)

Minimum viable product focused on core value delivery and competitive parity with Kadow Club:

| Feature | MVP Scope |
|---------|-----------|
| **Game Engine** | Wheel of Fortune, Slot Machine, Mystery Boxes. Basic configuration (prizes, win rates, scheduling). |
| **CTAs** | Google Review, Instagram Follow, Email Collection, Visit Stamp, Receipt Photo. |
| **Coupons** | Basic coupon generation with validity period, QR-code redemption. |
| **Fingerprinting** | Core fingerprint (canvas, WebGL, audio, hardware signals). Basic fraud detection (multi-account, bot). |
| **Merchant Dashboard** | Game configuration, prize management, basic analytics (players, actions, redemptions). |
| **Player Experience** | QR scan → action completion → game play → coupon. Mobile-optimized web UI. |
| **Communication Materials** | Auto-generated QR code posters (2–3 templates). |
| **Authentication** | Email/password + magic link for merchants. |
| **Billing** | Stripe integration. Free + Starter + Pro tiers. |

### 5.2 V1.1 (Months 4–6)

Competitive advantages and growth enablers:

- Advanced fingerprinting: cross-browser recognition, VPN detection, confidence scoring
- AI optimization engine v1: dynamic win rate adjustment, smart game selection
- A/B testing for games and prizes
- Automated email sequences (welcome, coupon reminder, re-engagement)
- Merchant mobile app (iOS + Android) with stats and coupon validation
- Zapier integration (triggers + actions)
- Advanced analytics: cohort analysis, conversion funnels
- Additional game types: Scratch Card, Advent Calendar

### 5.3 V1.5 (Months 7–9)

Network effects and ecosystem features:

- Cross-merchant gift marketplace (pilot in Paris)
- Universal Loyalty Score v1
- Competitive leaderboards with monthly prizes
- POS integrations (Square, SumUp)
- CRM integrations (HubSpot, Salesforce)
- White-label solution
- Public API v1 with documentation and SDKs
- Multi-language support (EN, FR, ES, AR)
- Additional game types: Quiz, Sports Predictor

### 5.4 V2.0 (Months 10–15)

Enterprise-grade features and international scaling:

- Enterprise plan with SSO (SAML), dedicated infrastructure, SLAs
- AI optimization engine v2: churn prediction, timing optimization, prize recommendation
- Franchise/chain management portal: centralized configuration with per-location overrides
- Custom game builder: drag-and-drop visual editor for unique game experiences
- Advanced white-label: reseller billing portal, sub-accounts
- Additional POS integrations (Toast, Lightspeed, Clover)
- Booking system integrations (TheFork, OpenTable)
- WhatsApp Business API integration for automated messaging
- SOC 2 Type II certification

### 5.5 V3.0 (Months 16–24)

Platform maturity and market leadership:

- AI-generated custom game themes based on merchant category and branding
- Augmented Reality (AR) game experiences via WebXR
- NFC tap-to-play support (in addition to QR codes)
- Anonymized market intelligence reports for merchants
- Open plugin/extension system for third-party developers
- Multi-currency and multi-tax support for global operations
- Data export and portability tools (GDPR + competitive advantage)

---

## 6. User Flows & Player Journey

### 6.1 Player Journey (End-to-End)

The complete player journey from first contact to becoming a loyal repeat customer:

#### Step 1: Discovery

The player is at a physical location (e.g., sitting in a restaurant) and sees signage (table tent, poster, sticker, receipt footer) with a QR code and a compelling message: "Scan to win a free gift!" The materials are auto-generated by the platform with the merchant's branding.

#### Step 2: QR Scan & Landing

The player scans the QR code with their smartphone camera. They are taken to the merchant's branded game page (e.g., play.yourproduct.com/merchant-slug). No app download required. The page loads in under 1 second from the nearest edge node. The fingerprinting SDK silently collects device signals in the background.

#### Step 3: Fingerprint Check

The system checks if this device has been seen before. If returning player: welcome back experience with accumulated loyalty info. If new player: fresh onboarding flow. If suspected fraud (same device, different identity): flagged and restricted.

#### Step 4: Action Completion

Before accessing the game, the player sees the available actions and the minimum required. The AI-powered CTA rotation shows the most valuable incomplete actions first. The player completes the required actions (e.g., leaves a Google review + follows on Instagram). Each action is verified in real-time where possible.

#### Step 5: Game Play

The player accesses the game. The AI engine selects the optimal game type for this player's profile. The game animation plays (wheel spin, slot reel, box reveal, etc.). Outcome is pre-determined server-side (provably fair) at the moment of play. Win or lose, the experience is entertaining and shareable.

#### Step 6: Prize & Coupon

If the player wins: animated celebration, prize reveal, and digital coupon generated with unique QR code. Coupon details: prize description, validity period (e.g., "valid from tomorrow until March 30"), redemption conditions (minimum purchase, applicable items), and merchant location info. If the player loses: encouraging message, "come back next time" with info on when they can play again.

#### Step 7: Return Visit & Redemption

The player returns to the establishment. They show their coupon (on their phone). Staff scans the coupon QR code via the merchant app. The system validates: correct coupon, not expired, not previously redeemed, and device fingerprint matches (anti-sharing). Coupon is marked as redeemed. Player earns loyalty points and leaderboard points.

#### Step 8: Re-Engagement Loop

After redemption, the player can play again (subject to frequency limits). Automated emails/messages are sent: thank you, next game available, special offers. The loyalty score increases. The cross-merchant network may send offers from nearby businesses. The leaderboard competition motivates continued engagement.

### 6.2 Merchant Onboarding Flow

1. Sign up via self-service (email or Google OAuth). No credit card required for free tier.
2. Guided setup wizard: business name, category (restaurant/retail/salon/etc.), location, logo upload.
3. Choose first game type from recommended options based on business category.
4. Configure prizes (AI suggests optimal prizes for their category, e.g., "for restaurants: 1 dessert, 1 drink, 10% off").
5. Select calls-to-action and connect accounts (Google Business Profile, Instagram handle).
6. Preview the game as a player would see it. Test play.
7. Download/print QR code materials (auto-generated with their branding).
8. Go live. First plays start arriving. Dashboard shows real-time activity.

Target: merchant goes from sign-up to first player within 10 minutes.

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Requirement | Target |
|-------------|--------|
| Player page load time | <1 second (First Contentful Paint) on 4G connection globally |
| Game animation frame rate | 60fps on mid-range devices (2020+ smartphones) |
| API response time (p95) | <100ms for read operations, <200ms for write operations |
| Fingerprint generation | <500ms client-side collection, <10ms server-side matching |
| Dashboard load time | <2 seconds initial load, <500ms for navigation between views |
| Real-time updates | <2 second delay for live activity feed on dashboard |
| Player game bundle size | <50KB gzipped (Preact + game logic + animations) |
| Email delivery | <30 seconds for transactional emails (coupon delivery) |

### 7.2 Reliability & Availability

- **Uptime SLA:** 99.95% for player-facing services (game engine, fingerprinting). 99.9% for merchant dashboard.
- **Disaster Recovery:** RPO (Recovery Point Objective) = 1 hour. RTO (Recovery Time Objective) = 4 hours. Neon database continuous backup with point-in-time recovery.
- **Graceful Degradation:** If fingerprinting service is down, games still work with reduced fraud protection. If analytics is down, games still work, events are queued for later processing.
- **Multi-Region Redundancy:** Edge workers inherently multi-region (Cloudflare network). Backend services deployed across 2+ Fly.io regions with automatic failover.

### 7.3 Internationalization (i18n)

- **Supported Languages (MVP):** French (primary), English.
- **Supported Languages (V1.5):** French, English, Spanish, Arabic (RTL support), Portuguese, Italian, German.
- **Localization Scope:** All player-facing UI, merchant dashboard, emails, communication materials, documentation.
- **Currency:** Multi-currency support from V1.5. EUR (default), USD, GBP, MAD, CHF, and others.
- **Date/Time:** Timezone-aware throughout the platform. Merchant timezone for scheduling, player timezone for coupon validity display.

### 7.4 Accessibility

- **WCAG 2.1 Level AA:** Target compliance for merchant dashboard. Keyboard navigation, screen reader support, color contrast ratios.
- **Player Games:** Visual games inherently challenging for accessibility. Text-based alternatives available. Reduced motion option for animations.
- **Mobile First:** All player-facing interfaces designed mobile-first. Responsive design for all screen sizes.

---

## 8. Legal & Compliance Considerations

### 8.1 GDPR Compliance

- **Data Controller:** Each merchant is the data controller for their customers' data. The platform acts as data processor.
- **Data Processing Agreement (DPA):** Standard DPA provided to all merchants as part of Terms of Service.
- **Consent Management:** Fingerprinting operates under legitimate interest (Article 6(1)(f)) with clear disclosure and easy opt-out. Email/SMS marketing requires explicit consent (double opt-in).
- **Data Retention:** Player data retained for 24 months of inactivity, then auto-deleted. Merchants can configure shorter retention. Fingerprints retained for 12 months of inactivity.
- **Right to Deletion:** Self-service data deletion for players (via email link). Merchant account deletion removes all associated data within 30 days.
- **Data Portability:** Full data export in machine-readable format (JSON/CSV) for both merchants and players.

### 8.2 Review Generation Compliance

- **Google ToS:** The platform incentivizes reviews but does not require positive reviews. Players are asked to "leave a review" not "leave a 5-star review." This is compliant with Google's policy against review gating.
- **TripAdvisor:** Similar approach — no review gating, no incentive for positive-only reviews.
- **Disclosure:** Players are informed that leaving a review is one of several actions that unlock the game. Transparent about the incentive structure.

### 8.3 Gambling Regulations

Marketing games with prizes can potentially fall under gambling regulations in some jurisdictions. Mitigation strategy:

- **No Monetary Prizes:** All prizes are goods/services (dessert, drink, discount), never cash or cash equivalents.
- **No Purchase Required to Play:** The game is free to play. Actions required are not purchases. Compliant with "no purchase necessary" sweepstakes law in most jurisdictions.
- **Skill Element:** Quiz and Memory Match games have skill components, further distancing from pure chance gambling.
- **Legal Review:** Jurisdiction-specific legal review before entering new markets. France (current): compliant under "loteries commerciales" regulation (Article L322-1 Code de la sécurité intérieure).

### 8.4 Fingerprinting & Privacy Law

- **ePrivacy Directive:** Device fingerprinting falls under Article 5(3) of the ePrivacy Directive. Requires consent or legitimate interest exemption. Anti-fraud is a recognized legitimate interest.
- **Transparency:** Privacy policy clearly explains what signals are collected, how they are used (fraud prevention, user recognition), and how to opt out.
- **Data Minimization:** Fingerprint vectors are hashed — original signals are not stored. Impossible to reverse-engineer personal data from the fingerprint hash.
- **Regional Variations:** Legal framework reviewed per market. CNIL (France), ICO (UK), AEPD (Spain) guidelines followed.

---

## 9. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Solo developer bottleneck** | 🔴 High | Claude Code with Opus 4.6 as force multiplier. Modular architecture enables parallel development. Feature prioritization via MVP approach. Hiring plan triggered at product-market fit. |
| **Kadow Club competitive response** | 🟡 Medium | Speed advantage via self-service model. Unique features (marketplace, loyalty score, fingerprinting) create switching costs. Open API creates ecosystem lock-in. |
| **Platform API changes (Google, Instagram)** | 🟡 Medium | Multi-verification strategy: API where available, screenshot + AI verification as fallback, honor-based as last resort. Abstraction layer isolates integration changes. |
| **Fingerprinting browser restrictions** | 🟡 Medium | Privacy-focused browsers (Brave, Firefox) limit some signals. ML model trained to work with degraded signal set. Fallback to cookie-based + IP-based recognition. Continuous research into new stable signals. |
| **GDPR enforcement on fingerprinting** | 🟡 Medium | Conservative legal posture: clear consent mechanism, easy opt-out, data minimization, legitimate interest documentation. Ready to pivot to consent-based model if regulatory landscape changes. |
| **Review platform policy changes** | 🟢 Low | Already compliant with current policies (no review gating). Diversified CTA portfolio means review generation is one of many value props, not the only one. |
| **Infrastructure costs at scale** | 🟡 Medium | Edge-first architecture (Cloudflare Workers) has excellent cost scaling (pay-per-request). Neon serverless DB scales to zero when idle. ClickHouse Cloud consumption-based pricing. Detailed cost modeling per-merchant. |
| **Data breach** | 🔴 High | Encryption at rest and in transit. Application-level PII encryption. Row-level security. Regular penetration testing. Security-focused code review. Bug bounty program (post-launch). |

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| **CTA** | Call-to-Action. A marketing action that a player must complete before accessing a game (e.g., leaving a review, following on Instagram). |
| **Device Fingerprint** | A unique identifier derived from a combination of hardware and software signals collected from a user's device, used for recognition without cookies. |
| **Durable Objects** | Cloudflare's strongly consistent, single-threaded compute objects. Used for game state to ensure exactly-once prize distribution. |
| **Edge Worker** | Serverless function deployed to 300+ global Points of Presence (PoPs) on Cloudflare's network. Executes code within milliseconds of the end user. |
| **MAP** | Monthly Active Players. The number of unique players who interacted with a game in a calendar month. |
| **OLAP / OLTP** | Online Analytical Processing / Online Transaction Processing. OLTP (PostgreSQL) for real-time transactions; OLAP (ClickHouse) for analytical queries over large datasets. |
| **POS** | Point of Sale. The system where transactions are completed (e.g., Square, Toast). Integration enables automatic coupon validation at checkout. |
| **Provably Fair** | A game outcome system where results are determined server-side before the player interacts, and can be cryptographically verified after the fact. |
| **QR Code** | Quick Response code. A 2D barcode scanned by smartphone cameras to link physical world (poster, table tent) to digital experience (game page). |
| **RPO / RTO** | Recovery Point Objective / Recovery Time Objective. RPO = maximum acceptable data loss (1 hour). RTO = maximum acceptable downtime (4 hours). |
| **Universal Loyalty Score** | An anonymized score that follows a player across all merchants on the platform, enabling cross-merchant recognition of high-value customers. |
| **White Label** | A version of the platform with all original branding removed, allowing agencies or enterprises to present it under their own brand. |

---

*Report prepared on March 24, 2026. Version 1.0 — CONFIDENTIAL.*
