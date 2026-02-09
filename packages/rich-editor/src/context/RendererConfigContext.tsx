import type { ReactNode } from 'react'
import { createContext, use } from 'react'

import type { RendererConfig } from '../types/renderer-config'

const RendererConfigContext = createContext<RendererConfig | undefined>(
  undefined,
)

export interface RendererConfigProviderProps {
  config?: RendererConfig
  children: ReactNode
}

export function RendererConfigProvider({
  config,
  children,
}: RendererConfigProviderProps) {
  return (
    <RendererConfigContext.Provider value={config}>
      {children}
    </RendererConfigContext.Provider>
  )
}

/**
 * Hook to access custom renderer configuration.
 * Returns undefined if no custom renderers are configured.
 */
export function useRendererConfig(): RendererConfig | undefined {
  return use(RendererConfigContext)
}
