import en from './en-US.json'
import pt from './pt-BR.json'
import type { Locale } from '@/lib/routes'

// Dot-separated paths to every string leaf, e.g. "Metadata.home.title". Derived
// from the default locale so a mistyped key is a compile-time error instead of
// silently rendering the raw path at runtime.
type LeafPaths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${LeafPaths<T[K]>}`
}[keyof T & string]

export type MessageKey = LeafPaths<typeof en>

const MESSAGES: Record<Locale, Record<string, unknown>> = {
  'en-US': en,
  'pt-BR': pt,
}

export function t(locale: Locale, key: MessageKey): string {
  const value = key
    .split('.')
    .reduce<unknown>(
      (acc, k) =>
        acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined,
      MESSAGES[locale]
    )
  return typeof value === 'string' ? value : key
}
