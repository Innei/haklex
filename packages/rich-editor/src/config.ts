import { CodeNode } from '@lexical/code'
import { HorizontalRuleNode } from '@lexical/extension'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import type { Klass, LexicalNode } from 'lexical'

import { AlertQuoteNode } from './nodes/AlertQuoteNode'
import { BannerNode } from './nodes/BannerNode'
import { CodeBlockNode } from './nodes/CodeBlockNode'
import { ComponentNode } from './nodes/ComponentNode'
import { DetailsNode } from './nodes/DetailsNode'
import { FootnoteNode } from './nodes/FootnoteNode'
import { GalleryNode } from './nodes/GalleryNode'
import { GridContainerNode } from './nodes/GridContainerNode'
import { ImageNode } from './nodes/ImageNode'
import { KaTeXBlockNode } from './nodes/KaTeXBlockNode'
import { KaTeXInlineNode } from './nodes/KaTeXInlineNode'
import { LinkCardNode } from './nodes/LinkCardNode'
import { MentionNode } from './nodes/MentionNode'
import { MermaidNode } from './nodes/MermaidNode'
import { SpoilerNode } from './nodes/SpoilerNode'
import { TabsNode } from './nodes/TabsNode'
import { TaskListItemNode } from './nodes/TaskListItemNode'
import { VideoNode } from './nodes/VideoNode'

export const builtinNodes: Array<Klass<LexicalNode>> = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  HorizontalRuleNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  CodeNode,
]

export const customNodes: Array<Klass<LexicalNode>> = [
  SpoilerNode,
  MentionNode,
  KaTeXInlineNode,
  KaTeXBlockNode,
  ImageNode,
  AlertQuoteNode,
  CodeBlockNode,
  FootnoteNode,
  TaskListItemNode,
  VideoNode,
  LinkCardNode,
  TabsNode,
  DetailsNode,
  GalleryNode,
  GridContainerNode,
  BannerNode,
  MermaidNode,
  ComponentNode,
]

export const allNodes: Array<Klass<LexicalNode>> = [
  ...builtinNodes,
  ...customNodes,
]
