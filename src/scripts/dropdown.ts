// Client controller for the <Dropdown> component. Native <details> toggles
// instantly, so closing is intercepted to play an exit animation before the
// `open` attribute is removed; opening rides the CSS animation on `[open]`.
// Outside-click and Escape close any open dropdown.

const ATTR_BOUND = 'data-dropdown-bound'
const ATTR_CLOSING = 'data-closing'
const CLOSE_FALLBACK_MS = 250

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function closeDropdown(details: HTMLDetailsElement): void {
  if (!details.open || details.hasAttribute(ATTR_CLOSING)) return

  const panel = details.querySelector<HTMLElement>('[data-dropdown-panel]')
  if (!panel || prefersReducedMotion()) {
    details.open = false
    return
  }

  details.setAttribute(ATTR_CLOSING, '')
  let timer = 0
  const finish = () => {
    clearTimeout(timer)
    panel.removeEventListener('animationend', finish)
    details.removeAttribute(ATTR_CLOSING)
    details.open = false
  }
  timer = window.setTimeout(finish, CLOSE_FALLBACK_MS)
  panel.addEventListener('animationend', finish)
}

export function closeAllDropdowns(root: ParentNode = document): void {
  root
    .querySelectorAll<HTMLDetailsElement>('[data-dropdown][open]')
    .forEach(closeDropdown)
}

function bindDropdown(details: HTMLDetailsElement): void {
  if (details.hasAttribute(ATTR_BOUND)) return
  details.setAttribute(ATTR_BOUND, '')

  const summary = details.querySelector('summary')
  summary?.addEventListener('click', (event) => {
    // Let the opening click through; intercept the closing click so it animates.
    if (details.open) {
      event.preventDefault()
      closeDropdown(details)
    }
  })
}

export function setupDropdowns(root: ParentNode = document): void {
  root.querySelectorAll<HTMLDetailsElement>('[data-dropdown]').forEach(bindDropdown)
}

let globalsReady = false
export function initDropdownGlobals(): void {
  if (globalsReady) return
  globalsReady = true

  document.addEventListener('click', (event) => {
    const target = event.target as Node
    document
      .querySelectorAll<HTMLDetailsElement>('[data-dropdown][open]')
      .forEach((details) => {
        if (!details.contains(target)) closeDropdown(details)
      })
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllDropdowns()
  })
}
