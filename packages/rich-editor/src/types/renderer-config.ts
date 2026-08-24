import type { ComponentType } from 'react';

import type { AlertRendererProps } from '../components/renderers/AlertRenderer';
import type { BannerRendererProps } from '../components/renderers/BannerRenderer';
import type { CodeBlockRendererProps } from '../components/renderers/CodeBlockRenderer';
import type { FileRendererProps } from '../components/renderers/FileRenderer';
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

/**
 * Configuration for custom renderers.
 *
 * Built-in slots live below. Extension packages and downstream apps add their
 * own slots via TypeScript module augmentation:
 *
 * ```ts
 * import type { ComponentType } from 'react'
 * import type { MyChartProps } from './MyChart'
 *
 * // Force the augmentation target to resolve as an external module.
 * import type {} from '@haklex/rich-editor'
 *
 * declare module '@haklex/rich-editor' {
 *   interface RendererConfig {
 *     MyChart?: ComponentType<MyChartProps>
 *   }
 * }
 *
 * export {}
 * ```
 *
 * Conventions:
 * - Keep slots optional (`?`) — wrappers fall back to `null` when neither an
 *   override nor a default is provided.
 * - Keep prop types stable; renaming a slot's props is a breaking change for
 *   every override module already in the wild.
 * - Re-export the augmentation file as a side-effect from every public entry
 *   (`/node`, `/renderer`, `/edit`, `/static`, `/index`) so consumers see the
 *   slot regardless of which sub-path they import.
 */
export interface RendererConfig {
  /** Custom renderer for alert/callout headers */
  Alert?: ComponentType<AlertRendererProps>;
  /** Custom renderer for banner blocks */
  Banner?: ComponentType<BannerRendererProps>;
  /** Custom renderer for code blocks with syntax highlighting */
  CodeBlock?: ComponentType<CodeBlockRendererProps>;
  /** Custom renderer for file attachments */
  File?: ComponentType<FileRendererProps>;
  /** Custom renderer for footnote references */
  Footnote?: ComponentType<FootnoteRendererProps>;
  /** Custom renderer for footnote definition section */
  FootnoteSection?: ComponentType<FootnoteSectionRendererProps>;
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
  /** Custom renderer for ruby annotations */
  Ruby?: ComponentType<RubyRendererProps>;
  /** Custom renderer for inline tag badges */
  Tag?: ComponentType<TagRendererProps>;
  /** Custom renderer for video embeds */
  Video?: ComponentType<VideoRendererProps>;
}
