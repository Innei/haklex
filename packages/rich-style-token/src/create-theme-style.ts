import type { CSSProperties } from 'react'

import { vars } from './vars.css'

type VarsContract = typeof vars

export type ThemeTokens = {
  [K in keyof VarsContract]?: Partial<Record<keyof VarsContract[K], string>>
}

function extractVarName(cssVarRef: string): string {
  const match = cssVarRef.match(/^var\((.+)\)$/)
  return match ? match[1] : cssVarRef
}

export function createThemeStyle(tokens: ThemeTokens): CSSProperties {
  const style: Record<string, string> = {}

  for (const [group, values] of Object.entries(tokens)) {
    if (!values) continue
    const contractGroup = vars[group as keyof VarsContract] as Record<
      string,
      string
    >
    if (!contractGroup) continue
    for (const [key, value] of Object.entries(values)) {
      if (value == null) continue
      const cssVarRef = contractGroup[key]
      if (cssVarRef) {
        style[extractVarName(cssVarRef)] = value
      }
    }
  }

  return style as CSSProperties
}
