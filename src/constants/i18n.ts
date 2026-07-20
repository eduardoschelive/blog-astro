export const LOCALES = ['en-US', 'pt-BR'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en-US'

export const ROUTE_MAPPING: Record<Locale, { categories: string; articles: string }> = {
  'en-US': { categories: 'categories', articles: 'articles' },
  'pt-BR': { categories: 'categorias', articles: 'artigos' },
}

export const STATIC_SEGMENTS = {
  categories: { 'en-US': 'categories', 'pt-BR': 'categorias' },
  about: { 'en-US': 'about', 'pt-BR': 'sobre' },
  resources: { 'en-US': 'resources', 'pt-BR': 'recursos' },
} as const

export function removeSequencePrefix(name: string): string {
  return name.replace(/^\d+\./, '')
}
