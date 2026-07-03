import type { MetadataRoute } from 'next'

const SITE_URL = 'https://winandwin.club'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/admin',
          '/admin/',
          '/api/',
        ],
      },
      // Explicitly welcome AI-search crawlers to the marketing content.
      // These UAs are commonly seen from Perplexity, ChatGPT / OpenAI,
      // Anthropic (ClaudeBot), Google-Extended (AI Overviews), and
      // Common Crawl (feeds a lot of LLM training data).
      { userAgent: 'PerplexityBot', allow: ['/'], disallow: ['/dashboard/', '/admin/', '/api/'] },
      { userAgent: 'Perplexity-User', allow: ['/'], disallow: ['/dashboard/', '/admin/', '/api/'] },
      { userAgent: 'GPTBot', allow: ['/'], disallow: ['/dashboard/', '/admin/', '/api/'] },
      { userAgent: 'OAI-SearchBot', allow: ['/'], disallow: ['/dashboard/', '/admin/', '/api/'] },
      { userAgent: 'ChatGPT-User', allow: ['/'], disallow: ['/dashboard/', '/admin/', '/api/'] },
      { userAgent: 'ClaudeBot', allow: ['/'], disallow: ['/dashboard/', '/admin/', '/api/'] },
      { userAgent: 'Claude-Web', allow: ['/'], disallow: ['/dashboard/', '/admin/', '/api/'] },
      { userAgent: 'anthropic-ai', allow: ['/'], disallow: ['/dashboard/', '/admin/', '/api/'] },
      { userAgent: 'Google-Extended', allow: ['/'], disallow: ['/dashboard/', '/admin/', '/api/'] },
      { userAgent: 'CCBot', allow: ['/'], disallow: ['/dashboard/', '/admin/', '/api/'] },
      { userAgent: 'Applebot-Extended', allow: ['/'], disallow: ['/dashboard/', '/admin/', '/api/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
