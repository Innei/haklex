# Custom Renderer Configuration

The rich-editor package provides a flexible architecture for customizing how nodes are rendered. By default, all nodes use simple, lightweight renderers. You can override these with your own custom implementations.

## Basic Usage

```tsx
import { RichEditor, RichRenderer, type RendererConfig } from '@shiro/rich-editor'

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
} from '@shiro/rich-editor'

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
import type { ImageRendererProps, RendererConfig } from '@shiro/rich-editor'

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
import type { LinkCardRendererProps } from '@shiro/rich-editor'

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

## Migration from Main Project

If you're migrating from the main Shiroi project and want to use the richer implementations:

```tsx
// Import your existing renderers
import { VideoPlayer } from '~/components/media/VideoPlayer'
import { LinkCard } from '~/components/ui/link-card/LinkCard'
import { MFootNote } from '~/components/ui/markdown/renderers/footnotes'

const shioriRenderers: RendererConfig = {
  Video: VideoPlayer,
  LinkCard: LinkCard,
  Footnote: MFootNote,
  // ... map other renderers
}
```

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
