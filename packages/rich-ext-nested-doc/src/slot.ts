import type { SerializedEditorState } from 'lexical';
import type { ComponentType } from 'react';

export const NESTED_DOC_NODE_KEY = 'NestedDoc' as const;

export interface NestedDocRendererProps {
  contentState: SerializedEditorState;
}

declare module '@haklex/rich-editor/static' {
  interface RendererConfig {
    NestedDoc?: ComponentType<NestedDocRendererProps>;
  }
}
