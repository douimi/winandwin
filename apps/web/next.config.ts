import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@winandwin/ui', '@winandwin/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
      ],
    },
  ],
}

export default nextConfig
