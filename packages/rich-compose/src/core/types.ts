import type { RendererConfig, RichEditorVariant } from '@haklex/rich-editor/static';
import type { Klass, LexicalNode, SerializedEditorState } from 'lexical';
import type { ComponentType, CSSProperties, ReactNode } from 'react';

import type { BuiltinNodeRenderer } from '../static-renderer/types';

export type RendererKey = keyof RendererConfig;

export interface RichRendererModule {
  lazyRenderers?: Partial<{
    [K in RendererKey]: () => Promise<{ default: NonNullable<RendererConfig[K]> }>;
  }>;
  name: string;
  nodes?: Klass<LexicalNode>[];
  Provider?: ComponentType<{ children: ReactNode }>;
  renderers?: Partial<RendererConfig>;
  ssrFallback?: Partial<Record<RendererKey, ReactNode>>;
}

export interface RichEditorModule extends RichRendererModule {
  actions?: ReactNode;
  editNodes?: Klass<LexicalNode>[];
  EditorProvider?: ComponentType<{ children: ReactNode }>;
  editRenderers?: Partial<RendererConfig>;
  nestedEditorPlugins?: ReactNode;
  plugins?: ReactNode;
}

export interface ComposeRendererOptions {
  builtinNodeOverrides?: Record<string, BuiltinNodeRenderer>;
  modules?: RichRendererModule[];
  overrides?: Partial<RendererConfig>;
  preset?: RichRendererModule[];
}

export interface ComposeEditorOptions {
  modules?: RichEditorModule[];
  overrides?: Partial<RendererConfig>;
  preset?: RichEditorModule[];
}

export interface RichRendererBaseProps {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  nested?: boolean;
  style?: CSSProperties;
  theme?: 'light' | 'dark';
  value: SerializedEditorState;
  variant?: RichEditorVariant;
}
