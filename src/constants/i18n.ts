// Locale and URL-segment constants shared across the app, the Astro config, and
// the build-time search endpoint. Kept free of `astro:*` imports so it can be
// loaded from anywhere (including `astro.config.ts`).

// i18n routing ported from the Next.js blog: every URL segment is translated
// (categories/categorias, articles/artigos) and slugs come from frontmatter,
// all under an always-on locale prefix (/en-US/..., /pt-BR/...).

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

// Folder names may carry an ordering prefix (e.g. `2.arrays`), dropped in the URL.
export function removeSequencePrefix(name: string): string {
  return name.replace(/^\d+\./, '')
}
