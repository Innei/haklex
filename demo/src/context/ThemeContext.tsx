import type { ColorScheme } from '@haklex/rich-editor'
import { createContext, use } from 'react'

export const ThemeContext = createContext<ColorScheme>('light')

export function useTheme(): ColorScheme {
  return use(ThemeContext)
}
