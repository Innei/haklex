# @shiro/rich-renderer-gallery

Enhanced Gallery renderer for `@shiro/rich-editor` with carousel mode, autoplay, and photo zoom.

## Features

- 🎠 **Carousel Mode** - Smooth scrolling carousel with autoplay
- 🖼️ **Photo Zoom** - Click to zoom images with `react-photo-view`
- 📐 **Multiple Layouts** - Grid, Masonry, Carousel
- 🔄 **Auto-play** - Bi-directional autoplay in carousel mode
- 📱 **Responsive** - Touch-friendly mobile support

## Installation

```bash
pnpm add @shiro/rich-renderer-gallery
```

## Usage

### With RendererConfig

```tsx
import { RichEditor } from '@shiro/rich-editor'
import { GalleryRenderer } from '@shiro/rich-renderer-gallery'
import '@shiro/rich-renderer-gallery/style.css'

<RichEditor
  rendererConfig={{
    Gallery: GalleryRenderer,
  }}
/>
```

### Grid Layout

```tsx
import { GalleryRenderer } from '@shiro/rich-renderer-gallery'

<GalleryRenderer
  images={[
    { src: 'https://example.com/1.jpg', alt: 'Image 1' },
    { src: 'https://example.com/2.jpg', alt: 'Image 2' },
    { src: 'https://example.com/3.jpg', alt: 'Image 3' },
  ]}
  layout="grid"
/>
```

### Carousel with Autoplay

```tsx
<GalleryRenderer
  images={images}
  layout="carousel"
/>
```

### Masonry Layout

```tsx
<GalleryRenderer
  images={images}
  layout="masonry"
/>
```

## Props

```ts
interface GalleryRendererProps {
  images: GalleryImage[]
  layout: 'grid' | 'masonry' | 'carousel'
}

interface GalleryImage {
  src: string
  alt?: string
  width?: number
  height?: number
}
```

## Features Detail

### Carousel Mode
- Auto-scrolling with bi-directional navigation
- Pause on touch/wheel interaction
- Navigation buttons and indicators
- Smooth scroll behavior

### Photo Zoom
- Powered by `react-photo-view`
- Click any image to open lightbox
- Keyboard navigation support

### Responsive
- Adaptive layout for mobile/tablet
- Touch-friendly controls
- Optimized performance

## License

MIT
