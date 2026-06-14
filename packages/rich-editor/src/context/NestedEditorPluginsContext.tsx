import type { ReactNode } from 'react';
import { createContext, use, useMemo } from 'react';

interface NestedEditorPluginsContextValue {
  plugins?: ReactNode;
}

export interface NestedEditorPluginsProviderProps {
  children: ReactNode;
  plugins?: ReactNode;
}

const NestedEditorPluginsContext = createContext<NestedEditorPluginsContextValue | null>(null);

export function NestedEditorPluginsProvider({
  children,
  plugins,
}: NestedEditorPluginsProviderProps) {
  const value = useMemo(() => ({ plugins }), [plugins]);
  return (
    <NestedEditorPluginsContext.Provider value={value}>
      {children}
    </NestedEditorPluginsContext.Provider>
  );
}

export function useNestedEditorPlugins(): ReactNode {
  return use(NestedEditorPluginsContext)?.plugins ?? null;
}
