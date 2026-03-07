# @haklex/rich-renderer-katex

KaTeX 数学公式编辑节点。

## 安装

```bash
pnpm add @haklex/rich-renderer-katex @haklex/rich-editor katex
```

## 导出

```ts
export { KaTeXBlockEditNode } from './KaTeXBlockEditNode'
export { KaTeXInlineEditNode } from './KaTeXInlineEditNode'
export { KaTeXEditDecorator } from './KaTeXEditDecorator'

export const katexEditNodes: Array<Klass<LexicalNode>>
```

## 使用

```tsx
import { katexEditNodes } from '@haklex/rich-renderer-katex'
import { RichEditor } from '@haklex/rich-editor'

<RichEditor extraNodes={[...katexEditNodes]} />
```

## 依赖

```json
{
  "@haklex/rich-editor": "workspace:*",
  "katex": ">=0.16.0"
}
```

## License

MIT
