# Win & Win — Gamification Marketing Platform

> Turn every customer visit into an engaging game experience. Collect Google reviews, grow social media, and drive repeat visits.

## Overview

Win & Win is a full-stack SaaS platform that enables physical businesses (restaurants, cafes, bars, hotels, salons, gyms) to deploy interactive QR-code games. Customers scan, play, and win prizes — while completing valuable marketing actions.

### Key Features
- 🎡 **3 Game Types**: Wheel of Fortune, Slot Machine, Mystery Box
- ⭐ **12 CTA Types**: Google Reviews, Instagram, TripAdvisor, Facebook, TikTok, and more
- 🎟️ **Smart Coupons**: Time-limited, device-bound, QR-validated
- 📊 **Real-Time Analytics**: Conversion funnels, player rankings, usage tracking
- 🛡️ **Device Fingerprinting**: Cross-browser fraud prevention
- 🎨 **4 Atmosphere Presets + Custom Colors**: Joyful, Premium, Warm, Child-Friendly
- 🏪 **Business Themes**: Auto-themed by business type (restaurant, hotel, etc.)
- 📧 **Email Coupons**: Via Resend with QR codes
- 👑 **Super Admin Panel**: Full platform management
- 💰 **Freemium Model**: Configurable tier limits

## Architecture

```
winandwin/
├── apps/
│   ├── web/          → Next.js 15 (Merchant Dashboard + Admin + Landing)
│   └── player/       → Preact + Vite (Player Game UI)
├── services/
│   └── api/          → Hono on Cloudflare Workers (REST API)
├── packages/
│   ├── shared/       → TypeScript types, Zod validators, constants
│   ├── db/           → Drizzle ORM schemas (Neon Postgres)
│   └── ui/           → Shared React components (shadcn/ui)
└── scripts/          → Deployment scripts
```

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Dashboard | Next.js 15 (App Router, RSC, Tailwind v4) |
| Player App | Preact + Vite (<30KB gzipped) |
| API | Hono on Cloudflare Workers |
| Database | Neon Postgres + Drizzle ORM |
| Auth | Better Auth (email/password) |
| Email | Resend |
| Hosting | Vercel (dashboard) + Cloudflare (API + player) |
| Monorepo | Turborepo + pnpm |

## Prerequisites
- Node.js 22+
- pnpm 10+
- Neon Postgres account
- Cloudflare account
- Vercel account
- Resend account

## Environment Variables

### Dashboard (`apps/web/.env.local`)
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
BETTER_AUTH_SECRET=<32-char-hex-secret>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_PLAYER_URL=http://localhost:3001
ADMIN_API_KEY=<32-char-hex-secret>
```

### API (`services/api/.dev.vars`)
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
ADMIN_API_KEY=<same-as-above>
RESEND_API_KEY=re_xxxx
```

### Player (`apps/player`)
```env
VITE_API_URL=http://localhost:8787    # set at build time
```

## Getting Started

### 1. Install dependencies
```bash
pnpm install
```

### 2. Set up the database
Create a Neon Postgres project and get the connection string.
```bash
# Generate and run migrations
cd packages/db
export DATABASE_URL="your-neon-connection-string"
npx drizzle-kit push --force
```

### 3. Configure environment variables
```bash
cp apps/web/.env.example apps/web/.env.local
cp services/api/.dev.vars.example services/api/.dev.vars
# Edit both files with your credentials
```

### 4. Start development
```bash
pnpm dev
```
This starts all 3 services:
- Dashboard: http://localhost:3000
- Player: http://localhost:3001
- API: http://localhost:8787

### 5. Create admin user
After signing up, set yourself as admin:
```sql
UPDATE "user" SET "isAdmin" = true WHERE email = 'your@email.com';
```

## Deployment

### API (Cloudflare Workers)
```bash
cd services/api
npx wrangler deploy
npx wrangler secret put DATABASE_URL
npx wrangler secret put ADMIN_API_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ALLOWED_ORIGINS  # comma-separated production URLs
```

### Player (Cloudflare Pages)
```bash
VITE_API_URL=https://your-api.workers.dev pnpm turbo run build --filter=@winandwin/player
cd apps/player && npx wrangler pages deploy dist --project-name=winandwin-player
```

### Dashboard (Vercel)
1. Connect GitHub repo to Vercel
2. Set Root Directory: `apps/web`
3. Set Build Command: `next build`
4. Set Install Command: `cd ../.. && pnpm install`
5. Add all environment variables
6. Deploy

## Project Structure

### Key Files
| File | Purpose |
|------|---------|
| `services/api/src/routes/play.ts` | Player game flow (config, spin, register) |
| `services/api/src/routes/admin.ts` | Super admin API |
| `services/api/src/lib/game-engine.ts` | Win/lose determination |
| `services/api/src/lib/email.ts` | Coupon email via Resend |
| `apps/player/src/app.tsx` | Player flow orchestration |
| `apps/player/src/lib/fingerprint.ts` | Device fingerprinting |
| `apps/player/src/lib/atmospheres.ts` | Visual theme presets |
| `apps/player/src/lib/business-themes.ts` | Business-type themes |
| `apps/web/src/lib/auth.ts` | Better Auth configuration |
| `apps/web/src/lib/session.ts` | Session management |
| `packages/db/src/schema/` | All database table schemas |

### Database Tables
| Table | Purpose |
|-------|---------|
| `user`, `session`, `account`, `verification` | Auth (Better Auth) |
| `merchants` | Business accounts |
| `games`, `prizes` | Game configuration |
| `ctas` | Call-to-action configuration |
| `players` | Player fingerprints + data |
| `game_plays` | Play history |
| `coupons` | Generated coupons |
| `platform_settings` | Admin-configurable settings |
| `contact_requests` | Contact form submissions |

## Testing
```bash
# Type check all packages
pnpm turbo run check --filter='*' --force

# Build all packages
pnpm turbo run build --filter='*' --force

# Test with unlimited plays (append to player URL)
?testmode=unlimited
```

## License
Proprietary — All rights reserved.
