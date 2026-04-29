import type { ComponentType } from 'react';

import type { AlertRendererProps } from '../components/renderers/AlertRenderer';
import type { BannerRendererProps } from '../components/renderers/BannerRenderer';
import type { CodeBlockRendererProps } from '../components/renderers/CodeBlockRenderer';
import type { FootnoteRendererProps } from '../components/renderers/FootnoteRenderer';
import type { FootnoteSectionRendererProps } from '../components/renderers/FootnoteSectionRenderer';
import type { ImageRendererProps } from '../components/renderers/ImageRenderer';
import type { KaTeXRendererProps } from '../components/renderers/KaTeXRenderer';
import type { LinkCardRendererProps } from '../components/renderers/LinkCardRenderer';
import type { MentionRendererProps } from '../components/renderers/MentionRenderer';
import type { MermaidRendererProps } from '../components/renderers/MermaidRenderer';
import type { RubyRendererProps } from '../components/renderers/RubyRenderer';
import type { TagRendererProps } from '../components/renderers/TagRenderer';
import type { VideoRendererProps } from '../components/renderers/VideoRenderer';
import type { PollRendererProps } from './poll';

export interface CodeFile {
  code: string;
  filename: string;
  highlightLines?: number[];
  language?: string;
}

export interface CodeSnippetRendererProps {
  files: CodeFile[];
}

export interface GalleryImage {
  alt?: string;
  height?: number;
  src: string;
  thumbhash?: string;
  width?: number;
}

export interface GalleryRendererProps {
  images: GalleryImage[];
  layout: 'grid' | 'masonry' | 'carousel';
  onImagesChange?: (images: GalleryImage[]) => void;
  onLayoutChange?: (layout: 'grid' | 'masonry' | 'carousel') => void;
}

/**
 * Configuration for custom renderers.
 * Allows overriding default renderers with custom implementations.
 */
export interface RendererConfig {
  /** Custom renderer for alert/callout headers */
  Alert?: ComponentType<AlertRendererProps>;
  /** Custom renderer for banner blocks */
  Banner?: ComponentType<BannerRendererProps>;
  /** Custom renderer for code blocks with syntax highlighting */
  CodeBlock?: ComponentType<CodeBlockRendererProps>;
  /** Custom renderer for multi-file code snippets with tabs */
  CodeSnippet?: ComponentType<CodeSnippetRendererProps>;
  /** Custom renderer for footnote references */
  Footnote?: ComponentType<FootnoteRendererProps>;
  /** Custom renderer for footnote definition section */
  FootnoteSection?: ComponentType<FootnoteSectionRendererProps>;
  /** Custom renderer for image galleries */
  Gallery?: ComponentType<GalleryRendererProps>;
  /** Custom renderer for images with captions */
  Image?: ComponentType<ImageRendererProps>;
  /** Custom renderer for KaTeX mathematical expressions (inline and block) */
  KaTeX?: ComponentType<KaTeXRendererProps>;
  /** Custom renderer for link preview cards */
  LinkCard?: ComponentType<LinkCardRendererProps>;
  /** Custom renderer for social media mentions */
  Mention?: ComponentType<MentionRendererProps>;
  /** Custom renderer for Mermaid diagrams */
  Mermaid?: ComponentType<MermaidRendererProps>;
  /** Custom renderer for reader-facing vote/poll widgets */
  Poll?: ComponentType<PollRendererProps>;
  /** Custom renderer for ruby annotations */
  Ruby?: ComponentType<RubyRendererProps>;
  /** Custom renderer for inline tag badges */
  Tag?: ComponentType<TagRendererProps>;
  /** Custom renderer for video embeds */
  Video?: ComponentType<VideoRendererProps>;
}
