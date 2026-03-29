import type { Klass, LexicalNode } from 'lexical';
import type { ReactNode } from 'react';
import { createContext, use, useMemo } from 'react';

const ExtraNodesContext = createContext<Array<Klass<LexicalNode>> | undefined>(undefined);

export function ExtraNodesProvider({
  children,
  extraNodes,
}: {
  children: ReactNode;
  extraNodes?: Array<Klass<LexicalNode>>;
}) {
  const value = useMemo(() => extraNodes, [extraNodes]);
  return <ExtraNodesContext.Provider value={value}>{children}</ExtraNodesContext.Provider>;
}

export function useExtraNodes(): Array<Klass<LexicalNode>> | undefined {
  return use(ExtraNodesContext);
}
