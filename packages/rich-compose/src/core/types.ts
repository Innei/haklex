import type { RendererConfig, RichEditorVariant } from '@haklex/rich-editor/static';
import type { Klass, LexicalNode, SerializedEditorState } from 'lexical';
import type { ComponentType, CSSProperties, ElementType, ReactNode } from 'react';

import type { RendererSurface } from '../static-renderer/surface';
import type { BlockAnchorRenderer, BuiltinNodeRenderer } from '../static-renderer/types';
import type { RendererVirtualization } from '../virtualization/plugin';

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
  surface?: RendererSurface;
}

export interface RichEditorModule extends RichRendererModule {
  actions?: ReactNode;
  editNodes?: Klass<LexicalNode>[];
  EditorProvider?: ComponentType<{ children: ReactNode }>;
  editRenderers?: Partial<RendererConfig>;
  nestedEditorPlugins?: ReactNode;
  plugins?: ReactNode;
  /** DOM/selection plugins installed in each editing surface instead of the document model. */
  surfacePlugins?: ReactNode;
}

export interface ComposeRendererOptions {
  blockAnchor?: BlockAnchorRenderer;
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
  as?: ElementType;
  className?: string;
  nested?: boolean;
  style?: CSSProperties;
  theme?: 'light' | 'dark';
  value: SerializedEditorState;
  variant?: RichEditorVariant;
  virtualization?: RendererVirtualization;
}
