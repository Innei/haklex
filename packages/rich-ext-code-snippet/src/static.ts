import type { Klass, LexicalNode } from 'lexical'

import { CodeSnippetNode } from './nodes/CodeSnippetNode'

export { CodeSnippetRenderer } from './CodeSnippetRenderer'
export type { SerializedCodeSnippetNode } from './nodes/CodeSnippetNode'
export {
  $createCodeSnippetNode,
  $isCodeSnippetNode,
  CodeSnippetNode,
} from './nodes/CodeSnippetNode'
export { CODE_SNIPPET_BLOCK_TRANSFORMER } from './transformer'

export const codeSnippetNodes: Array<Klass<LexicalNode>> = [CodeSnippetNode]
