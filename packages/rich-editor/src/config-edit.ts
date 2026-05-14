import type { Klass, LexicalNode, LexicalNodeReplacement } from 'lexical';

import { builtinNodes } from './config';
import { AlertQuoteEditNode } from './nodes/AlertQuoteEditNode';
import { BannerEditNode } from './nodes/BannerEditNode';
import { CodeBlockEditNode } from './nodes/CodeBlockEditNode';
import { CommentNode } from './nodes/CommentNode';
import { DetailsNode } from './nodes/DetailsNode';
import { FootnoteNode } from './nodes/FootnoteNode';
import { FootnoteSectionEditNode } from './nodes/FootnoteSectionEditNode';
import { GridEditNode } from './nodes/GridEditNode';
import { ImageNode } from './nodes/ImageNode';
import { KaTeXBlockNode } from './nodes/KaTeXBlockNode';
import { KaTeXInlineNode } from './nodes/KaTeXInlineNode';
import { LinkCardNode } from './nodes/LinkCardNode';
import { MentionNode } from './nodes/MentionNode';
import { MermaidNode } from './nodes/MermaidNode';
import { RubyNode } from './nodes/RubyNode';
import { SpoilerNode } from './nodes/SpoilerNode';
import { TagNode } from './nodes/TagNode';
import { VideoNode } from './nodes/VideoNode';

export const customEditNodes: Array<Klass<LexicalNode> | LexicalNodeReplacement> = [
  SpoilerNode,
  MentionNode,
  KaTeXInlineNode,
  KaTeXBlockNode,
  ImageNode,
  AlertQuoteEditNode,
  CodeBlockEditNode,
  FootnoteNode,
  FootnoteSectionEditNode,
  VideoNode,
  LinkCardNode,
  CommentNode,
  DetailsNode,
  GridEditNode,
  BannerEditNode,
  MermaidNode,
  RubyNode,
  TagNode,
];

export const allEditNodes: Array<Klass<LexicalNode> | LexicalNodeReplacement> = [
  ...builtinNodes,
  ...customEditNodes,
];
