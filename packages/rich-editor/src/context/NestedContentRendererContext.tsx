import type { SerializedEditorState } from 'lexical';
import type { ReactNode } from 'react';
import { createContext, use } from 'react';

import type { RichEditorVariant } from '../types';

export type RenderEditorStateFn = (
  state: SerializedEditorState,
  variant?: RichEditorVariant,
) => ReactNode;

const NestedContentRendererContext = createContext<RenderEditorStateFn | null>(null);

export const NestedContentRendererProvider = NestedContentRendererContext.Provider;

export function useOptionalNestedContentRenderer(): RenderEditorStateFn | null {
  return use(NestedContentRendererContext);
}

export function useNestedContentRenderer(): RenderEditorStateFn {
  const fn = use(NestedContentRendererContext);
  if (!fn) {
    throw new Error('useNestedContentRenderer must be used within a NestedContentRendererProvider');
  }
  return fn;
}
