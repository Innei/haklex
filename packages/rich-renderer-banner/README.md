# @haklex/rich-renderer-banner

横幅渲染器。

## 安装

```bash
pnpm add @haklex/rich-renderer-banner
```

## 导出

```ts
export { BannerRenderer } from './BannerRenderer'
export { BannerEditRenderer } from './BannerEditRenderer'
```

## 使用

```tsx
import { BannerRenderer } from '@haklex/rich-renderer-banner'
import type { RendererConfig } from '@haklex/rich-editor'

const config: RendererConfig = {
  Banner: BannerRenderer,
}
```

## License

MIT
