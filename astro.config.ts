import { defineConfig } from 'astro/config'

import mdx from '@astrojs/mdx'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import { unified } from '@astrojs/markdown-remark'
import { tokyoNightLight } from './src/shiki/tokyo-night-light.ts'
import { rehypeLocalizeLinks } from './src/plugins/rehype-localize-links.mjs'
import { SITE_URL } from './src/constants/site.ts'
import { DEFAULT_LOCALE } from './src/constants/i18n.ts'

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // `/` has no locale; redirect to the default one.
  redirects: {
    '/': `/${DEFAULT_LOCALE}`,
    '/rss.xml': `/${DEFAULT_LOCALE}/rss.xml`,
  },
  markdown: {
    // Dual theme output; light/dark switch via the `.dark` class in CSS.
    shikiConfig: {
      themes: { dark: 'tokyo-night', light: tokyoNightLight },
      defaultColor: false,
      wrap: false,
    },
    processor: unified({ rehypePlugins: [rehypeLocalizeLinks] }),
  },
  integrations: [mdx()],
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
})
