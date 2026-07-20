export function rehypeLocalizeLinks() {
  return (tree, file) => {
    const match = String(file.path || '').match(/(en-US|pt-BR)\.mdx$/)
    const locale = match ? match[1] : 'en-US'

    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'a' && node.properties) {
        const href = node.properties.href
        if (typeof href === 'string') {
          if (/^https?:\/\//.test(href)) {
            node.properties.target = '_blank'
            node.properties.rel = 'noopener noreferrer'
            node.properties.dataExternal = 'true'
          } else if (href.startsWith('/') && !/^\/(en-US|pt-BR)(\/|$)/.test(href)) {
            node.properties.href = `/${locale}${href}`
          }
        }
      }
      if (node.children) node.children.forEach(walk)
    }

    walk(tree)
  }
}
