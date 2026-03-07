import type { ReactNode } from 'react';
import { createContext, use, useMemo } from 'react';

import type { RichEditorVariant } from '../types';
import type { RendererConfig } from '../types/renderer-config';

export type RendererMode = 'editor' | 'renderer';

interface RendererConfigContextValue {
  config?: RendererConfig;
  mode: RendererMode;
  variant: RichEditorVariant;
}

const RendererConfigContext = createContext<RendererConfigContextValue>({
  config: undefined,
  mode: 'renderer',
  variant: 'article',
});

export interface RendererConfigProviderProps {
  children: ReactNode;
  config?: RendererConfig;
  mode: RendererMode;
  variant: RichEditorVariant;
}

export function RendererConfigProvider({
  config,
  mode,
  variant,
  children,
}: RendererConfigProviderProps) {
  const value = useMemo(() => ({ config, mode, variant }), [config, mode, variant]);
  return <RendererConfigContext.Provider value={value}>{children}</RendererConfigContext.Provider>;
}

export function useRendererConfig(): RendererConfig | undefined {
  return use(RendererConfigContext).config;
}

export function useRendererMode(): RendererMode {
  return use(RendererConfigContext).mode;
}

export function useVariant(): RichEditorVariant {
  return use(RendererConfigContext).variant;
}
