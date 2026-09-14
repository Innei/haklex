import type { ColorScheme, RendererConfig, RichEditorVariant } from '@haklex/rich-editor/static';
import type { Klass, LexicalNode, SerializedEditorState } from 'lexical';
import type { CSSProperties, ElementType, ReactNode } from 'react';

export type BuiltinNodeRenderer = (
  node: any,
  key: string,
  children: ReactNode[] | null,
  defaultRenderer: () => ReactNode,
) => ReactNode;

export type BlockAnchorRenderer = (
  element: ReactNode,
  blockId: string,
  nodeKey: string,
) => ReactNode;

export interface RichRendererProps {
  as?: ElementType;
  blockAnchor?: BlockAnchorRenderer;
  builtinNodeOverrides?: Record<string, BuiltinNodeRenderer>;
  className?: string;
  extraNodes?: Array<Klass<LexicalNode>>;
  nested?: boolean;
  rendererConfig?: RendererConfig;
  style?: CSSProperties;
  theme?: ColorScheme;
  value: SerializedEditorState;
  variant?: RichEditorVariant;
}
