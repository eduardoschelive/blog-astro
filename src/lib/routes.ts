import { getCollection, type CollectionEntry } from 'astro:content'

// i18n routing ported from the Next.js blog: every URL segment is translated
// (categories/categorias, articles/artigos) and slugs come from frontmatter,
// all under an always-on locale prefix (/en-US/..., /pt-BR/...).

export const LOCALES = ['en-US', 'pt-BR'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en-US'

export const ROUTE_MAPPING: Record<
  Locale,
  { categories: string; articles: string }
> = {
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

type CategoryEntry = CollectionEntry<'categories'>
type ArticleEntry = CollectionEntry<'articles'>

function localeOf(id: string): Locale {
  return id.split('/').pop() as Locale
}

export interface CategoryRoute {
  dir: string
  path: Record<Locale, string>
  entry: Record<Locale, CategoryEntry>
}

export interface ArticleRoute {
  categoryDir: string
  dir: string
  path: Record<Locale, string>
  entry: Record<Locale, ArticleEntry>
}

export function withLocalePrefix(locale: Locale, path: string): string {
  return `/${locale}${path}`
}

function alternatesFor(path: Record<Locale, string>): Record<Locale, string> {
  return {
    'en-US': withLocalePrefix('en-US', path['en-US']),
    'pt-BR': withLocalePrefix('pt-BR', path['pt-BR']),
  }
}

export async function getCategoryRoutes(): Promise<CategoryRoute[]> {
  const all = await getCollection('categories')
  const byDir = new Map<string, CategoryRoute>()

  for (const entry of all) {
    const locale = localeOf(entry.id)
    const dir = entry.id.slice(0, entry.id.lastIndexOf('/'))

    let route = byDir.get(dir)
    if (!route) {
      route = {
        dir,
        path: {} as Record<Locale, string>,
        entry: {} as Record<Locale, CategoryEntry>,
      }
      byDir.set(dir, route)
    }

    const prefix = ROUTE_MAPPING[locale].categories
    const slug = entry.data.slug || dir
    route.path[locale] = `/${prefix}/${slug}`
    route.entry[locale] = entry
  }

  return [...byDir.values()]
}

export async function getArticleRoutes(): Promise<ArticleRoute[]> {
  const categories = await getCategoryRoutes()
  const catPathByDir = new Map(categories.map((c) => [c.dir, c.path]))

  const all = await getCollection('articles')
  const byKey = new Map<string, ArticleRoute>()

  for (const entry of all) {
    const parts = entry.id.split('/')
    const locale = parts.pop() as Locale
    const dir = parts.pop() as string
    const categoryDir = parts.join('/')
    const key = `${categoryDir}/${dir}`

    let route = byKey.get(key)
    if (!route) {
      route = {
        categoryDir,
        dir,
        path: {} as Record<Locale, string>,
        entry: {} as Record<Locale, ArticleEntry>,
      }
      byKey.set(key, route)
    }

    const catPath = catPathByDir.get(categoryDir)
    if (!catPath) {
      throw new Error(
        `Article "${entry.id}" references unknown category dir "${categoryDir}"`
      )
    }

    const prefix = ROUTE_MAPPING[locale].articles
    const cleanSlug = removeSequencePrefix(entry.data.slug || dir)
    route.path[locale] = `${catPath[locale]}/${prefix}/${cleanSlug}`
    route.entry[locale] = entry
  }

  return [...byKey.values()]
}

export type PageType =
  | 'home'
  | 'categories'
  | 'about'
  | 'resources'
  | 'category'
  | 'article'

export interface PageRoute {
  locale: Locale
  // Path after the locale prefix, no leading slash. Empty for the home page.
  path: string
  type: PageType
  alternates: Record<Locale, string>
  category?: CategoryEntry
  article?: ArticleEntry
  categoryDir?: string
}

function staticPath(
  segments: { 'en-US': string; 'pt-BR': string },
  locale: Locale
): string {
  return `/${segments[locale]}`
}

export async function getAllRoutes(): Promise<PageRoute[]> {
  const routes: PageRoute[] = []

  const homeAlternates = alternatesFor({ 'en-US': '', 'pt-BR': '' })
  for (const locale of LOCALES) {
    routes.push({ locale, path: '', type: 'home', alternates: homeAlternates })
  }

  const staticPages: {
    type: PageType
    segments: (typeof STATIC_SEGMENTS)[keyof typeof STATIC_SEGMENTS]
  }[] = [
    { type: 'categories', segments: STATIC_SEGMENTS.categories },
    { type: 'about', segments: STATIC_SEGMENTS.about },
    { type: 'resources', segments: STATIC_SEGMENTS.resources },
  ]

  for (const page of staticPages) {
    const path: Record<Locale, string> = {
      'en-US': staticPath(page.segments, 'en-US'),
      'pt-BR': staticPath(page.segments, 'pt-BR'),
    }
    const alternates = alternatesFor(path)
    for (const locale of LOCALES) {
      routes.push({
        locale,
        path: path[locale].slice(1),
        type: page.type,
        alternates,
      })
    }
  }

  const categoryRoutes = await getCategoryRoutes()
  for (const cat of categoryRoutes) {
    const alternates = alternatesFor(cat.path)
    for (const locale of LOCALES) {
      routes.push({
        locale,
        path: cat.path[locale].slice(1),
        type: 'category',
        alternates,
        category: cat.entry[locale],
        categoryDir: cat.dir,
      })
    }
  }

  const articleRoutes = await getArticleRoutes()
  for (const art of articleRoutes) {
    const alternates = alternatesFor(art.path)
    for (const locale of LOCALES) {
      routes.push({
        locale,
        path: art.path[locale].slice(1),
        type: 'article',
        alternates,
        article: art.entry[locale],
        categoryDir: art.categoryDir,
      })
    }
  }

  return routes
}
