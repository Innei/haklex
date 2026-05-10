import './augment';

import type { Klass, LexicalNode } from 'lexical';

import { CodeSnippetNode } from './nodes/CodeSnippetNode';

export type { SerializedCodeSnippetNode } from './nodes/CodeSnippetNode';
export {
  $createCodeSnippetNode,
  $isCodeSnippetNode,
  CodeSnippetNode,
} from './nodes/CodeSnippetNode';
export { CODE_SNIPPET_NODE_KEY } from './slot';
export { CODE_SNIPPET_BLOCK_TRANSFORMER } from './transformer';
export type { CodeFile, CodeSnippetRendererProps } from './types';

export const codeSnippetNodes: Array<Klass<LexicalNode>> = [CodeSnippetNode];
