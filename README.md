# blog-astro

Personal blog and technical writing of Eduardo Schelive — bilingual (en-US /
pt-BR), statically generated with [Astro](https://astro.build), deployed to
Vercel. Zero client-side framework: every page is `.astro` + small vanilla
`<script>` islands.

## Stack

| Concern        | Choice                                                        |
| -------------- | ------------------------------------------------------------- |
| Framework      | Astro 7 (`output: 'static'`), Vercel adapter                  |
| Content        | MDX via content collections (`glob` loader, Zod schemas)      |
| Styling        | Tailwind CSS v4 (Vite plugin), CSS design tokens, Tokyo Night |
| Search         | MiniSearch over a build-time JSON index                       |
| Code highlight | Shiki dual-theme (light/dark)                                 |
| OG images      | satori + resvg, rendered at build                             |
| Tooling        | Prettier, ESLint (flat), Vitest, lefthook                     |

## Commands

All commands run from the project root (Node ≥ 22.12, pnpm):

| Command          | Action                                   |
| ---------------- | ---------------------------------------- |
| `pnpm install`   | Install dependencies (sets up git hooks) |
| `pnpm dev`       | Dev server at `localhost:4321`           |
| `pnpm build`     | Production build to `./dist/`            |
| `pnpm preview`   | Preview the production build locally     |
| `pnpm typecheck` | `astro check` (types + templates)        |
| `pnpm test`      | Run the Vitest suite                     |
| `pnpm lint`      | ESLint                                   |
| `pnpm format`    | Prettier write                           |

`pnpm build`, `lint`, `format:check`, `typecheck`, and `test` all run in CI
(`.github/workflows/ci.yml`); a lefthook pre-commit hook formats and lints
staged files.

## Content

Content lives at the repository root (not `src/`), one folder per topic with a
parallel file per locale:

```
content/
├── categories/<category>/{en-US,pt-BR}.mdx
└── articles/<category>/<n.slug>/{en-US,pt-BR}.mdx
```

A leading numeric prefix on article folders (e.g. `2.arrays`) only sets ordering
and is dropped from the URL. Frontmatter is validated by Zod schemas in
[`src/content.config.ts`](src/content.config.ts) (`title`, `slug`,
`publishedAt`, …). Both locales of a topic must exist.

## i18n routing

Routing is fully translated and lives in [`src/lib/routes.ts`](src/lib/routes.ts),
with the shared, dependency-free constants in
[`src/constants/i18n.ts`](src/constants/i18n.ts):

- Every URL carries a locale prefix — `/en-US/...`, `/pt-BR/...`. `/` redirects
  to the default locale.
- URL segments are translated (`categories`/`categorias`,
  `articles`/`artigos`) and slugs come from frontmatter.
- A single catch-all page, `src/pages/[locale]/[...path].astro`, resolves the
  route table and dispatches to the right page component.

UI strings are keyed in [`src/i18n/`](src/i18n) and read through a type-safe
`t(locale, key)` helper — a mistyped key is a compile-time error.

## How key pieces are built

- **Search index** — `src/pages/search/[locale].json.ts` emits
  `/search/<locale>.json` at build time from the content collections (logic in
  [`src/lib/search.ts`](src/lib/search.ts)). No separate generation step; the
  client fetches and indexes it with MiniSearch on first open.
- **OG images** — `src/pages/[...ogRoute].png.ts` renders one PNG per route via
  satori/resvg ([`src/og/render.ts`](src/og/render.ts)).
- **RSS & sitemap** — per-locale RSS (`src/pages/[locale]/rss.xml.ts`) and a
  hand-rolled sitemap with `hreflang` alternates
  ([`src/pages/sitemap.xml.ts`](src/pages/sitemap.xml.ts)).

## Conventions

- Import from `@/` (mapped to `src/`) for cross-directory imports; `./` for
  siblings.
- Comments explain _why_, not _what_.
- Site/author constants live in [`src/constants/`](src/constants).
