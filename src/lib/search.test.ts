import { describe, it, expect } from 'vitest'
import { extractSections } from './search'

describe('extractSections', () => {
  it('returns a single unheaded section for body without headings', () => {
    const sections = extractSections('Just a paragraph of text.')
    expect(sections).toHaveLength(1)
    expect(sections[0]).toMatchObject({ h: null, t: null })
    expect(sections[0].c).toContain('Just a paragraph')
  })

  it('captures leading content plus one section per heading', () => {
    const body = ['Intro line.', '', '## First', 'One.', '', '## Second', 'Two.'].join(
      '\n'
    )
    const sections = extractSections(body)
    expect(sections.map((s) => s.t)).toEqual([null, 'First', 'Second'])
    expect(sections.map((s) => s.h)).toEqual([null, 'first', 'second'])
  })

  it('generates unique anchor ids for duplicate headings', () => {
    const body = '## Setup\nA.\n\n## Setup\nB.'
    const sections = extractSections(body)
    expect(sections.map((s) => s.h)).toEqual(['setup', 'setup-2'])
  })

  it('slugifies accented and punctuated headings', () => {
    const body = '## Introdução à Programação!\nConteúdo.'
    const sections = extractSections(body)
    expect(sections[0].h).toBe('introducao-a-programacao')
  })

  it('strips code fences, imports and markdown syntax from content', () => {
    const body = [
      "import Foo from '../Foo.astro'",
      '',
      '## Code',
      'Use `go build` to compile.',
      '',
      '```go',
      'func main() {}',
      '```',
      '',
      'See [the docs](https://example.com) for **more**.',
    ].join('\n')
    const [section] = extractSections(body)
    expect(section.c).not.toContain('import Foo')
    expect(section.c).not.toContain('func main')
    expect(section.c).not.toContain('```')
    expect(section.c).toContain('the docs')
    expect(section.c).toContain('more')
  })

  it('truncates section content to the index limit', () => {
    const body = `## Big\n${'word '.repeat(400)}`
    const [section] = extractSections(body)
    expect(section.c.length).toBeLessThanOrEqual(800)
  })
})
