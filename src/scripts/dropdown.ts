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

// While a dropdown is open the page is dimmed and its scroll is locked so the
// menu keeps focus; both are driven by the `dropdown-active` class on <html>.
export function syncDropdownActive(): void {
  const anyOpen = Boolean(document.querySelector('[data-dropdown][open]'))
  document.documentElement.classList.toggle('dropdown-active', anyOpen)
}

function bindDropdown(details: HTMLDetailsElement): void {
  if (details.hasAttribute(ATTR_BOUND)) return
  details.setAttribute(ATTR_BOUND, '')

  const summary = details.querySelector('summary')
  summary?.addEventListener('click', (event) => {
    if (details.open) {
      event.preventDefault()
      closeDropdown(details)
    }
  })
  details.addEventListener('toggle', syncDropdownActive)
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
