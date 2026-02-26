# @haklex/rich-static-renderer

Lexical 富文本的只读渲染引擎（Headless + React 输出）。  
用于把 `SerializedEditorState` 渲染成可展示的 React 内容。

## 包定位

- 不提供编辑能力
- 适合文章详情页、评论展示、SSR 输出
- 默认支持 `@haklex/rich-editor` 内置节点（`allNodes`）

## 安装

```bash
pnpm add @haklex/rich-static-renderer @haklex/rich-editor lexical react react-dom
```

## 快速开始

```tsx
import { RichRenderer } from '@haklex/rich-static-renderer'
import type { SerializedEditorState } from 'lexical'
import '@haklex/rich-editor/style.css'

export function Article({
  value,
}: {
  value: SerializedEditorState
}) {
  return <RichRenderer value={value} variant="article" theme="light" />
}
```

## API

```ts
interface RichRendererProps {
  value: SerializedEditorState
  variant?: 'article' | 'comment' | 'note'
  theme?: 'light' | 'dark'
  className?: string
  style?: CSSProperties
  as?: keyof React.JSX.IntrinsicElements
  rendererConfig?: RendererConfig
  extraNodes?: Array<Klass<LexicalNode>>
}
```

字段说明：

- `value`：Lexical JSON（必填）
- `as`：渲染容器标签，默认 `div`
- `rendererConfig`：覆写某些节点的渲染组件（Image/CodeBlock/...）
- `extraNodes`：注册扩展节点（如 Tldraw、Embed、Gallery、CodeSnippet）

## 与增强渲染器一起用

```tsx
import { RichRenderer } from '@haklex/rich-static-renderer'
import {
  codeSnippetNodes,
  embedNodes,
  enhancedRendererConfig,
  galleryNodes,
  TldrawNode,
} from '@haklex/rich-renderers'

import '@haklex/rich-editor/style.css'
import '@haklex/rich-renderers/style.css'
import '@haklex/rich-ext-code-snippet/style.css'
import '@haklex/rich-ext-embed/style.css'
import 'katex/dist/katex.min.css'
import 'tldraw/tldraw.css'

const extraNodes = [
  TldrawNode,
  ...embedNodes,
  ...galleryNodes,
  ...codeSnippetNodes,
]

<RichRenderer
  value={value}
  rendererConfig={enhancedRendererConfig}
  extraNodes={extraNodes}
/>
```

## 渲染行为说明

- 内部使用 `@lexical/headless` 构建只读 editor，再将节点树转为 React
- 标题会自动生成 slug 与锚点（重复标题自动去重）
- 脚注会先预处理编号，再统一渲染引用与定义
- `Alert/Banner/Grid` 等嵌套内容通过 `NestedContentRendererProvider` 递归渲染

## 设计模式

### 1) 节点注册与渲染器覆写解耦

- 节点协议（JSON 结构）由 Node class 决定
- 显示层由 `rendererConfig` 决定
- 扩展节点只需通过 `extraNodes` 注册，不要求侵入核心渲染器

### 2) Static / Edit 拆分协作

`@haklex/rich-static-renderer` 只消费静态节点。  
编辑态重依赖（Popover、Dialog 等）应该放在 edit 节点/编辑包里，不进入只读包。

## 常见问题

### Q1: 为什么有些节点不显示？

通常是忘了注册扩展节点（`extraNodes`），例如 `embed`、`tldraw`、`gallery`、`code-snippet`。

### Q2: 为什么公式样式不对？

需要手动引入：

```ts
import 'katex/dist/katex.min.css'
```

### Q3: 为什么 tldraw 画布样式错乱？

需要手动引入：

```ts
import 'tldraw/tldraw.css'
```

## License

MIT
