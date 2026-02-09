import type { ComponentType } from 'react'

import { useRendererConfig } from '../context/RendererConfigContext'
import type { RendererConfig } from '../types/renderer-config'

interface RendererWrapperProps<
  K extends keyof RendererConfig,
  P extends object,
> {
  /** Name of the renderer in RendererConfig */
  rendererKey: K
  /** Default renderer component */
  defaultRenderer: ComponentType<P>
  /** Props to pass to the renderer */
  props: P
}

/**
 * Wrapper component that allows overriding default renderers with custom ones.
 * Uses RendererConfig from context to determine which renderer to use.
 */
export function RendererWrapper<
  K extends keyof RendererConfig,
  P extends object,
>({
  rendererKey,
  defaultRenderer: DefaultRenderer,
  props,
}: RendererWrapperProps<K, P>) {
  const config = useRendererConfig()
  const CustomRenderer = config?.[rendererKey] as ComponentType<P> | undefined

  const Renderer = CustomRenderer || DefaultRenderer

  return <Renderer {...props} />
}
