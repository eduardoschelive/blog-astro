import {
  getArticleRoutes,
  getCategoryRoutes,
  withLocalePrefix,
  removeSequencePrefix,
  type Locale,
} from './routes'

// Client-side search (MiniSearch) is fed a static JSON index per locale, built
// at request time by the /search/[locale].json endpoint. Routes/URLs are reused
// from the routing layer so this never re-derives localized paths.

export interface SearchSection {
  h: string | null
  t: string | null
  c: string
}

export interface SearchCategory {
  id: string
  type: 'category'
  title: string
  description: string
  slug: string
  url: string
}

export interface SearchArticle {
  id: string
  type: 'article'
  title: string
  description: string
  sections: SearchSection[]
  category: string
  categorySlug: string
  slug: string
  url: string
}

export interface SearchIndex {
  categories: SearchCategory[]
  articles: SearchArticle[]
}

// Only this many characters of each section reach the index; anything longer is
// noise for fuzzy title/heading search and just bloats the payload.
const SECTION_CONTENT_LIMIT = 800

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/[\s-]+/g, '-')
}

function cleanText(markdown: string): string {
  return markdown
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export\s+.*$/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/>\s+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim()
}

// Split a markdown body into a leading section plus one section per heading,
// each carrying a unique anchor id matching the rendered heading.
export function extractSections(body: string): SearchSection[] {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm
  const matches = [...body.matchAll(headingRegex)]
  const sections: SearchSection[] = []

  const pushContent = (h: string | null, t: string | null, raw: string) => {
    const c = cleanText(raw)
    if (c) sections.push({ h, t, c: c.slice(0, SECTION_CONTENT_LIMIT) })
  }

  if (matches.length === 0) {
    pushContent(null, null, body)
    return sections
  }

  pushContent(null, null, body.slice(0, matches[0].index))

  const idCount: Record<string, number> = {}
  matches.forEach((match, i) => {
    const headingText = match[2].trim()
    const baseSlug = slugify(headingText)
    const seen = idCount[baseSlug] ?? 0
    const headingId = seen ? `${baseSlug}-${seen + 1}` : baseSlug
    idCount[baseSlug] = seen + 1

    const start = match.index + match[0].length
    const end = i < matches.length - 1 ? matches[i + 1].index : body.length
    pushContent(headingId, headingText, body.slice(start, end))
  })

  return sections
}

export async function buildSearchIndex(locale: Locale): Promise<SearchIndex> {
  const categoryRoutes = await getCategoryRoutes()
  const articleRoutes = await getArticleRoutes()

  const categories: SearchCategory[] = categoryRoutes.map((c, i) => {
    const data = c.entry[locale].data
    return {
      id: `cat-${i}`,
      type: 'category',
      title: data.title,
      description: data.description,
      slug: data.slug,
      url: withLocalePrefix(locale, c.path[locale]),
    }
  })

  const categoryData = new Map(categoryRoutes.map((c) => [c.dir, c.entry[locale].data]))

  const articles: SearchArticle[] = articleRoutes.map((a, i) => {
    const entry = a.entry[locale]
    const cat = categoryData.get(a.categoryDir)
    return {
      id: `art-${i}`,
      type: 'article',
      title: entry.data.title,
      description: entry.data.description ?? '',
      sections: extractSections(entry.body ?? ''),
      category: cat?.title ?? '',
      categorySlug: cat?.slug ?? a.categoryDir,
      slug: removeSequencePrefix(entry.data.slug || a.dir),
      url: withLocalePrefix(locale, a.path[locale]),
    }
  })

  return { categories, articles }
}
