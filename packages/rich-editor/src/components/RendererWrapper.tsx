import type { ComponentType, ReactElement } from 'react';
import { createElement } from 'react';

import { useRendererConfig } from '../context/RendererConfigContext';
import type { RendererConfig } from '../types/renderer-config';

export type RendererKey = keyof RendererConfig;

type RendererPropsByKey = {
  [K in RendererKey]-?: NonNullable<RendererConfig[K]> extends ComponentType<infer P extends object>
    ? P
    : never;
};

type RendererComponentByKey = {
  [K in RendererKey]-?: NonNullable<RendererConfig[K]> extends ComponentType<any>
    ? NonNullable<RendererConfig[K]>
    : never;
};

export type RendererWrapperProps = {
  [K in RendererKey]-?: {
    /** Name of the renderer in RendererConfig */
    rendererKey: K;
    /**
     * Default renderer component. Optional — when omitted, the slot resolves
     * via RendererConfig context only. If neither override nor default exists
     * the wrapper renders `null`. Omit it from extension nodes that want the
     * heavy default renderer to remain tree-shakable.
     */
    defaultRenderer?: RendererComponentByKey[K];
    /** Props to pass to the renderer */
    props: RendererPropsByKey[K];
  };
}[RendererKey];

/**
 * Wrapper component that allows overriding default renderers with custom ones.
 * Uses RendererConfig from context to determine which renderer to use.
 */
export function RendererWrapper({ rendererKey, defaultRenderer, props }: RendererWrapperProps) {
  const config = useRendererConfig();
  const Renderer: ComponentType<any> | undefined = config?.[rendererKey] ?? defaultRenderer;

  if (!Renderer) return null;

  return <Renderer {...props} />;
}

/**
 * Type-safe helper for creating RendererWrapper elements from .ts node files.
 * Avoids the createElement + discriminated-union typing limitation.
 *
 * `defaultRenderer` is optional. Pass `undefined` from extension node classes
 * that should not statically import their renderer; the heavy default lives
 * in a separate sub-path and is registered into RendererConfig at compose
 * time, keeping the node bundle light.
 */
export function createRendererDecoration<K extends RendererKey>(
  rendererKey: K,
  defaultRenderer: RendererComponentByKey[K] | undefined,
  props: RendererPropsByKey[K],
): ReactElement {
  return createElement(RendererWrapper, {
    rendererKey,
    defaultRenderer,
    props,
  } as RendererWrapperProps);
}
