import { CodeNode } from '@lexical/code-core';
import { HorizontalRuleNode } from '@lexical/extension';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import type { Klass, LexicalNode, LexicalNodeReplacement } from 'lexical';

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
