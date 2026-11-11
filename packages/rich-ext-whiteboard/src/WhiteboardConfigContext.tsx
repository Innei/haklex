import type { ReactNode } from 'react';
import { createContext, use, useMemo } from 'react';

export interface WhiteboardConfig {
  apiUrl?: string;
  /** Stylesheet for the hand-drawn font (LXGW WenKai). Defaults to the jsDelivr build; pass an empty string to load nothing. */
  fontCssHref?: string;
  saveSnapshot?: (snapshot: object, existingRef?: string) => Promise<string>;
  /** Uploads an inserted image and resolves its URL; without it images are stored as base64. */
  uploadFile?: (file: File) => Promise<string>;
}

const WhiteboardConfigContext = createContext<WhiteboardConfig>({});

export function WhiteboardConfigProvider({
  apiUrl,
  fontCssHref,
  saveSnapshot,
  uploadFile,
  children,
}: WhiteboardConfig & { children: ReactNode }) {
  const value = useMemo(
    () => ({ apiUrl, fontCssHref, saveSnapshot, uploadFile }),
    [apiUrl, fontCssHref, saveSnapshot, uploadFile],
  );
  return (
    <WhiteboardConfigContext.Provider value={value}>{children}</WhiteboardConfigContext.Provider>
  );
}

export function useWhiteboardConfig(): WhiteboardConfig {
  return use(WhiteboardConfigContext);
}
