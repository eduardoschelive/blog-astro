import en from './en-US.json'
import pt from './pt-BR.json'
import type { Locale } from '../lib/routes'

const MESSAGES: Record<Locale, Record<string, unknown>> = {
  'en-US': en,
  'pt-BR': pt,
}

// Resolve a dot path like "Metadata.home.title" from the locale's messages.
export function t(locale: Locale, path: string): string {
  const value = path
    .split('.')
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      MESSAGES[locale]
    )
  return typeof value === 'string' ? value : path
}
