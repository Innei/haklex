import type { Klass, LexicalNode } from 'lexical'

import { builtinNodes } from './config'
import { AlertQuoteEditNode } from './nodes/AlertQuoteEditNode'
import { BannerEditNode } from './nodes/BannerEditNode'
import { CodeBlockEditNode } from './nodes/CodeBlockEditNode'
import { DetailsNode } from './nodes/DetailsNode'
import { FootnoteNode } from './nodes/FootnoteNode'
import { GridEditNode } from './nodes/GridEditNode'
import { ImageNode } from './nodes/ImageNode'
import { KaTeXBlockNode } from './nodes/KaTeXBlockNode'
import { KaTeXInlineNode } from './nodes/KaTeXInlineNode'
import { LinkCardNode } from './nodes/LinkCardNode'
import { MentionNode } from './nodes/MentionNode'
import { MermaidNode } from './nodes/MermaidNode'
import { SpoilerNode } from './nodes/SpoilerNode'
import { TaskListItemNode } from './nodes/TaskListItemNode'
import { VideoNode } from './nodes/VideoNode'

export const customEditNodes: Array<Klass<LexicalNode>> = [
  SpoilerNode,
  MentionNode,
  KaTeXInlineNode,
  KaTeXBlockNode,
  ImageNode,
  AlertQuoteEditNode,
  CodeBlockEditNode,
  FootnoteNode,
  TaskListItemNode,
  VideoNode,
  LinkCardNode,
  DetailsNode,
  GridEditNode,
  BannerEditNode,
  MermaidNode,
]

export const allEditNodes: Array<Klass<LexicalNode>> = [
  ...builtinNodes,
  ...customEditNodes,
]
