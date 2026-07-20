import { describe, it, expect } from 'vitest'
import { withLocalePrefix, DEFAULT_LOCALE, LOCALES } from './routes'

describe('withLocalePrefix', () => {
  it('prepends the locale segment to a path', () => {
    expect(withLocalePrefix('en-US', '/categories/go')).toBe('/en-US/categories/go')
    expect(withLocalePrefix('pt-BR', '/categorias/go')).toBe('/pt-BR/categorias/go')
  })

  it('produces the bare locale root for an empty path', () => {
    expect(withLocalePrefix('en-US', '')).toBe('/en-US')
  })
})

describe('re-exported locale constants', () => {
  it('exposes the default locale within the locale list', () => {
    expect(LOCALES).toContain(DEFAULT_LOCALE)
  })
})
