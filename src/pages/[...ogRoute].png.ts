import type { APIRoute } from 'astro'
import { getAllRoutes } from '../lib/routes'
import { getPageSeo } from '../lib/seo'
import { renderOgImage } from '../og/render'

// Serves each page's OG image at `<page-url>/opengraph-image.png`, matching the
// og:image URL set in Seo.astro.
export async function getStaticPaths() {
  const routes = await getAllRoutes()
  return routes.map((route) => {
    const seo = getPageSeo(route)
    const path = route.alternates[route.locale].slice(1)
    return {
      params: { ogRoute: `${path}/opengraph-image` },
      props: { title: seo.ogTitle, subtitle: seo.ogSubtitle },
    }
  })
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props.title as string, props.subtitle as string)
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
