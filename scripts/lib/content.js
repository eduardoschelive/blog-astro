import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export const LANGUAGES = ['en-US', 'pt-BR']

export const ROUTE_MAPPING = {
  'en-US': {
    categories: 'categories',
    articles: 'articles',
  },
  'pt-BR': {
    categories: 'categorias',
    articles: 'artigos',
  },
}

export function joinPath(parts) {
  return path.join(process.cwd(), ...parts)
}

export function getCategoryDirectories(categoriesDir, languages = LANGUAGES) {
  return fs
    .readdirSync(categoriesDir, { withFileTypes: true })
    .filter(
      (dirent) => dirent.isDirectory() && !languages.includes(dirent.name)
    )
    .map((dirent) => dirent.name)
}

export function getArticleDirectories(articlesDir) {
  if (!fs.existsSync(articlesDir)) return []

  return fs
    .readdirSync(articlesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
}

export function removeSequencePrefix(name) {
  return name.replace(/^\d+\./, '')
}

export function getFrontmatter(filePath) {
  if (!fs.existsSync(filePath)) return null

  const content = fs.readFileSync(filePath, 'utf-8')
  return matter(content).data
}
