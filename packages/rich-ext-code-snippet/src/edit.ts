import './styles.css';

import type { Klass, LexicalNode } from 'lexical';

import { CodeSnippetEditNode } from './nodes/CodeSnippetEditNode';

export * from './augment';
export type { CodeSnippetEditRendererProps } from './CodeSnippetEditRenderer';
export { CodeSnippetEditRenderer } from './CodeSnippetEditRenderer';
export {
  $createCodeSnippetEditNode,
  $isCodeSnippetEditNode,
  CodeSnippetEditNode,
} from './nodes/CodeSnippetEditNode';

export const codeSnippetEditNodes: Array<Klass<LexicalNode>> = [CodeSnippetEditNode];
