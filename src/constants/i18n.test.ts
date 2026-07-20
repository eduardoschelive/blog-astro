import { describe, it, expect } from 'vitest'
import { removeSequencePrefix, LOCALES, ROUTE_MAPPING } from './i18n'

describe('removeSequencePrefix', () => {
  it('drops a leading numeric ordering prefix', () => {
    expect(removeSequencePrefix('2.arrays')).toBe('arrays')
    expect(removeSequencePrefix('10.hash-tables')).toBe('hash-tables')
  })

  it('leaves names without a prefix untouched', () => {
    expect(removeSequencePrefix('arrays')).toBe('arrays')
    expect(removeSequencePrefix('go-1.21-features')).toBe('go-1.21-features')
  })
})

describe('locale config', () => {
  it('maps a translated segment for every locale', () => {
    for (const locale of LOCALES) {
      expect(ROUTE_MAPPING[locale].categories).toBeTruthy()
      expect(ROUTE_MAPPING[locale].articles).toBeTruthy()
    }
  })
})
