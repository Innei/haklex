import type { RendererConfig } from '@haklex/rich-editor'
import {
  codeSnippetNodes,
  embedNodes,
  enhancedRendererConfig,
  ExcalidrawNode,
  galleryNodes,
} from '@haklex/rich-renderers'
import type { RichRendererProps } from '@haklex/rich-static-renderer'
import { RichRenderer } from '@haklex/rich-static-renderer'
import type { Klass, LexicalNode } from 'lexical'
import { useMemo } from 'react'

const defaultExtraNodes = [
  ExcalidrawNode,
  ...embedNodes,
  ...galleryNodes,
  ...codeSnippetNodes,
]

export interface ShiroRendererProps extends Omit<
  RichRendererProps,
  'rendererConfig' | 'extraNodes'
> {
  extraNodes?: Array<Klass<LexicalNode>>
  rendererConfig?: Partial<RendererConfig>
}

export function ShiroRenderer({
  extraNodes,
  rendererConfig,
  ...props
}: ShiroRendererProps) {
  const mergedNodes = useMemo(
    () =>
      extraNodes ? [...defaultExtraNodes, ...extraNodes] : defaultExtraNodes,
    [extraNodes],
  )

  const mergedConfig = useMemo(
    () =>
      rendererConfig
        ? { ...enhancedRendererConfig, ...rendererConfig }
        : enhancedRendererConfig,
    [rendererConfig],
  )

  return (
    <RichRenderer
      {...props}
      extraNodes={mergedNodes}
      rendererConfig={mergedConfig}
    />
  )
}
