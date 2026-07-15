import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import {
  LOCALES,
  getArticleRoutes,
  getCategoryRoutes,
  withLocalePrefix,
  type Locale,
} from '../../lib/routes'
import { t } from '../../i18n/messages'
import { SITE_URL } from '../../constants/site'

const MAX_ARTICLES = 50

export function getStaticPaths() {
  return LOCALES.map((locale) => ({ params: { locale } }))
}

export const GET: APIRoute = async ({ params }) => {
  const locale = params.locale as Locale

  const categories = await getCategoryRoutes()
  const categoryTitle = new Map(
    categories.map((c) => [c.dir, c.entry[locale].data.title])
  )

  const articles = await getArticleRoutes()
  const items = articles
    .map((a) => {
      const entry = a.entry[locale]
      return {
        title: entry.data.title,
        description: entry.data.description ?? '',
        link: SITE_URL + withLocalePrefix(locale, a.path[locale]),
        pubDate: new Date(entry.data.publishedAt),
        categories: [categoryTitle.get(a.categoryDir) ?? ''],
      }
    })
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, MAX_ARTICLES)

  return rss({
    title: t(locale, 'Metadata.home.title'),
    description: t(locale, 'Metadata.home.description'),
    site: `${SITE_URL}/${locale}`,
    items,
    customData: `<language>${locale}</language>`,
  })
}
