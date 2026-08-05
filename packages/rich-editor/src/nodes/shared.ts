import { CodeNode } from '@lexical/code-core';
import { HorizontalRuleNode } from '@lexical/extension';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import type { Klass, LexicalEditor, LexicalNode, LexicalNodeReplacement } from 'lexical';
import { $getEditor, createEditor } from 'lexical';

import { editorTheme } from '../styles/theme';
import { FootnoteNode } from './FootnoteNode';
import { KaTeXInlineNode } from './KaTeXInlineNode';
import { MentionNode } from './MentionNode';
import { RichQuoteNode } from './RichQuoteNode';
import { SpoilerNode } from './SpoilerNode';
import { TagNode } from './TagNode';

export const NESTED_EDITOR_NODES: Array<Klass<LexicalNode> | LexicalNodeReplacement> = [
  HeadingNode,
  QuoteNode,
  RichQuoteNode,
  { replace: QuoteNode, with: () => new RichQuoteNode() },
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  HorizontalRuleNode,
  CodeNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  SpoilerNode,
  MentionNode,
  FootnoteNode,
  KaTeXInlineNode,
  TagNode,
];

function $tryGetEditor(): LexicalEditor | null {
  try {
    return $getEditor();
  } catch {
    return null;
  }
}

export function createNestedEditor(fallbackNamespace: string): LexicalEditor {
  // no-arg createEditor() inherits the active editor's node registry and parent link
  if ($tryGetEditor()) return createEditor();
  return createEditor({
    namespace: fallbackNamespace,
    nodes: NESTED_EDITOR_NODES,
    theme: editorTheme,
    onError: (error: Error) => console.error(`[${fallbackNamespace}]`, error),
  });
}
