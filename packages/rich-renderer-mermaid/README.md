# @haklex/rich-renderer-mermaid

Mermaid 图表渲染器。

## 安装

```bash
pnpm add @haklex/rich-renderer-mermaid @haklex/rich-editor mermaid
```

## 导出

```ts
export { MermaidRenderer } from './MermaidRenderer'
export { MermaidEditRenderer } from './MermaidEditRenderer'
```

## 功能

- Mermaid 图表渲染
- 缩放平移
- 编辑对话框

## 使用

```tsx
import { MermaidRenderer } from '@haklex/rich-renderer-mermaid'
import type { RendererConfig } from '@haklex/rich-editor'

const config: RendererConfig = {
  Mermaid: MermaidRenderer,
}
```

## 依赖

```json
{
  "@haklex/rich-editor": "workspace:*",
  "mermaid": "^11.0.0"
}
```

## License

MIT
