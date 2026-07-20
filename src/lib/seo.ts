import type { PageRoute, Locale } from './routes'
import { SITE_URL, PERSONAL } from '@/constants/site'
import { t } from '@/i18n/messages'

const HOME_KEYWORDS = [
  'Eduardo Schelive',
  'web development',
  'software engineer',
  'cloud infrastructure',
  'software architecture',
  'technology blog',
  'programming tutorials',
  'Next.js',
  'React',
  'TypeScript',
]

export interface PageSeo {
  title: string
  description: string
  keywords: string[]
  canonical: string
  alternates: Record<Locale, string>
  ogType: 'website' | 'article' | 'profile'
  ogTitle: string
  ogSubtitle: string
  ogImage: string
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
}

export function getPageSeo(route: PageRoute): PageSeo {
  const { locale } = route
  const canonical = SITE_URL + route.alternates[locale]
  const alternates: Record<Locale, string> = {
    'en-US': SITE_URL + route.alternates['en-US'],
    'pt-BR': SITE_URL + route.alternates['pt-BR'],
  }
  const base = { canonical, alternates, ogImage: `${canonical}/opengraph-image.png` }

  switch (route.type) {
    case 'home':
      return {
        ...base,
        title: t(locale, 'Metadata.home.title'),
        description: t(locale, 'Metadata.home.description'),
        keywords: HOME_KEYWORDS,
        ogType: 'website',
        ogTitle: PERSONAL.name.short,
        ogSubtitle: PERSONAL.role,
      }
    case 'about':
      return {
        ...base,
        title: t(locale, 'Metadata.about.title'),
        description: t(locale, 'Metadata.about.description'),
        keywords: [],
        ogType: 'website',
        ogTitle: PERSONAL.name.full,
        ogSubtitle: PERSONAL.role,
      }
    case 'categories':
      return {
        ...base,
        title: t(locale, 'Metadata.categories.title'),
        description: t(locale, 'Metadata.categories.description'),
        keywords: [],
        ogType: 'website',
        ogTitle: t(locale, 'Metadata.categories.title'),
        ogSubtitle: 'Category',
      }
    case 'resources':
      return {
        ...base,
        title: t(locale, 'Metadata.resources.title'),
        description: t(locale, 'Metadata.resources.description'),
        keywords: [],
        ogType: 'website',
        ogTitle: PERSONAL.name.short,
        ogSubtitle: PERSONAL.role,
      }
    case 'category': {
      const c = route.category!.data
      return {
        ...base,
        title: c.title,
        description: c.description,
        keywords: [...(c.keywords ?? []), c.title, 'tutorials', 'articles', 'guides'],
        ogType: 'website',
        ogTitle: c.title,
        ogSubtitle: 'Category',
      }
    }
    case 'article': {
      const a = route.article!.data
      const published = new Date(a.publishedAt).toISOString()
      const modified = a.updatedAt ? new Date(a.updatedAt).toISOString() : published
      return {
        ...base,
        title: a.title,
        description: a.description || a.title,
        keywords: a.keywords ?? [],
        ogType: 'article',
        ogTitle: a.title,
        ogSubtitle: 'Article',
        publishedTime: published,
        modifiedTime: modified,
        tags: a.keywords ?? [],
      }
    }
  }
}
