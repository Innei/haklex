import type { ReactNode } from 'react';
import { createContext, use, useMemo } from 'react';

export interface ExcalidrawConfig {
  apiUrl?: string;
  /** Stylesheet that defines the hand-drawn fonts (Excalifont, LXGW WenKai…); loaded once on first render. */
  fontCssHref?: string;
  saveSnapshot?: (snapshot: object, existingRef?: string) => Promise<string>;
}

const ExcalidrawConfigContext = createContext<ExcalidrawConfig>({});

export function ExcalidrawConfigProvider({
  apiUrl,
  fontCssHref,
  saveSnapshot,
  children,
}: ExcalidrawConfig & { children: ReactNode }) {
  const value = useMemo(
    () => ({ apiUrl, fontCssHref, saveSnapshot }),
    [apiUrl, fontCssHref, saveSnapshot],
  );
  return (
    <ExcalidrawConfigContext.Provider value={value}>{children}</ExcalidrawConfigContext.Provider>
  );
}

export function useExcalidrawConfig(): ExcalidrawConfig {
  return use(ExcalidrawConfigContext);
}
