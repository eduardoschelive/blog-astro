import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

const C = {
  background: '#1a1b26',
  foreground: '#c0caf5',
  primary: '#7aa2f7',
  secondary: '#bb9af7',
  accent: '#7dcfff',
}

const font = (name: string) =>
  readFileSync(join(process.cwd(), 'src/og/fonts', name))

const fonts = [
  { name: 'Inter', data: font('inter-400.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: font('inter-700.woff'), weight: 700 as const, style: 'normal' as const },
]

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 512 512"><path d="M426.573 174.417L499.311 245.338C503.263 249.192 503.385 255.566 499.583 259.575L268.78 502.946C264.978 506.955 258.691 507.082 254.739 503.228L189.157 439.284C185.205 435.43 185.084 429.056 188.886 425.047L426.573 174.417Z" fill="#2A85F0"/><path d="M339.853 105.437C344.028 101.02 350.943 100.87 355.298 105.101L427.435 175.203L344.178 263.286L271.324 192.488C267.365 188.641 267.233 182.267 271.029 178.251L339.853 105.437Z" fill="#2A85F0"/><path d="M81.9398 338.135L10.8379 267.062C6.93319 263.159 6.85689 256.752 10.6674 252.751L243.394 8.43456C247.205 4.43424 253.459 4.35542 257.364 8.25854L321.396 72.2649C325.301 76.168 325.377 82.575 321.566 86.5754L81.9398 338.135Z" fill="#9E92E8"/><path d="M166.97 407.373C162.785 411.78 155.906 411.879 151.603 407.592L81.0945 337.346L163.725 250.311L234.234 320.557C238.536 324.844 238.632 331.891 234.448 336.299L166.97 407.373Z" fill="#9E92E8"/></svg>`
const LOGO_URI = `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString('base64')}`

// satori element tree (plain object form, mirroring the Next.js ogImage.tsx).
function tree(title: string, subtitle: string) {
  return {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${C.background} 0%, #24283b 50%, #1f2335 100%)`,
        position: 'relative',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 25% 25%, ${C.primary}15 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${C.secondary}15 0%, transparent 50%)`,
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 48,
              zIndex: 1,
            },
            children: [
              { type: 'img', props: { width: 180, height: 180, src: LOGO_URI } },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 72,
                          fontWeight: 700,
                          color: C.foreground,
                          textAlign: 'center',
                          letterSpacing: '-0.02em',
                        },
                        children: title,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 32,
                          fontWeight: 400,
                          color: C.primary,
                          textAlign: 'center',
                        },
                        children: subtitle,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 8,
              background: `linear-gradient(90deg, ${C.primary} 0%, ${C.accent} 50%, ${C.secondary} 100%)`,
            },
          },
        },
      ],
    },
  }
}

export async function renderOgImage(title: string, subtitle: string): Promise<Buffer> {
  const svg = await satori(tree(title, subtitle) as never, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  })
  const png = new Resvg(svg).render().asPng()
  return png
}
