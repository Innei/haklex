# Custom Renderer Configuration

The rich-editor package provides a flexible architecture for customizing how nodes are rendered. By default, all nodes use simple, lightweight renderers. You can override these with your own custom implementations.

## Basic Usage

```tsx
import { RichEditor, RichRenderer, type RendererConfig } from '@haklex/rich-editor'

// Define your custom renderers
const customRenderers: RendererConfig = {
  Image: MyCustomImageRenderer,
  Video: MyCustomVideoPlayer,
  LinkCard: MyEnhancedLinkCard,
  // ... other custom renderers
}

// Use in Editor
<RichEditor
  rendererConfig={customRenderers}
  onChange={handleChange}
/>

// Use in Renderer (read-only)
<RichRenderer
  value={editorState}
  rendererConfig={customRenderers}
/>
```

## Available Renderers

All of these can be customized via `RendererConfig`:

### Block Renderers
- **CodeBlock** - Syntax-highlighted code blocks
- **Image** - Images with optional captions
- **Video** - Video embeds
- **LinkCard** - Rich link preview cards
- **Gallery** - Image galleries (grid/masonry/carousel)
- **Tabs** - Tabbed content containers

### Inline Renderers
- **Footnote** - Footnote reference markers
- **KaTeX** - Mathematical expressions (inline and block)
- **Mention** - Social media mentions

## Renderer Props

Each renderer receives specific props. Import the prop types for type safety:

```tsx
import type {
  ImageRendererProps,
  CodeBlockRendererProps,
  // ... other types
} from '@haklex/rich-editor'

function MyCustomImageRenderer({
  src,
  altText,
  width,
  height,
  caption,
}: ImageRendererProps) {
  // Your custom implementation
  return (
    <figure>
      <img src={src} alt={altText} loading="lazy" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
```

## Example: Enhanced Image Renderer

```tsx
import type { ComponentType } from 'react'
import type { ImageRendererProps, RendererConfig } from '@haklex/rich-editor'

// Custom image renderer with zoom, blurhash, lazy loading
const EnhancedImageRenderer: ComponentType<ImageRendererProps> = ({
  src,
  altText,
  caption,
}) => {
  return (
    <div className="enhanced-image">
      <ImageWithBlurhash
        src={src}
        alt={altText}
        onClick={() => openLightbox(src)}
      />
      {caption && <Caption text={caption} />}
    </div>
  )
}

const config: RendererConfig = {
  Image: EnhancedImageRenderer,
}
```

## Example: Custom Link Card with Fetch

```tsx
import type { LinkCardRendererProps } from '@haklex/rich-editor'

const DynamicLinkCard: ComponentType<LinkCardRendererProps> = ({
  url,
  title,
  description,
  favicon,
  image,
}) => {
  const { data, loading } = useLinkPreview(url) // Your custom hook

  if (loading) return <LinkCardSkeleton />

  return (
    <a href={url} className="link-card">
      {data.image && <img src={data.image} />}
      <div>
        <h3>{data.title || title}</h3>
        <p>{data.description || description}</p>
      </div>
    </a>
  )
}
```

## Default Renderers

If you don't provide a custom renderer, the default lightweight renderers are used:

- **CodeBlock** - Plain `<pre><code>` with language class
- **Image** - Simple `<img>` with optional caption
- **Video** - HTML5 `<video>` with controls
- **LinkCard** - Basic link card with favicon, title, description
- **Gallery** - CSS grid/flex layout for images
- **Footnote** - Anchor link with `[n]` format
- **KaTeX** - Lazy-loaded KaTeX rendering
- **Mention** - Plain text with `@username` format
- **Tabs** - Simple tabbed interface

## Migration from Main Project (Shiroi apps/web)

主项目提供了更丰富的 renderer 实现，通过适配层可直接注入。

### 使用预配置的适配器

```tsx
import { customRendererConfig } from '~/lib/rich-editor-renderers'
import { RichEditor, RichRenderer } from '@haklex/rich-editor'

// 使用主项目的复杂实现
<RichEditor
  rendererConfig={customRendererConfig}
  onChange={handleChange}
/>

<RichRenderer
  value={editorState}
  rendererConfig={customRendererConfig}
/>
```

### 自定义适配器

参考 `apps/web/src/lib/rich-editor-renderers.tsx`：

```tsx
import type { VideoRendererProps, RendererConfig } from '@haklex/rich-editor'
import { VideoPlayer } from '~/components/ui/media/VideoPlayer'

// 适配层：包装主项目组件以符合 RendererConfig 接口
function VideoRendererAdapter({ src, poster }: VideoRendererProps) {
  return (
    <VideoPlayer
      src={src}
      poster={poster}
      variant="player"
      playsInline
      muted={false}
    />
  )
}

const customConfig: RendererConfig = {
  Video: VideoRendererAdapter,
  // ... 其他适配器
}
```

### 已适配的组件

- **VideoPlayer** - 完整视频播放器（进度条、音量、全屏、下载）
- **LinkCard** - 动态 fetcher、plugin 系统、spotlight 效果
- **Gallery** - autoplay、carousel、photo-view zoom

**注意**: `MFootNote` 不兼容单个脚注引用模式，保持使用默认简单实现。

## Architecture

The architecture uses React Context to provide renderer configuration down the component tree:

1. `RichEditor` / `RichRenderer` wrap content with `RendererConfigProvider`
2. DecoratorNodes use `RendererWrapper` in their `decorate()` method
3. `RendererWrapper` checks context for custom renderer, falls back to default
4. Custom renderers receive the same props as default renderers

This allows you to:
- Override any subset of renderers (partial config)
- Maintain type safety with TypeScript
- Keep the default package lightweight
- Progressively enhance with custom implementations
