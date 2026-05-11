import {
  NestedContentRendererProvider,
  type RendererConfig,
  RichEditor,
  type RichEditorProps,
  type RichEditorVariant,
} from '@haklex/rich-editor';
import type { Klass, LexicalNode, SerializedEditorState } from 'lexical';
import { type ComponentType, Fragment, memo, type ReactNode, useCallback, useMemo } from 'react';

import { composeRenderer } from './compose';
import { dedupNodes, mergeModules } from './dedup';
import { wrapLazy } from './lazy';
import type { ComposeEditorOptions, RichEditorModule } from './types';

function mergeSyncRenderers(modules: RichEditorModule[]): Partial<RendererConfig> {
  const out: Partial<RendererConfig> = {};
  for (const m of modules) {
    if (m.renderers) Object.assign(out, m.renderers);
  }
  return out;
}

function mergeEditRenderers(modules: RichEditorModule[]): Partial<RendererConfig> {
  const out: Partial<RendererConfig> = {};
  for (const m of modules) {
    if (m.editRenderers) Object.assign(out, m.editRenderers);
  }
  return out;
}

function composeProviders(
  modules: RichEditorModule[],
  key: 'Provider' | 'EditorProvider',
): ComponentType<{ children: ReactNode }> {
  const providers = modules
    .map((m) => m[key])
    .filter((P): P is ComponentType<{ children: ReactNode }> => Boolean(P));
  if (providers.length === 0) {
    return Fragment as unknown as ComponentType<{ children: ReactNode }>;
  }
  const Composed: ComponentType<{ children: ReactNode }> = ({ children }) => {
    let acc: ReactNode = children;
    for (let i = providers.length - 1; i >= 0; i--) {
      const P = providers[i];
      acc = <P>{acc}</P>;
    }
    return <>{acc}</>;
  };
  Composed.displayName = key === 'Provider' ? 'ComposedProviders' : 'ComposedEditorProviders';
  return Composed;
}

export function composeEditor(opts: ComposeEditorOptions): ComponentType<RichEditorProps> {
  const merged = mergeModules(opts.preset, opts.modules);
  const baseNodes = merged.flatMap((m) => m.nodes ?? []);
  const editNodes = merged.flatMap((m) => m.editNodes ?? []);
  const allNodes = dedupNodes([...baseNodes, ...editNodes]);

  const syncR = mergeSyncRenderers(merged);
  const lazyR = wrapLazy(merged);
  const editR = mergeEditRenderers(merged);
  const finalConfig: Partial<RendererConfig> = {
    ...syncR,
    ...lazyR,
    ...editR,
    ...opts.overrides,
  };

  const ComposedProviders = composeProviders(merged, 'Provider');
  const ComposedEditorProviders = composeProviders(merged, 'EditorProvider');

  const modulePlugins: ReactNode[] = [];
  const moduleActions: ReactNode[] = [];
  for (const m of merged) {
    if (m.plugins) modulePlugins.push(<Fragment key={`p:${m.name}`}>{m.plugins}</Fragment>);
    if (m.actions) moduleActions.push(<Fragment key={`a:${m.name}`}>{m.actions}</Fragment>);
  }

  const NestedRenderer = composeRenderer({
    preset: opts.preset,
    modules: opts.modules,
    overrides: opts.overrides,
  });

  function ComposedEditor(props: RichEditorProps) {
    const { extraNodes: userExtraNodes, actions, children, theme, variant, ...rest } = props;

    const mergedExtraNodes: Klass<LexicalNode>[] = useMemo(
      () => (userExtraNodes ? dedupNodes([...allNodes, ...userExtraNodes]) : allNodes),
      [userExtraNodes],
    );

    const renderNested = useCallback(
      (value: SerializedEditorState, overrideVariant?: RichEditorVariant) => (
        <NestedRenderer nested theme={theme} value={value} variant={overrideVariant ?? variant} />
      ),
      [theme, variant],
    );

    return (
      <NestedContentRendererProvider value={renderNested}>
        <ComposedProviders>
          <ComposedEditorProviders>
            <RichEditor
              {...rest}
              extraNodes={mergedExtraNodes}
              rendererConfig={finalConfig}
              theme={theme}
              variant={variant}
              actions={
                <>
                  {moduleActions}
                  {actions}
                </>
              }
            >
              {modulePlugins}
              {children}
            </RichEditor>
          </ComposedEditorProviders>
        </ComposedProviders>
      </NestedContentRendererProvider>
    );
  }

  ComposedEditor.displayName = 'ComposedEditor';
  return memo(ComposedEditor);
}
