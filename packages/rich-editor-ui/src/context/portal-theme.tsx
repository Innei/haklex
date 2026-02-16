import type { ReactNode } from 'react'
import { createContext, use, useMemo } from 'react'

type PortalThemeContextType = {
  className: string
}

const PortalThemeContext = createContext<PortalThemeContextType>({
  className: '',
})

export function PortalThemeProvider({
  className,
  children,
}: {
  className: string
  children?: ReactNode
}) {
  return (
    <PortalThemeContext.Provider
      value={useMemo(() => ({ className }), [className])}
    >
      {children}
    </PortalThemeContext.Provider>
  )
}

export function usePortalTheme() {
  return use(PortalThemeContext)
}
