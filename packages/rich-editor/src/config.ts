import { CodeNode } from '@lexical/code-core';
import { HorizontalRuleNode } from '@lexical/extension';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import type { Klass, LexicalNode, LexicalNodeReplacement } from 'lexical';

import { AlertQuoteNode } from './nodes/AlertQuoteNode';
import { BannerNode } from './nodes/BannerNode';
import { CodeBlockNode } from './nodes/CodeBlockNode';
import { CommentNode } from './nodes/CommentNode';
import { DetailsNode } from './nodes/DetailsNode';
import { FileNode } from './nodes/FileNode';
import { FootnoteNode } from './nodes/FootnoteNode';
import { FootnoteSectionNode } from './nodes/FootnoteSectionNode';
import { GridContainerNode } from './nodes/GridContainerNode';
import { ImageNode } from './nodes/ImageNode';
import { KaTeXBlockNode } from './nodes/KaTeXBlockNode';
import { KaTeXInlineNode } from './nodes/KaTeXInlineNode';
import { LinkCardNode } from './nodes/LinkCardNode';
import { MentionNode } from './nodes/MentionNode';
import { MermaidNode } from './nodes/MermaidNode';
import { RichQuoteNode } from './nodes/RichQuoteNode';
import { RubyNode } from './nodes/RubyNode';
import { SpoilerNode } from './nodes/SpoilerNode';
import { TagNode } from './nodes/TagNode';
import { VideoNode } from './nodes/VideoNode';

export const builtinNodes: Array<Klass<LexicalNode> | LexicalNodeReplacement> = [
  HeadingNode,
  QuoteNode,
  RichQuoteNode,
  { replace: QuoteNode, with: () => new RichQuoteNode() },
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  HorizontalRuleNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  CodeNode,
];

export const customNodes: Array<Klass<LexicalNode> | LexicalNodeReplacement> = [
  SpoilerNode,
  MentionNode,
  KaTeXInlineNode,
  KaTeXBlockNode,
  ImageNode,
  AlertQuoteNode,
  CodeBlockNode,
  FootnoteNode,
  FootnoteSectionNode,
  VideoNode,
  FileNode,
  LinkCardNode,
  CommentNode,
  DetailsNode,
  GridContainerNode,
  BannerNode,
  MermaidNode,
  RubyNode,
  TagNode,
];

export const allNodes: Array<Klass<LexicalNode> | LexicalNodeReplacement> = [
  ...builtinNodes,
  ...customNodes,
];
