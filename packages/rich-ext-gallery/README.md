# @haklex/rich-ext-gallery

图片画廊扩展。

## 安装

```bash
pnpm add @haklex/rich-ext-gallery @haklex/rich-editor
```

## 导出

```ts
// 节点
export { GalleryNode } from './GalleryNode'
export { $createGalleryNode, $isGalleryNode } from './GalleryNode'
export type { GalleryNodePayload, SerializedGalleryNode } from './GalleryNode'

// 渲染器
export { GalleryRenderer } from './GalleryRenderer'
export { GalleryEditRenderer } from './GalleryEditRenderer'

// 节点集合
export const galleryNodes: Array<Klass<LexicalNode>>
```

## 使用

```tsx
import { GalleryRenderer, galleryNodes } from '@haklex/rich-ext-gallery'
import { RichRenderer } from '@haklex/rich-editor/renderer'
import type { RendererConfig } from '@haklex/rich-editor'

const config: RendererConfig = {
  Gallery: GalleryRenderer,
}

<RichRenderer 
  value={content} 
  rendererConfig={config}
  extraNodes={[...galleryNodes]}
/>
```

## License

MIT
