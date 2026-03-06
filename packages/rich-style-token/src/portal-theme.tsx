import type { ReactNode } from 'react'
import { createContext, use, useMemo } from 'react'

export type PortalTheme = 'light' | 'dark'

type PortalThemeContextType = {
  className: string
  theme: PortalTheme
}

const PortalThemeContext = createContext<PortalThemeContextType>({
  className: '',
  theme: 'light',
})

// Portal container context — controls where floating UI (toolbar, popover) portals to.
// Defaults to document.body. Set to a modal/dialog element to keep portals within the overlay stacking context.
const PortalContainerContext = createContext<Element | null>(null)
export const PortalContainerProvider = PortalContainerContext.Provider
export function usePortalContainer(): Element {
  return use(PortalContainerContext) ?? document.body
}

export function PortalThemeProvider({
  className,
  theme,
  children,
}: {
  className: string
  theme: PortalTheme
  children?: ReactNode
}) {
  return (
    <PortalThemeContext.Provider
      value={useMemo(() => ({ className, theme }), [className, theme])}
    >
      {children}
    </PortalThemeContext.Provider>
  )
}

export function usePortalTheme() {
  return use(PortalThemeContext)
}

export function PortalThemeWrapper({ children }: { children: ReactNode }) {
  const { className, theme } = usePortalTheme()
  if (!className) return children
  return (
    <div
      style={{ display: 'contents' }}
      className={className}
      suppressHydrationWarning
      data-theme={theme}
    >
      {children}
    </div>
  )
}
