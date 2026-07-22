import type { MetadataRoute } from 'next'
import { CITIES } from './_landing/cities'

const SITE_URL = 'https://winandwin.club'

// Static sitemap covering the marketing page + section anchors + all
// city-specific landing pages (see _landing/cities.ts). The authenticated
// app (dashboard, admin) is intentionally excluded so search engines don't
// waste crawl budget on the private surface.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const rootAndAnchors: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/#how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/#games`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/#features`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/#plans`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/#contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/sign-in`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/sign-up`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    // Legal pages — kept indexable so brand searches surface them
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/confidentiality`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ]

  const cityEntries: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${SITE_URL}/${c.country}/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.85,
  }))

  return [...rootAndAnchors, ...cityEntries]
}
