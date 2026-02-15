import type { Klass, LexicalNode } from 'lexical'

import { builtinNodes } from './config'
import { AlertQuoteEditNode } from './nodes/AlertQuoteEditNode'
import { BannerNode } from './nodes/BannerNode'
import { CodeBlockEditNode } from './nodes/CodeBlockEditNode'
import { ComponentNode } from './nodes/ComponentNode'
import { DetailsNode } from './nodes/DetailsNode'
import { FootnoteNode } from './nodes/FootnoteNode'
import { GalleryNode } from './nodes/GalleryNode'
import { GridContainerNode } from './nodes/GridContainerNode'
import { ImageNode } from './nodes/ImageNode'
import { KaTeXBlockEditNode } from './nodes/KaTeXBlockEditNode'
import { KaTeXInlineEditNode } from './nodes/KaTeXInlineEditNode'
import { LinkCardEditNode } from './nodes/LinkCardEditNode'
import { MentionNode } from './nodes/MentionNode'
import { MermaidNode } from './nodes/MermaidNode'
import { SpoilerNode } from './nodes/SpoilerNode'
import { TabsNode } from './nodes/TabsNode'
import { TaskListItemNode } from './nodes/TaskListItemNode'
import { VideoNode } from './nodes/VideoNode'

export const customEditNodes: Array<Klass<LexicalNode>> = [
  SpoilerNode,
  MentionNode,
  KaTeXInlineEditNode,
  KaTeXBlockEditNode,
  ImageNode,
  AlertQuoteEditNode,
  CodeBlockEditNode,
  FootnoteNode,
  TaskListItemNode,
  VideoNode,
  LinkCardEditNode,
  TabsNode,
  DetailsNode,
  GalleryNode,
  GridContainerNode,
  BannerNode,
  MermaidNode,
  ComponentNode,
]

export const allEditNodes: Array<Klass<LexicalNode>> = [
  ...builtinNodes,
  ...customEditNodes,
]
