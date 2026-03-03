import type { ReactNode } from 'react'
import { createContext, use, useMemo } from 'react'

export interface ExcalidrawConfig {
  apiUrl?: string
  saveSnapshot?: (snapshot: object, existingRef?: string) => Promise<string>
}

const ExcalidrawConfigContext = createContext<ExcalidrawConfig>({})

export function ExcalidrawConfigProvider({
  apiUrl,
  saveSnapshot,
  children,
}: ExcalidrawConfig & { children: ReactNode }) {
  const value = useMemo(
    () => ({ apiUrl, saveSnapshot }),
    [apiUrl, saveSnapshot],
  )
  return (
    <ExcalidrawConfigContext.Provider value={value}>
      {children}
    </ExcalidrawConfigContext.Provider>
  )
}

export function useExcalidrawConfig(): ExcalidrawConfig {
  return use(ExcalidrawConfigContext)
}
