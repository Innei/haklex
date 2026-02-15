import type { ComponentType, ReactElement } from 'react'
import { createElement } from 'react'

import { useRendererConfig } from '../context/RendererConfigContext'
import type { RendererConfig } from '../types/renderer-config'

export type RendererKey = keyof RendererConfig

type RendererPropsByKey = {
  [K in RendererKey]-?: NonNullable<RendererConfig[K]> extends ComponentType<
    infer P extends object
  >
    ? P
    : never
}

type RendererComponentByKey = {
  [K in RendererKey]-?: NonNullable<
    RendererConfig[K]
  > extends ComponentType<any>
    ? NonNullable<RendererConfig[K]>
    : never
}

export type RendererWrapperProps = {
  [K in RendererKey]-?: {
    /** Name of the renderer in RendererConfig */
    rendererKey: K
    /** Default renderer component */
    defaultRenderer: RendererComponentByKey[K]
    /** Props to pass to the renderer */
    props: RendererPropsByKey[K]
  }
}[RendererKey]

/**
 * Wrapper component that allows overriding default renderers with custom ones.
 * Uses RendererConfig from context to determine which renderer to use.
 */
export function RendererWrapper({
  rendererKey,
  defaultRenderer: DefaultRenderer,
  props,
}: RendererWrapperProps) {
  const config = useRendererConfig()
  const CustomRenderer = config?.[rendererKey] as ComponentType<any> | undefined

  const Renderer = CustomRenderer || DefaultRenderer

   
  return <Renderer {...(props as any)} />
}

/**
 * Type-safe helper for creating RendererWrapper elements from .ts node files.
 * Avoids the createElement + discriminated-union typing limitation.
 */
export function createRendererDecoration<K extends RendererKey>(
  rendererKey: K,
  defaultRenderer: RendererComponentByKey[K],
  props: RendererPropsByKey[K],
): ReactElement {
  return createElement(RendererWrapper, {
    rendererKey,
    defaultRenderer,
    props,
  } as RendererWrapperProps)
}
