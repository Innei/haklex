import type { CSSProperties, ReactNode } from 'react'

const FORMAT_FLAGS: [number, string][] = [
  [1, 'rich-text-bold'],
  [2, 'rich-text-italic'],
  [4, 'rich-text-strikethrough'],
  [8, 'rich-text-underline'],
  [16, 'rich-text-code'],
  [32, 'rich-text-subscript'],
  [64, 'rich-text-superscript'],
  [128, 'rich-text-highlight'],
]

function parseCSSText(cssText: string): CSSProperties {
  const style: Record<string, string> = {}
  for (const part of cssText.split(';')) {
    const colonIndex = part.indexOf(':')
    if (colonIndex === -1) continue
    const prop = part.slice(0, colonIndex).trim()
    const value = part.slice(colonIndex + 1).trim()
    if (!prop || !value) continue
    const camelProp = prop.replaceAll(/-([a-z])/g, (_, c: string) =>
      c.toUpperCase(),
    )
    style[camelProp] = value
  }
  return style as CSSProperties
}

export function renderTextNode(node: any, key: string): ReactNode {
  let element: ReactNode = node.text
  const format = node.format || 0

  for (const [flag, className] of FORMAT_FLAGS) {
    if (format & flag) {
      element = (
        <span key={`${key}-${flag}`} className={className}>
          {element}
        </span>
      )
    }
  }

  if (node.style) {
    element = (
      <span key={key} style={parseCSSText(node.style)}>
        {element}
      </span>
    )
  }

  return element
}
