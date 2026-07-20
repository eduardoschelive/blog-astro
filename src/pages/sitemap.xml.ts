import type { APIRoute } from 'astro'
import { getAllRoutes, type PageRoute, type Locale } from '@/lib/routes'
import { SITE_URL } from '@/constants/site'

const META: Record<PageRoute['type'], { priority: string; changefreq: string }> = {
  home: { priority: '1.0', changefreq: 'weekly' },
  about: { priority: '0.8', changefreq: 'weekly' },
  categories: { priority: '0.8', changefreq: 'weekly' },
  resources: { priority: '0.8', changefreq: 'weekly' },
  category: { priority: '0.7', changefreq: 'weekly' },
  article: { priority: '0.9', changefreq: 'monthly' },
}

function lastmod(route: PageRoute): string | null {
  if (route.type !== 'article' || !route.article) return null
  const { updatedAt, publishedAt } = route.article.data
  return updatedAt ?? publishedAt
}

function urlEntry(route: PageRoute): string {
  const loc = SITE_URL + route.alternates[route.locale]
  const { priority, changefreq } = META[route.type]
  const mod = lastmod(route)
  const alts: [Locale | 'x-default', string][] = [
    ['en-US', SITE_URL + route.alternates['en-US']],
    ['pt-BR', SITE_URL + route.alternates['pt-BR']],
    ['x-default', SITE_URL + route.alternates['en-US']],
  ]
  const links = alts
    .map(
      ([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`
    )
    .join('')
  return `<url><loc>${loc}</loc>${
    mod ? `<lastmod>${mod}</lastmod>` : ''
  }<changefreq>${changefreq}</changefreq><priority>${priority}</priority>${links}</url>`
}

export const GET: APIRoute = async () => {
  const routes = await getAllRoutes()
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes.map(urlEntry).join('\n')}
</urlset>`
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
