const OPEN_DELAY = 120
const CLOSE_DELAY = 140
const GAP = 8

export interface TooltipPlacement {
  top: number
  left: number
  placement: 'top' | 'bottom'
}

export function computeTooltipPosition(
  anchor: { top: number; bottom: number; left: number; width: number },
  tip: { width: number; height: number },
  viewport: { width: number; height: number },
  gap = GAP
): TooltipPlacement {
  const fitsAbove = anchor.top - tip.height - gap >= 0
  const placement = fitsAbove ? 'top' : 'bottom'
  const top = fitsAbove ? anchor.top - tip.height - gap : anchor.bottom + gap
  const centered = anchor.left + anchor.width / 2 - tip.width / 2
  const left = Math.max(gap, Math.min(centered, viewport.width - tip.width - gap))
  return { top, left, placement }
}

interface Controller {
  reposition: () => void
  isOpen: () => boolean
  close: () => void
  contains: (node: Node) => boolean
}

const controllers = new Set<Controller>()

function isCoarsePointer(): boolean {
  return window.matchMedia('(hover: none)').matches
}

function isFocusVisible(el: Element): boolean {
  try {
    return el.matches(':focus-visible')
  } catch {
    return true
  }
}

function bindTooltip(root: HTMLElement): void {
  if (root.dataset.tooltipBound) return
  root.dataset.tooltipBound = 'true'

  const trigger = root.querySelector<HTMLElement>('[data-tooltip-trigger]')
  const bubble = root.querySelector<HTMLElement>('[data-tooltip-bubble]')
  if (!trigger || !bubble) return

  let openTimer = 0
  let closeTimer = 0
  let overTrigger = false
  let overBubble = false

  const reposition = () => {
    const anchor = trigger.getBoundingClientRect()
    const { top, left, placement } = computeTooltipPosition(
      anchor,
      { width: bubble.offsetWidth, height: bubble.offsetHeight },
      { width: window.innerWidth, height: window.innerHeight }
    )
    bubble.style.top = `${top}px`
    bubble.style.left = `${left}px`
    bubble.dataset.placement = placement
  }

  const open = () => {
    window.clearTimeout(closeTimer)
    if (bubble.dataset.open) return
    bubble.dataset.open = 'true'
    bubble.showPopover?.()
    reposition()
  }

  const close = () => {
    window.clearTimeout(openTimer)
    if (!bubble.dataset.open) return
    delete bubble.dataset.open
    bubble.hidePopover?.()
  }

  const toggle = () => (bubble.dataset.open ? close() : open())

  const scheduleOpen = () => {
    window.clearTimeout(closeTimer)
    openTimer = window.setTimeout(open, OPEN_DELAY)
  }
  const scheduleClose = () => {
    window.clearTimeout(openTimer)
    closeTimer = window.setTimeout(() => {
      if (!overTrigger && !overBubble) close()
    }, CLOSE_DELAY)
  }

  trigger.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'touch') return
    overTrigger = true
    scheduleOpen()
  })
  trigger.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'touch') return
    overTrigger = false
    scheduleClose()
  })
  trigger.addEventListener('focus', () => {
    if (isFocusVisible(trigger)) open()
  })
  trigger.addEventListener('blur', () => {
    if (!overBubble) close()
  })
  // Touch has no hover/focus intent, so a tap toggles the tooltip.
  trigger.addEventListener('click', () => {
    if (isCoarsePointer()) toggle()
  })

  bubble.addEventListener('pointerenter', () => {
    overBubble = true
    window.clearTimeout(closeTimer)
  })
  bubble.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'touch') return
    overBubble = false
    scheduleClose()
  })

  controllers.add({
    reposition,
    isOpen: () => Boolean(bubble.dataset.open),
    close,
    contains: (node) => root.contains(node),
  })
}

export function setupTooltips(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-tooltip]').forEach(bindTooltip)
}

export function closeAllTooltips(): void {
  controllers.forEach((c) => c.close())
}

let globalsReady = false
export function initTooltipGlobals(): void {
  if (globalsReady) return
  globalsReady = true

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllTooltips()
  })
  document.addEventListener('pointerdown', (event) => {
    const target = event.target as Node
    controllers.forEach((c) => {
      if (c.isOpen() && !c.contains(target)) c.close()
    })
  })

  const repositionOpen = () => {
    controllers.forEach((c) => {
      if (c.isOpen()) c.reposition()
    })
  }
  window.addEventListener('scroll', repositionOpen, { passive: true })
  window.addEventListener('resize', repositionOpen, { passive: true })
}
