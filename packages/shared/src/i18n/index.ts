import { en } from './translations/en'
import { fr } from './translations/fr'
import { es } from './translations/es'
import { ar } from './translations/ar'
import type { Translations } from './translations/en'

export type { Translations }
export type Locale = 'en' | 'fr' | 'es' | 'ar'
export const LOCALES: Locale[] = ['en', 'fr', 'es', 'ar']
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Fran\u00e7ais',
  es: 'Espa\u00f1ol',
  ar: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629',
}
export const RTL_LOCALES: Locale[] = ['ar']
export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale)
}

const translations: Record<Locale, Translations> = { en, fr, es, ar }

export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? en
}

export function t(locale: Locale, path: string, vars?: Record<string, string>): string {
  const trans = getTranslations(locale)
  const keys = path.split('.')
  let value: unknown = trans
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key]
    } else {
      return path // fallback to path if not found
    }
  }
  if (typeof value !== 'string') return path
  if (vars) {
    return value.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)
  }
  return value
}
