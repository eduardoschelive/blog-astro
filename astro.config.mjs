// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { tokyoNightLight } from './src/shiki/tokyo-night-light.ts';
import { rehypeLocalizeLinks } from './src/plugins/rehype-localize-links.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.eduardoschelive.com',
  output: 'static',
  // `/` has no locale; redirect to the default one.
  redirects: {
    '/': '/en-US',
    '/rss.xml': '/en-US/rss.xml',
  },
  markdown: {
    // Dual theme output; light/dark switch via the `.dark` class in CSS.
    shikiConfig: {
      themes: { dark: 'tokyo-night', light: tokyoNightLight },
      defaultColor: false,
      wrap: false,
    },
    rehypePlugins: [rehypeLocalizeLinks],
  },
  integrations: [mdx()],
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});