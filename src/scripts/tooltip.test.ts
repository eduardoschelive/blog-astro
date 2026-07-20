// @vitest-environment happy-dom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { computeTooltipPosition, setupTooltips, initTooltipGlobals } from './tooltip'

describe('computeTooltipPosition', () => {
  const viewport = { width: 1000, height: 800 }

  it('sits above the anchor and centers when there is room', () => {
    const r = computeTooltipPosition(
      { top: 400, bottom: 420, left: 480, width: 40 },
      { width: 200, height: 100 },
      viewport
    )
    expect(r.placement).toBe('top')
    expect(r.top).toBe(400 - 100 - 8)
    expect(r.left).toBe(480 + 20 - 100)
  })

  it('flips below the anchor when it would overflow the top', () => {
    const r = computeTooltipPosition(
      { top: 40, bottom: 60, left: 480, width: 40 },
      { width: 200, height: 100 },
      viewport
    )
    expect(r.placement).toBe('bottom')
    expect(r.top).toBe(60 + 8)
  })

  it('clamps to the left and right viewport edges', () => {
    const left = computeTooltipPosition(
      { top: 400, bottom: 420, left: 0, width: 20 },
      { width: 200, height: 80 },
      viewport
    )
    expect(left.left).toBe(8)

    const right = computeTooltipPosition(
      { top: 400, bottom: 420, left: 990, width: 20 },
      { width: 200, height: 80 },
      viewport
    )
    expect(right.left).toBe(1000 - 200 - 8)
  })
})

function mockPointer(coarse: boolean) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: coarse && query.includes('hover: none'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

function setup({ coarse = false, focusVisible = true, hoverOnly = false } = {}) {
  mockPointer(coarse)
  document.body.innerHTML = `
    <span data-tooltip ${hoverOnly ? 'data-tooltip-hover-only' : ''}>
      <button data-tooltip-trigger aria-describedby="tt">term</button>
      <div id="tt" role="tooltip" popover="manual" data-tooltip-bubble>body</div>
    </span>
    <button id="outside">outside</button>`
  const trigger = document.querySelector<HTMLElement>('[data-tooltip-trigger]')!
  const bubble = document.querySelector<HTMLElement>('[data-tooltip-bubble]')!
  trigger.matches = () => focusVisible
  bubble.showPopover = () => {}
  bubble.hidePopover = () => {}
  setupTooltips()
  initTooltipGlobals()
  return { trigger, bubble }
}

describe('tooltip controller (pointer/keyboard)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('opens on hover only after the intent delay', () => {
    const { trigger, bubble } = setup()
    trigger.dispatchEvent(new Event('pointerenter'))
    expect(bubble.dataset.open).toBeUndefined()
    vi.advanceTimersByTime(120)
    expect(bubble.dataset.open).toBe('true')
  })

  it('opens on keyboard focus', () => {
    const { trigger, bubble } = setup({ focusVisible: true })
    trigger.dispatchEvent(new Event('focus'))
    expect(bubble.dataset.open).toBe('true')
  })

  it('does not open on a non-visible (pointer) focus', () => {
    const { trigger, bubble } = setup({ focusVisible: false })
    trigger.dispatchEvent(new Event('focus'))
    expect(bubble.dataset.open).toBeUndefined()
  })

  it('closes on Escape', () => {
    const { trigger, bubble } = setup()
    trigger.dispatchEvent(new Event('focus'))
    expect(bubble.dataset.open).toBe('true')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(bubble.dataset.open).toBeUndefined()
  })

  it('stays open while the pointer moves onto the bubble', () => {
    const { trigger, bubble } = setup()
    trigger.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(120)
    trigger.dispatchEvent(new Event('pointerleave'))
    bubble.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(300)
    expect(bubble.dataset.open).toBe('true')
  })
})

describe('tooltip controller (touch)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('toggles open and closed on tap', () => {
    const { trigger, bubble } = setup({ coarse: true })
    trigger.dispatchEvent(new Event('click'))
    expect(bubble.dataset.open).toBe('true')
    trigger.dispatchEvent(new Event('click'))
    expect(bubble.dataset.open).toBeUndefined()
  })

  it('ignores taps on non-touch (hover) devices', () => {
    const { trigger, bubble } = setup({ coarse: false })
    trigger.dispatchEvent(new Event('click'))
    expect(bubble.dataset.open).toBeUndefined()
  })

  it('does not toggle on tap when hover-only (icon buttons keep their action)', () => {
    const { trigger, bubble } = setup({ coarse: true, hoverOnly: true })
    trigger.dispatchEvent(new Event('click'))
    expect(bubble.dataset.open).toBeUndefined()
  })

  it('hover-only closes on click so the trigger action can take over', () => {
    const { trigger, bubble } = setup({ hoverOnly: true, focusVisible: true })
    trigger.dispatchEvent(new Event('focus'))
    expect(bubble.dataset.open).toBe('true')
    trigger.dispatchEvent(new Event('click'))
    expect(bubble.dataset.open).toBeUndefined()
  })

  it('closes when tapping outside', () => {
    const { trigger, bubble } = setup({ coarse: true })
    trigger.dispatchEvent(new Event('click'))
    expect(bubble.dataset.open).toBe('true')
    document
      .getElementById('outside')!
      .dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(bubble.dataset.open).toBeUndefined()
  })
})
