import type { RendererConfig } from '@haklex/rich-editor';
import { FootnoteRenderer } from '@haklex/rich-editor/renderers';
import { CodeSnippetEditRenderer } from '@haklex/rich-ext-code-snippet';
import { GalleryEditRenderer } from '@haklex/rich-ext-gallery';
import { AlertEditRenderer } from '@haklex/rich-renderer-alert';
import { BannerEditRenderer } from '@haklex/rich-renderer-banner';
import { CodeBlockEditRenderer } from '@haklex/rich-renderer-codeblock';
import { ImageEditRenderer } from '@haklex/rich-renderer-image';
import { MentionEditRenderer } from '@haklex/rich-renderer-mention';
import { MermaidEditRenderer } from '@haklex/rich-renderer-mermaid';
import { RubyEditRenderer } from '@haklex/rich-renderer-ruby';
import { VideoEditRenderer } from '@haklex/rich-renderer-video';
import { enhancedRendererConfig } from '@haklex/rich-renderers';

export const enhancedEditRendererConfig: RendererConfig = {
  ...enhancedRendererConfig,
  Alert: AlertEditRenderer,
  Banner: BannerEditRenderer,
  CodeBlock: CodeBlockEditRenderer,
  Footnote: FootnoteRenderer,
  Gallery: GalleryEditRenderer,
  Image: ImageEditRenderer,
  Mention: MentionEditRenderer,
  Ruby: RubyEditRenderer,
  Mermaid: MermaidEditRenderer,
  Video: VideoEditRenderer,
  CodeSnippet: CodeSnippetEditRenderer,
};
