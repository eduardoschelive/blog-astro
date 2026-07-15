// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.eduardoschelive.com',
  output: 'static',
  // `/` has no locale; redirect to the default one.
  redirects: {
    '/': '/en-US',
  },
  integrations: [mdx(), sitemap()],
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});