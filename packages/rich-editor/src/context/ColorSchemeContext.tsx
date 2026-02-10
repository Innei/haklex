import type { ReactNode } from 'react'
import { createContext, use } from 'react'

export type ColorScheme = 'light' | 'dark'

const ColorSchemeContext = createContext<ColorScheme>('light')

export function ColorSchemeProvider({
  colorScheme,
  children,
}: {
  colorScheme: ColorScheme
  children: ReactNode
}) {
  return (
    <ColorSchemeContext.Provider value={colorScheme}>
      {children}
    </ColorSchemeContext.Provider>
  )
}

export function useColorScheme(): ColorScheme {
  return use(ColorSchemeContext)
}
