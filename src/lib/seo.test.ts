import { describe, it, expect } from 'vitest'
import { getPageSeo } from './seo'
import type { PageRoute } from './routes'
import { SITE_URL, PERSONAL } from '@/constants/site'

const alternates = { 'en-US': '/en-US', 'pt-BR': '/pt-BR' }

describe('getPageSeo', () => {
  it('builds website metadata for the home page', () => {
    const seo = getPageSeo({
      locale: 'en-US',
      path: '',
      type: 'home',
      alternates,
    } as PageRoute)

    expect(seo.ogType).toBe('website')
    expect(seo.canonical).toBe(`${SITE_URL}/en-US`)
    expect(seo.ogImage).toBe(`${SITE_URL}/en-US/opengraph-image.png`)
    expect(seo.ogSubtitle).toBe(PERSONAL.role)
    expect(seo.keywords.length).toBeGreaterThan(0)
  })

  it('builds article metadata with publish/modify timestamps', () => {
    const article = {
      data: {
        title: 'Goroutines',
        description: 'Concurrency in Go',
        keywords: ['go', 'concurrency'],
        publishedAt: '2026-04-06',
        updatedAt: '2026-04-27',
      },
    }
    const seo = getPageSeo({
      locale: 'en-US',
      path: 'categories/go/articles/goroutines',
      type: 'article',
      alternates,
      article,
    } as unknown as PageRoute)

    expect(seo.ogType).toBe('article')
    expect(seo.title).toBe('Goroutines')
    expect(seo.tags).toEqual(['go', 'concurrency'])
    expect(seo.publishedTime).toBe(new Date('2026-04-06').toISOString())
    expect(seo.modifiedTime).toBe(new Date('2026-04-27').toISOString())
  })

  it('falls back to the title when an article has no description', () => {
    const article = {
      data: { title: 'Channels', publishedAt: '2026-05-01' },
    }
    const seo = getPageSeo({
      locale: 'en-US',
      path: 'x',
      type: 'article',
      alternates,
      article,
    } as unknown as PageRoute)

    expect(seo.description).toBe('Channels')
  })
})
