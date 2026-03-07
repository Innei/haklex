# @haklex/rich-renderer-alert

GitHub 风格提示块渲染器。

## 安装

```bash
pnpm add @haklex/rich-renderer-alert
```

## 导出

```ts
export { AlertRenderer } from './AlertRenderer'
export { AlertEditRenderer } from './AlertEditRenderer'
```

## 类型

Alert 类型：`'note' | 'tip' | 'important' | 'warning' | 'caution'`

## 使用

渲染器通过 `rendererConfig` 传入：

```tsx
import { AlertRenderer } from '@haklex/rich-renderer-alert'
import type { RendererConfig } from '@haklex/rich-editor'

const config: RendererConfig = {
  Alert: AlertRenderer,
}
```

## License

MIT
