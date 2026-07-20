import { defineConfig } from 'astro/config'

import mdx from '@astrojs/mdx'
import icon from 'astro-icon'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import { unified } from '@astrojs/markdown-remark'
import { tokyoNightLight } from './src/shiki/tokyo-night-light.ts'
import { rehypeLocalizeLinks } from './src/plugins/rehype-localize-links.mjs'
import { SITE_URL } from './src/constants/site.ts'
import { DEFAULT_LOCALE } from './src/constants/i18n.ts'

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  redirects: {
    '/': `/${DEFAULT_LOCALE}`,
    '/rss.xml': `/${DEFAULT_LOCALE}/rss.xml`,
  },
  markdown: {
    shikiConfig: {
      themes: { dark: 'tokyo-night', light: tokyoNightLight },
      defaultColor: false,
      wrap: false,
    },
    processor: unified({ rehypePlugins: [rehypeLocalizeLinks] }),
  },
  integrations: [mdx(), icon()],
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
})
