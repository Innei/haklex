import type { RendererConfig } from '@haklex/rich-editor';
import { ChatRenderer } from '@haklex/rich-ext-chat/static';
import { CodeSnippetRenderer } from '@haklex/rich-ext-code-snippet/static';
import { GalleryRenderer } from '@haklex/rich-ext-gallery/static';
import { AlertRenderer } from '@haklex/rich-renderer-alert/static';
import { BannerRenderer } from '@haklex/rich-renderer-banner/static';
import { CodeBlockRenderer } from '@haklex/rich-renderer-codeblock/static';
import { ImageRenderer } from '@haklex/rich-renderer-image/static';
import { LinkCardRenderer } from '@haklex/rich-renderer-linkcard/static';
import { MentionRenderer } from '@haklex/rich-renderer-mention/static';
import { MermaidRenderer } from '@haklex/rich-renderer-mermaid/static';
import { RubyRenderer } from '@haklex/rich-renderer-ruby/static';
import { VideoRenderer } from '@haklex/rich-renderer-video/static';

export const enhancedRendererConfig: RendererConfig = {
  Alert: AlertRenderer,
  Banner: BannerRenderer,
  Chat: ChatRenderer,
  CodeBlock: CodeBlockRenderer,
  Image: ImageRenderer,
  LinkCard: LinkCardRenderer,
  Mention: MentionRenderer,
  Ruby: RubyRenderer,
  Gallery: GalleryRenderer,
  Mermaid: MermaidRenderer,
  Video: VideoRenderer,
  CodeSnippet: CodeSnippetRenderer,
};
