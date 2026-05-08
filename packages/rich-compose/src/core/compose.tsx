import {
  NestedContentRendererProvider,
  type RendererConfig,
  type RichEditorVariant,
} from '@haklex/rich-editor';
import { RichRenderer } from '@haklex/rich-static-renderer';
import type { Klass, LexicalNode, SerializedEditorState } from 'lexical';
import { type ComponentType, Fragment, memo, type ReactNode, useCallback } from 'react';

import { dedupNodes, mergeModules } from './dedup';
import { wrapLazy } from './lazy';
import type { ComposeRendererOptions, RichRendererBaseProps, RichRendererModule } from './types';

function flattenNodes(modules: RichRendererModule[]): Klass<LexicalNode>[] {
  return dedupNodes(modules.flatMap((m) => m.nodes ?? []));
}

function mergeSyncRenderers(modules: RichRendererModule[]): Partial<RendererConfig> {
  const out: Partial<RendererConfig> = {};
  for (const m of modules) {
    if (!m.renderers) continue;
    Object.assign(out, m.renderers);
  }
  return out;
}

function composeProviders(modules: RichRendererModule[]): ComponentType<{ children: ReactNode }> {
  const providers = modules
    .map((m) => m.Provider)
    .filter((P): P is ComponentType<{ children: ReactNode }> => Boolean(P));
  if (providers.length === 0) {
    return Fragment as unknown as ComponentType<{ children: ReactNode }>;
  }
  const ComposedProviders: ComponentType<{ children: ReactNode }> = ({ children }) => {
    let acc: ReactNode = children;
    for (let i = providers.length - 1; i >= 0; i--) {
      const P = providers[i];
      acc = <P>{acc}</P>;
    }
    return <>{acc}</>;
  };
  ComposedProviders.displayName = 'ComposedProviders';
  return ComposedProviders;
}

export function composeRenderer(
  opts: ComposeRendererOptions,
): ComponentType<RichRendererBaseProps> {
  const merged = mergeModules(opts.preset, opts.modules);
  const allNodes = flattenNodes(merged);
  const syncMap = mergeSyncRenderers(merged);
  const lazyMap = wrapLazy(merged);
  // sync ⇽ lazy ⇽ overrides — overrides win, lazy beats sync on collision.
  const finalConfig: Partial<RendererConfig> = {
    ...syncMap,
    ...lazyMap,
    ...opts.overrides,
  };
  const ComposedProviders = composeProviders(merged);
  const builtinNodeOverrides = opts.builtinNodeOverrides;

  function ComposedRenderer(props: RichRendererBaseProps) {
    const { theme, variant } = props;
    const renderNested = useCallback(
      (value: SerializedEditorState, overrideVariant?: RichEditorVariant) => (
        <ComposedRenderer nested theme={theme} value={value} variant={overrideVariant ?? variant} />
      ),
      [theme, variant],
    );

    return (
      <NestedContentRendererProvider value={renderNested}>
        <ComposedProviders>
          <RichRenderer
            as={props.as}
            builtinNodeOverrides={builtinNodeOverrides}
            className={props.className}
            extraNodes={allNodes}
            nested={props.nested}
            rendererConfig={finalConfig}
            style={props.style}
            theme={theme}
            value={props.value}
            variant={variant}
          />
        </ComposedProviders>
      </NestedContentRendererProvider>
    );
  }

  return memo(ComposedRenderer);
}
