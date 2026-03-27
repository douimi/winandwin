#!/bin/bash
# Deploy all services

set -e

echo "Building all packages..."
pnpm turbo run build

echo ""
echo "Deploying API to Cloudflare Workers..."
cd services/api && npx wrangler deploy --env production && cd ../..

echo ""
echo "Deploying Player to Cloudflare Pages..."
cd apps/player && npx wrangler pages deploy dist --project-name=winandwin-player && cd ../..

echo ""
echo "Dashboard deploys automatically via Vercel Git integration"
echo ""
echo "Done! Set these secrets if not already done:"
echo "  wrangler secret put DATABASE_URL --env production"
echo "  wrangler secret put ADMIN_API_KEY --env production"
echo "  wrangler secret put ALLOWED_ORIGINS --env production"
