# @haklex/rich-ext-code-snippet

多文件代码片段扩展。

## 安装

```bash
pnpm add @haklex/rich-ext-code-snippet @haklex/rich-editor
```

## 导出

```ts
// 节点
export { CodeSnippetNode } from './nodes/CodeSnippetNode'
export { $createCodeSnippetNode, $isCodeSnippetNode } from './nodes/CodeSnippetNode'
export type { SerializedCodeSnippetNode } from './nodes/CodeSnippetNode'

export { CodeSnippetEditNode } from './nodes/CodeSnippetEditNode'
export { $createCodeSnippetEditNode, $isCodeSnippetEditNode } from './nodes/CodeSnippetEditNode'

export { codeSnippetNodes, codeSnippetEditNodes } from './nodes'

// 渲染器
export { CodeSnippetRenderer } from './CodeSnippetRenderer'
export { CodeSnippetEditRenderer } from './CodeSnippetEditRenderer'
export type { CodeSnippetEditRendererProps } from './CodeSnippetEditRenderer'
```

## 使用

```tsx
import { 
  CodeSnippetRenderer, 
  codeSnippetNodes 
} from '@haklex/rich-ext-code-snippet'
import { RichRenderer } from '@haklex/rich-editor/renderer'
import type { RendererConfig } from '@haklex/rich-editor'

const config: RendererConfig = {
  CodeSnippet: CodeSnippetRenderer,
}

<RichRenderer 
  value={content}
  rendererConfig={config}
  extraNodes={[...codeSnippetNodes]}
/>
```

## License

MIT
