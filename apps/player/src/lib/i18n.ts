import { getTranslations, isRtl, type Locale, type Translations } from '@winandwin/shared/i18n'

let currentLocale: Locale = 'en'
let currentTranslations: Translations = getTranslations('en')

export function setLocale(locale: string) {
  currentLocale = (locale as Locale) || 'en'
  currentTranslations = getTranslations(currentLocale)

  // Set RTL direction on document
  if (typeof document !== 'undefined') {
    document.documentElement.dir = isRtl(currentLocale) ? 'rtl' : 'ltr'
    document.documentElement.lang = currentLocale
  }
}

export function useT(): Translations {
  return currentTranslations
}

export function getLocale(): Locale {
  return currentLocale
}
