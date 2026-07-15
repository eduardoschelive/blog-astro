import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Default generateId collapses en-US.mdx and pt-BR.mdx of the same folder into
// one id; use the full relative path so each locale stays a separate entry.
const idFromPath = ({ entry }: { entry: string }) => entry.replace(/\.mdx$/, '')

const articles = defineCollection({
  loader: glob({
    pattern: '**/{en-US,pt-BR}.mdx',
    base: './content/articles',
    generateId: idFromPath,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    slug: z.string(),
    publishedAt: z.iso.date(),
    updatedAt: z.iso.date().optional(),
  }),
})

const categories = defineCollection({
  loader: glob({
    pattern: '**/{en-US,pt-BR}.mdx',
    base: './content/categories',
    generateId: idFromPath,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    keywords: z.array(z.string()).optional(),
  }),
})

export const collections = { articles, categories }
