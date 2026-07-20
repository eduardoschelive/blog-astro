import type { APIRoute } from 'astro'
import { LOCALES, type Locale } from '@/lib/routes'
import { buildSearchIndex } from '@/lib/search'

export function getStaticPaths() {
  return LOCALES.map((locale) => ({ params: { locale } }))
}

export const GET: APIRoute = async ({ params }) => {
  const index = await buildSearchIndex(params.locale as Locale)
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  })
}
