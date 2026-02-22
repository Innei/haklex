import type { LexicalNode } from 'lexical'

import {
  $isCodeSnippetNode,
  CodeSnippetNode,
  type SerializedCodeSnippetNode,
} from './nodes/CodeSnippetNode'

const NEVER_MATCH = /a^/

function quoteAttr(value: string): string {
  return value.replaceAll('"', '\\"')
}

function pickFence(content: string): string {
  const matches = content.match(/`+/g)
  const maxLen =
    matches?.reduce((max, run) => Math.max(max, run.length), 0) ?? 0
  return '`'.repeat(Math.max(3, maxLen + 1))
}

export const CODE_SNIPPET_BLOCK_TRANSFORMER = {
  dependencies: [CodeSnippetNode],
  export: (node: LexicalNode) => {
    if (!$isCodeSnippetNode(node)) return null
    const snippet = node.exportJSON() as SerializedCodeSnippetNode

    const body = snippet.files
      .map((file) => {
        const fence = pickFence(file.code || '')
        const lang = file.language || ''
        const filename = quoteAttr(file.filename || 'untitled')
        return [
          `::: file{name="${filename}" lang="${lang}"}`,
          `${fence}${lang}`,
          file.code || '',
          fence,
          ':::',
        ].join('\n')
      })
      .join('\n')

    return `::: code-snippet\n${body}\n:::`
  },
  regExp: NEVER_MATCH,
  replace: () => {},
  type: 'element' as const,
}
