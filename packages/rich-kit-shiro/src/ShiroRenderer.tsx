import type { RichRendererProps } from '@haklex/rich-editor'
import { RichRenderer } from '@haklex/rich-editor'
import {
  codeSnippetNodes,
  embedNodes,
  enhancedRendererConfig,
  galleryNodes,
  TldrawNode,
} from '@haklex/rich-renderers'
import type { Klass, LexicalNode } from 'lexical'
import { useMemo } from 'react'

const defaultExtraNodes = [
  TldrawNode,
  ...embedNodes,
  ...galleryNodes,
  ...codeSnippetNodes,
]

export interface ShiroRendererProps extends Omit<
  RichRendererProps,
  'rendererConfig' | 'extraNodes'
> {
  extraNodes?: Array<Klass<LexicalNode>>
}

export function ShiroRenderer({ extraNodes, ...props }: ShiroRendererProps) {
  const mergedNodes = useMemo(
    () =>
      extraNodes ? [...defaultExtraNodes, ...extraNodes] : defaultExtraNodes,
    [extraNodes],
  )

  return (
    <RichRenderer
      {...props}
      extraNodes={mergedNodes}
      rendererConfig={enhancedRendererConfig}
    />
  )
}
