import {
  getArticleRoutes,
  getCategoryRoutes,
  withLocalePrefix,
  removeSequencePrefix,
  type ArticleRoute,
  type Locale,
} from './routes'

const WORDS_PER_MINUTE = 200

export interface ArticleSummary {
  title: string
  description: string
  url: string
  categoryDir: string
  categoryTitle: string
  categorySlug: string
  publishedAt: string
  updatedAt?: string
  sequence: number | null
  readingMinutes: number
}

export interface CategorySummary {
  title: string
  description: string
  slug: string
  url: string
  articleCount: number
  articles: { title: string; url: string; sequence: number | null }[]
}

function readingMinutes(body: string): number {
  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~-]/g, ' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

function sequenceOf(dir: string): number | null {
  const m = dir.match(/^(\d+)\./)
  return m ? Number(m[1]) : null
}

function buildSummary(
  route: ArticleRoute,
  locale: Locale,
  categoryTitle: string,
  categorySlug: string
): ArticleSummary {
  const entry = route.entry[locale]
  return {
    title: entry.data.title,
    description: entry.data.description ?? '',
    url: withLocalePrefix(locale, route.path[locale]),
    categoryDir: route.categoryDir,
    categoryTitle,
    categorySlug,
    publishedAt: entry.data.publishedAt,
    updatedAt: entry.data.updatedAt,
    sequence: sequenceOf(route.dir),
    readingMinutes: readingMinutes(entry.body ?? ''),
  }
}

export async function getArticleSummaries(locale: Locale): Promise<ArticleSummary[]> {
  const categories = await getCategoryRoutes()
  const catTitle = new Map(categories.map((c) => [c.dir, c.entry[locale].data.title]))
  const catSlug = new Map(categories.map((c) => [c.dir, c.entry[locale].data.slug]))

  const routes = await getArticleRoutes()
  return routes
    .map((r) =>
      buildSummary(
        r,
        locale,
        catTitle.get(r.categoryDir) ?? '',
        catSlug.get(r.categoryDir) ?? r.categoryDir
      )
    )
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export async function getArticlesByCategoryDir(
  locale: Locale,
  categoryDir: string
): Promise<ArticleSummary[]> {
  const routes = await getArticleRoutes()
  const categories = await getCategoryRoutes()
  const cat = categories.find((c) => c.dir === categoryDir)
  const catTitle = cat?.entry[locale].data.title ?? ''
  const catSlug = cat?.entry[locale].data.slug ?? categoryDir

  return routes
    .filter((r) => r.categoryDir === categoryDir)
    .map((r) => buildSummary(r, locale, catTitle, catSlug))
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
}

export async function getCategorySummaries(locale: Locale): Promise<CategorySummary[]> {
  const categories = await getCategoryRoutes()
  const out: CategorySummary[] = []

  for (const c of categories) {
    const articles = await getArticlesByCategoryDir(locale, c.dir)
    out.push({
      title: c.entry[locale].data.title,
      description: c.entry[locale].data.description,
      slug: c.entry[locale].data.slug,
      url: withLocalePrefix(locale, c.path[locale]),
      articleCount: articles.length,
      articles: articles.map((a) => ({
        title: a.title,
        url: a.url,
        sequence: a.sequence,
      })),
    })
  }

  return out
}

export function readingLabel(m: number, locale: Locale): string {
  return locale === 'pt-BR' ? `${m} min de leitura` : `${m} min read`
}

export function articleCountLabel(n: number, locale: Locale): string {
  if (locale === 'pt-BR') return n === 1 ? '1 artigo' : `${n} artigos`
  return n === 1 ? '1 article' : `${n} articles`
}

export function formatDate(dateStr: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr))
}

export { removeSequencePrefix }
