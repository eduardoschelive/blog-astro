import fs from 'node:fs'
import path from 'node:path'
import {
  LANGUAGES,
  ROUTE_MAPPING,
  joinPath,
  getCategoryDirectories,
  getArticleDirectories,
  removeSequencePrefix,
  getFrontmatter,
} from './lib/content.js'

const PATHS = {
  categories: ['content', 'categories'],
  articles: ['content', 'articles'],
  outputDir: ['public', 'search'],
}

// Only the first 800 chars of each section ever reach the search index (see
// generateSearchIndex below), so that's the only limit that matters here —
// truncating to a larger size first and again to 800 later was pure waste.
const SECTION_CONTENT_LIMIT = 800

function slugfy(text) {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/[\s-]+/g, '-')
}

function extractSectionsWithHeadings(filePath) {
  if (!fs.existsSync(filePath)) return []

  const content = fs.readFileSync(filePath, 'utf-8')
  const withoutFrontmatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '')

  const sections = []
  const headingRegex = /^(#{1,4})\s+(.+)$/gm
  const matches = [...withoutFrontmatter.matchAll(headingRegex)]

  const idCount = {}

  if (matches.length === 0) {
    const cleanContent = cleanText(withoutFrontmatter)
    if (cleanContent) {
      sections.push({
        headingId: null,
        headingText: null,
        content: cleanContent.substring(0, SECTION_CONTENT_LIMIT),
      })
    }
    return sections
  }

  // Content before first heading
  const beforeFirst = withoutFrontmatter.substring(0, matches[0].index)
  const cleanBefore = cleanText(beforeFirst)
  if (cleanBefore) {
    sections.push({
      headingId: null,
      headingText: null,
      content: cleanBefore.substring(0, SECTION_CONTENT_LIMIT),
    })
  }

  // Each heading and its content
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const headingText = match[2].trim()
    const baseSlug = slugfy(headingText)

    let headingId = baseSlug
    if (idCount[baseSlug]) {
      headingId = `${baseSlug}-${idCount[baseSlug] + 1}`
      idCount[baseSlug] += 1
    } else {
      idCount[baseSlug] = 1
    }

    const start = match.index + match[0].length
    const end =
      i < matches.length - 1 ? matches[i + 1].index : withoutFrontmatter.length
    const sectionContent = withoutFrontmatter.substring(start, end)
    const cleanContent = cleanText(sectionContent)

    if (cleanContent) {
      sections.push({
        headingId,
        headingText,
        content: cleanContent.substring(0, SECTION_CONTENT_LIMIT),
      })
    }
  }

  return sections
}

function cleanText(text) {
  const withoutImports = text.replace(/^import\s+.*$/gm, '')
  const withoutExports = withoutImports.replace(/^export\s+.*$/gm, '')
  const withoutTags = withoutExports.replace(/<[^>]+>/g, ' ')
  const withoutCodeBlocks = withoutTags.replace(/```[\s\S]*?```/g, '')
  const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]+`/g, '')
  const withoutLinks = withoutInlineCode.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  const withoutFormatting = withoutLinks
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/>\s+/g, '')

  return withoutFormatting
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim()
}

function generateSearchIndex() {
  const searchIndex = {}

  for (const locale of LANGUAGES) {
    searchIndex[locale] = {
      categories: [],
      articles: [],
    }
  }

  const categories = getCategoryDirectories(joinPath(PATHS.categories))
  let articleId = 0
  let categoryId = 0

  for (const categorySlug of categories) {
    const categoryInfo = {}

    try {
      for (const locale of LANGUAGES) {
        const categoryFilePath = joinPath([
          ...PATHS.categories,
          categorySlug,
          locale + '.mdx',
        ])
        const frontmatter = getFrontmatter(categoryFilePath)

        if (frontmatter) {
          const slug = frontmatter.slug || categorySlug
          const routePrefix = ROUTE_MAPPING[locale].categories
          const url = `/${locale}/${routePrefix}/${slug}`

          categoryInfo[locale] = {
            title: frontmatter.title || categorySlug,
            slug: slug,
            description: frontmatter.description || '',
          }

          searchIndex[locale].categories.push({
            id: `cat-${categoryId}`,
            type: 'category',
            title: frontmatter.title || categorySlug,
            description: frontmatter.description || '',
            slug: slug,
            url,
          })
        }
      }
    } catch (error) {
      console.warn(`⚠️  Skipping category "${categorySlug}": ${error.message}`)
      continue
    }

    categoryId++

    const articles = getArticleDirectories(
      joinPath([...PATHS.articles, categorySlug])
    )

    for (const articleFolder of articles) {
      try {
        for (const locale of LANGUAGES) {
          const articleFilePath = joinPath([
            ...PATHS.articles,
            categorySlug,
            articleFolder,
            locale + '.mdx',
          ])

          const frontmatter = getFrontmatter(articleFilePath)
          if (!frontmatter) continue

          const sections = extractSectionsWithHeadings(articleFilePath)
          const cleanSlug = removeSequencePrefix(
            frontmatter.slug || articleFolder
          )

          const catInfo = categoryInfo[locale]
          if (!catInfo) continue

          const routePrefix = ROUTE_MAPPING[locale].categories
          const articleRoutePrefix = ROUTE_MAPPING[locale].articles
          const baseUrl = `/${locale}/${routePrefix}/${catInfo.slug}/${articleRoutePrefix}/${cleanSlug}`

          searchIndex[locale].articles.push({
            id: `art-${articleId}`,
            type: 'article',
            title: frontmatter.title || '',
            description: frontmatter.description || '',
            sections: sections.map((s) => ({
              h: s.headingId,
              t: s.headingText,
              c: s.content,
            })),
            category: catInfo.title,
            categorySlug: catInfo.slug,
            slug: cleanSlug,
            url: baseUrl,
          })
        }
      } catch (error) {
        console.warn(
          `⚠️  Skipping article "${categorySlug}/${articleFolder}": ${error.message}`
        )
      }

      articleId++
    }
  }

  return searchIndex
}

function main() {
  console.log('🔍 Generating search index...')

  const searchIndex = generateSearchIndex()

  const outputDir = joinPath(PATHS.outputDir)

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  let totalSize = 0

  for (const locale of LANGUAGES) {
    const outputPath = path.join(outputDir, `${locale}.json`)
    const data = searchIndex[locale]

    fs.writeFileSync(outputPath, JSON.stringify(data))

    const stats = fs.statSync(outputPath)
    const sizeKB = (stats.size / 1024).toFixed(2)
    totalSize += stats.size

    const catCount = data.categories.length
    const artCount = data.articles.length
    console.log(
      `   - ${locale}: ${catCount} categories, ${artCount} articles (${sizeKB}KB)`
    )
  }

  console.log(
    `✅ Search index generated: ${(totalSize / 1024).toFixed(2)}KB total`
  )
}

main()
