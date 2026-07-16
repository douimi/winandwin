import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CityPage } from '../../_landing/city-page'
import { CITIES, findCity } from '../../_landing/cities'

const SITE_URL = 'https://winandwin.club'
const COUNTRY = 'maroc' as const

// One page per known Moroccan city — see /apps/web/src/app/_landing/cities.ts.
// Any slug not in that list 404s. Kept fully static (no dynamic params allowed
// on top of generateStaticParams) so Vercel serves them from the CDN edge.
export const dynamicParams = false

export function generateStaticParams() {
  return CITIES.filter((c) => c.country === COUNTRY).map((c) => ({ city: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city } = await params
  const meta = findCity(COUNTRY, city)
  if (!meta) return {}

  const url = `${SITE_URL}/${COUNTRY}/${meta.slug}`
  return {
    title: meta.fr.seoTitle,
    description: meta.fr.seoDescription,
    alternates: {
      canonical: url,
      languages: { fr: url, en: url + '?lang=en' },
    },
    openGraph: {
      title: meta.fr.seoTitle,
      description: meta.fr.seoDescription,
      url,
      locale: 'fr_MA',
      alternateLocale: ['en_US'],
      type: 'website',
    },
  }
}

export default async function Page({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const meta = findCity(COUNTRY, city)
  if (!meta) notFound()
  return <CityPage city={meta} />
}
