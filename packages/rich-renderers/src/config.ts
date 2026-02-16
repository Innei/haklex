import type { RendererConfig } from '@shiro/rich-editor'
import { TabsRenderer } from '@shiro/rich-ext-tabs'
import { AlertRenderer } from '@shiro/rich-renderer-alert'
import { BannerRenderer } from '@shiro/rich-renderer-banner'
import { CodeBlockRenderer } from '@shiro/rich-renderer-codeblock'
import { GalleryRenderer } from '@shiro/rich-renderer-gallery'
import { ImageRenderer } from '@shiro/rich-renderer-image'
import { LinkCardRenderer } from '@shiro/rich-renderer-linkcard'
import { MentionRenderer } from '@shiro/rich-renderer-mention'
import { MermaidRenderer } from '@shiro/rich-renderer-mermaid'
import { VideoRenderer } from '@shiro/rich-renderer-video'

export const enhancedRendererConfig: RendererConfig = {
  Alert: AlertRenderer,
  Banner: BannerRenderer,
  CodeBlock: CodeBlockRenderer,
  Image: ImageRenderer,
  LinkCard: LinkCardRenderer,
  Mention: MentionRenderer,
  Gallery: GalleryRenderer,
  Mermaid: MermaidRenderer,
  Tabs: TabsRenderer,
  Video: VideoRenderer,
}
