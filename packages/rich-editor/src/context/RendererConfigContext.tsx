import type { ReactNode } from 'react'
import { createContext, use, useMemo } from 'react'

import type { RendererConfig } from '../types/renderer-config'

export type RendererMode = 'editor' | 'renderer'

interface RendererConfigContextValue {
  config?: RendererConfig
  mode: RendererMode
}

const RendererConfigContext = createContext<RendererConfigContextValue>({
  config: undefined,
  mode: 'renderer',
})

export interface RendererConfigProviderProps {
  config?: RendererConfig
  mode: RendererMode
  children: ReactNode
}

export function RendererConfigProvider({
  config,
  mode,
  children,
}: RendererConfigProviderProps) {
  const value = useMemo(() => ({ config, mode }), [config, mode])
  return (
    <RendererConfigContext.Provider value={value}>
      {children}
    </RendererConfigContext.Provider>
  )
}

export function useRendererConfig(): RendererConfig | undefined {
  return use(RendererConfigContext).config
}

export function useRendererMode(): RendererMode {
  return use(RendererConfigContext).mode
}
