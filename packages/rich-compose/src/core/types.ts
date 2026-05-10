import type { RendererConfig, RichEditorVariant } from '@haklex/rich-editor';
import type { Klass, LexicalNode, SerializedEditorState } from 'lexical';
import type { ComponentType, CSSProperties, ReactNode } from 'react';

import type { BuiltinNodeRenderer } from '../static-renderer/types';

export type RendererKey = keyof RendererConfig;

export interface RichRendererModule {
  /**
   * Lazy renderers. Each loader returns the renderer component as default
   * export. composeRenderer wraps each in `React.lazy` (factory created
   * once at compose time) + `<Suspense fallback={ssrFallback?.[type]}>`.
   */
  lazyRenderers?: Partial<{
    [K in RendererKey]: () => Promise<{ default: NonNullable<RendererConfig[K]> }>;
  }>;

  /** Stable identifier; used for dedup, debug logs, and Provider DevTools naming. */
  name: string;

  /**
   * Lexical node classes. Always synchronous. Optional — modules that only
   * override renderers for Lexical builtin types omit this field.
   * composeRenderer treats missing `nodes` as `[]`.
   */
  nodes?: Klass<LexicalNode>[];

  /**
   * Optional context provider. composeRenderer stacks Providers in module
   * order outside `<RichRenderer>`. Module Providers are for internal
   * plumbing only — do not redeclare `NestedContentRendererProvider`,
   * composeRenderer manages it.
   */
  Provider?: ComponentType<{ children: ReactNode }>;

  /** type → Component map. Sync renderers. */
  renderers?: Partial<RendererConfig>;

  /**
   * SSR / Suspense fallback. Must be deterministic — no Date.now, no random,
   * no client-only API access. Renders identically server-side and during
   * client hydration.
   */
  ssrFallback?: Partial<Record<RendererKey, ReactNode>>;
}

export interface ComposeRendererOptions {
  /** Pass-through to `<RichRenderer>` for `paragraph` / `link` / `autolink` etc. */
  builtinNodeOverrides?: Record<string, BuiltinNodeRenderer>;
  /** Appended to preset; later modules override earlier on `name` collision. */
  modules?: RichRendererModule[];
  /** Final renderer overrides; takes precedence over module-supplied renderers. */
  overrides?: Partial<RendererConfig>;
  /** Starting set; can be `shiroPreset`, custom array, or omitted. */
  preset?: RichRendererModule[];
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
