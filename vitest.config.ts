/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config'

// getViteConfig wires Astro's resolver so tests can import modules that use the
// `@/*` alias and `astro:*` virtual modules.
export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
})
