import type { RendererConfig } from '@haklex/rich-editor'
import { CodeSnippetRenderer } from '@haklex/rich-ext-code-snippet'
import { GalleryRenderer } from '@haklex/rich-ext-gallery'
import { AlertRenderer } from '@haklex/rich-renderer-alert'
import { BannerRenderer } from '@haklex/rich-renderer-banner'
import { CodeBlockRenderer } from '@haklex/rich-renderer-codeblock'
import { ImageRenderer } from '@haklex/rich-renderer-image'
import { LinkCardRenderer } from '@haklex/rich-renderer-linkcard'
import { MentionRenderer } from '@haklex/rich-renderer-mention'
import { MermaidRenderer } from '@haklex/rich-renderer-mermaid'
import { VideoRenderer } from '@haklex/rich-renderer-video'

export const enhancedRendererConfig: RendererConfig = {
  Alert: AlertRenderer,
  Banner: BannerRenderer,
  CodeBlock: CodeBlockRenderer,
  Image: ImageRenderer,
  LinkCard: LinkCardRenderer,
  Mention: MentionRenderer,
  Gallery: GalleryRenderer,
  Mermaid: MermaidRenderer,
  Video: VideoRenderer,
  CodeSnippet: CodeSnippetRenderer,
}
