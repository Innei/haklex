# @haklex/rich-renderer-mention

提及渲染器，支持多平台徽章。

## 安装

```bash
pnpm add @haklex/rich-renderer-mention @haklex/rich-editor
```

## 导出

```ts
export { MentionRenderer } from './MentionRenderer'
export { MentionEditRenderer } from './MentionEditRenderer'
```

## 使用

```tsx
import { MentionRenderer } from '@haklex/rich-renderer-mention'
import type { RendererConfig } from '@haklex/rich-editor'

const config: RendererConfig = {
  Mention: MentionRenderer,
}
```

## License

MIT
