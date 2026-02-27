# @haklex/rich-renderer-codeblock

基于 Shiki 的代码块渲染器。

## 安装

```bash
pnpm add @haklex/rich-renderer-codeblock @haklex/rich-editor shiki
```

## 导出

```ts
export { CodeBlockRenderer } from './CodeBlockRenderer'
export { CodeBlockEditRenderer } from './CodeBlockEditRenderer'
```

## 功能

- Shiki 语法高亮
- 自动检测语言
- 行号显示
- 复制按钮
- 自动适配深浅主题

## 使用

```tsx
import { CodeBlockRenderer } from '@haklex/rich-renderer-codeblock'
import type { RendererConfig } from '@haklex/rich-editor'

const config: RendererConfig = {
  CodeBlock: CodeBlockRenderer,
}
```

## 依赖

```json
{
  "@haklex/rich-editor": "workspace:*",
  "shiki": "^3.0.0"
}
```

## License

MIT
