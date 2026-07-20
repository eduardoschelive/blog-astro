// @vitest-environment happy-dom
import { beforeEach, describe, it, expect, vi } from 'vitest'
import {
  closeDropdown,
  closeAllDropdowns,
  setupDropdowns,
  initDropdownGlobals,
} from './dropdown'

function mockMotion(reduce: boolean): void {
  window.matchMedia = vi.fn((query: string) => ({
    matches: reduce,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

function makeDropdown(open: boolean): HTMLDetailsElement {
  document.body.innerHTML = `
    <details class="dropdown" data-dropdown ${open ? 'open' : ''}>
      <summary>Trigger</summary>
      <div data-dropdown-panel><a href="#">Item</a></div>
    </details>`
  return document.querySelector('details')!
}

beforeEach(() => {
  mockMotion(false)
  document.body.innerHTML = ''
})

describe('closeDropdown', () => {
  it('closes immediately when reduced motion is preferred', () => {
    mockMotion(true)
    const details = makeDropdown(true)
    closeDropdown(details)
    expect(details.open).toBe(false)
    expect(details.hasAttribute('data-closing')).toBe(false)
  })

  it('plays the exit animation before removing open', () => {
    const details = makeDropdown(true)
    const panel = details.querySelector('[data-dropdown-panel]')!

    closeDropdown(details)
    expect(details.open).toBe(true)
    expect(details.hasAttribute('data-closing')).toBe(true)

    panel.dispatchEvent(new Event('animationend'))
    expect(details.open).toBe(false)
    expect(details.hasAttribute('data-closing')).toBe(false)
  })

  it('is a no-op for an already-closed dropdown', () => {
    const details = makeDropdown(false)
    closeDropdown(details)
    expect(details.hasAttribute('data-closing')).toBe(false)
  })

  it('ignores a second close while an animation is in flight', () => {
    const details = makeDropdown(true)
    closeDropdown(details)
    closeDropdown(details)
    expect(details.open).toBe(true)
    expect(details.hasAttribute('data-closing')).toBe(true)
  })
})

describe('setupDropdowns', () => {
  it('marks each dropdown as bound exactly once', () => {
    const details = makeDropdown(false)
    setupDropdowns()
    setupDropdowns()
    expect(details.getAttribute('data-dropdown-bound')).toBe('')
  })
})

describe('global dismissal', () => {
  it('closes open dropdowns on an outside click', () => {
    mockMotion(true)
    const details = makeDropdown(true)
    initDropdownGlobals()
    document.body.dispatchEvent(new Event('click', { bubbles: true }))
    expect(details.open).toBe(false)
  })

  it('keeps the dropdown open when clicking inside it', () => {
    mockMotion(true)
    const details = makeDropdown(true)
    initDropdownGlobals()
    details.querySelector('a')!.dispatchEvent(new Event('click', { bubbles: true }))
    expect(details.open).toBe(true)
  })

  it('closes every open dropdown on Escape', () => {
    mockMotion(true)
    const details = makeDropdown(true)
    initDropdownGlobals()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(details.open).toBe(false)
  })
})

describe('closeAllDropdowns', () => {
  it('closes several open dropdowns at once', () => {
    mockMotion(true)
    document.body.innerHTML = `
      <details class="dropdown" data-dropdown open><summary>A</summary><div data-dropdown-panel></div></details>
      <details class="dropdown" data-dropdown open><summary>B</summary><div data-dropdown-panel></div></details>`
    closeAllDropdowns()
    const open = [...document.querySelectorAll('details')].filter(
      (d) => (d as HTMLDetailsElement).open
    )
    expect(open).toHaveLength(0)
  })
})
