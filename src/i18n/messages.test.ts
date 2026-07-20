import { describe, it, expect } from 'vitest'
import en from './en-US.json'
import pt from './pt-BR.json'
import { t } from './messages'

function leafKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === 'object'
      ? leafKeys(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  )
}

describe('t', () => {
  it('resolves a nested dot-path for each locale', () => {
    expect(t('en-US', 'NotFound.title')).toBe('Page not found')
    expect(t('pt-BR', 'NotFound.title')).toBe('Página não encontrada')
  })
})

describe('locale parity', () => {
  it('en-US and pt-BR expose exactly the same keys', () => {
    const enKeys = leafKeys(en).sort()
    const ptKeys = leafKeys(pt).sort()
    expect(ptKeys).toEqual(enKeys)
  })

  it('every en-US key resolves to a non-empty string in both locales', () => {
    for (const key of leafKeys(en)) {
      // @ts-expect-error runtime coverage over the full key space
      expect(t('en-US', key), key).not.toBe(key)
      // @ts-expect-error runtime coverage over the full key space
      expect(t('pt-BR', key), key).not.toBe(key)
    }
  })
})
