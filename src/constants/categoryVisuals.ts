export type AccentColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger'

const CATEGORY_VISUALS: Record<string, AccentColor> = {
  'data-structures': 'secondary',
}

interface AccentClasses {
  text: string
  dot: string
  soft: string
  border: string
  hoverText: string
  hoverBorder: string
}

// Literal Tailwind classes per accent so the compiler keeps them.
export const ACCENT_CLASSES: Record<AccentColor, AccentClasses> = {
  primary: {
    text: 'text-primary',
    dot: 'bg-primary',
    soft: 'bg-primary/10',
    border: 'border-primary/30',
    hoverText: 'group-hover:text-primary',
    hoverBorder: 'hover:border-primary/40',
  },
  secondary: {
    text: 'text-secondary',
    dot: 'bg-secondary',
    soft: 'bg-secondary/10',
    border: 'border-secondary/30',
    hoverText: 'group-hover:text-secondary',
    hoverBorder: 'hover:border-secondary/40',
  },
  success: {
    text: 'text-success',
    dot: 'bg-success',
    soft: 'bg-success/10',
    border: 'border-success/30',
    hoverText: 'group-hover:text-success',
    hoverBorder: 'hover:border-success/40',
  },
  warning: {
    text: 'text-warning',
    dot: 'bg-warning',
    soft: 'bg-warning/10',
    border: 'border-warning/30',
    hoverText: 'group-hover:text-warning',
    hoverBorder: 'hover:border-warning/40',
  },
  danger: {
    text: 'text-danger',
    dot: 'bg-danger',
    soft: 'bg-danger/10',
    border: 'border-danger/30',
    hoverText: 'group-hover:text-danger',
    hoverBorder: 'hover:border-danger/40',
  },
}

export function getCategoryAccent(slug: string): AccentColor {
  return CATEGORY_VISUALS[slug] ?? 'primary'
}
