import type { ComponentType } from 'react'

import type { AlertRendererProps } from '../components/renderers/AlertRenderer'
import type { CodeBlockRendererProps } from '../components/renderers/CodeBlockRenderer'
import type { FootnoteRendererProps } from '../components/renderers/FootnoteRenderer'
import type { GalleryRendererProps } from '../components/renderers/GalleryRenderer'
import type { ImageRendererProps } from '../components/renderers/ImageRenderer'
import type { KaTeXRendererProps } from '../components/renderers/KaTeXRenderer'
import type { LinkCardRendererProps } from '../components/renderers/LinkCardRenderer'
import type { MentionRendererProps } from '../components/renderers/MentionRenderer'
import type { MermaidRendererProps } from '../components/renderers/MermaidRenderer'
import type { TabsRendererProps } from '../components/renderers/TabsRenderer'
import type { VideoRendererProps } from '../components/renderers/VideoRenderer'

/**
 * Configuration for custom renderers.
 * Allows overriding default renderers with custom implementations.
 */
export interface RendererConfig {
  /** Custom renderer for alert/callout headers */
  Alert?: ComponentType<AlertRendererProps>
  /** Custom renderer for code blocks with syntax highlighting */
  CodeBlock?: ComponentType<CodeBlockRendererProps>
  /** Custom renderer for footnote references */
  Footnote?: ComponentType<FootnoteRendererProps>
  /** Custom renderer for image galleries */
  Gallery?: ComponentType<GalleryRendererProps>
  /** Custom renderer for images with captions */
  Image?: ComponentType<ImageRendererProps>
  /** Custom renderer for KaTeX mathematical expressions (inline and block) */
  KaTeX?: ComponentType<KaTeXRendererProps>
  /** Custom renderer for link preview cards */
  LinkCard?: ComponentType<LinkCardRendererProps>
  /** Custom renderer for Mermaid diagrams */
  Mermaid?: ComponentType<MermaidRendererProps>
  /** Custom renderer for social media mentions */
  Mention?: ComponentType<MentionRendererProps>
  /** Custom renderer for tabbed content */
  Tabs?: ComponentType<TabsRendererProps>
  /** Custom renderer for video embeds */
  Video?: ComponentType<VideoRendererProps>
}
