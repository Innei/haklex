import { ALL_TRANSFORMERS } from '@haklex/rich-editor'
import { CODE_SNIPPET_BLOCK_TRANSFORMER } from '@haklex/rich-ext-code-snippet'
import { EXCALIDRAW_BLOCK_TRANSFORMER } from '@haklex/rich-ext-excalidraw'

type MarkdownTransformer = (typeof ALL_TRANSFORMERS)[number]

export const SHIRO_EXT_MARKDOWN_TRANSFORMERS: MarkdownTransformer[] = [
  CODE_SNIPPET_BLOCK_TRANSFORMER,
  EXCALIDRAW_BLOCK_TRANSFORMER,
]

export const SHIRO_MARKDOWN_TRANSFORMERS: MarkdownTransformer[] = [
  ...ALL_TRANSFORMERS,
  ...SHIRO_EXT_MARKDOWN_TRANSFORMERS,
]

export function buildShiroMarkdownTransformers(
  extra: MarkdownTransformer[] = [],
): MarkdownTransformer[] {
  return [...SHIRO_MARKDOWN_TRANSFORMERS, ...extra]
}
