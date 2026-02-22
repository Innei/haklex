# @haklex/rich-editor

基于 [Lexical](https://lexical.dev/) 的富文本编辑器，支持自定义节点、插件和 Markdown 快捷键。

## 安装

```bash
pnpm add @haklex/rich-editor lexical @lexical/react
```

## 使用

### 编辑器模式

```tsx
import { RichEditor } from '@haklex/rich-editor'
import type { SerializedEditorState } from 'lexical'

function Editor() {
  const [state, setState] = useState<SerializedEditorState | undefined>()

  return (
    <RichEditor
      initialValue={state}
      onChange={setState}
      variant="article"
      placeholder="开始写作..."
    />
  )
}
```

### 渲染器模式（只读）

```tsx
import { RichRenderer } from '@haklex/rich-editor/renderer'
import type { SerializedEditorState } from 'lexical'

function Renderer({ content }: { content: SerializedEditorState }) {
  return (
    <RichRenderer
      value={content}
      variant="article"
    />
  )
}
```

## 导出入口

| 路径 | 说明 |
|------|------|
| `@haklex/rich-editor` | 完整导出 |
| `@haklex/rich-editor/editor` | 仅 `RichEditor` |
| `@haklex/rich-editor/renderer` | 仅 `RichRenderer` |
| `@haklex/rich-editor/style.css` | 样式文件 |

## API

### RichEditorProps

```ts
interface RichEditorProps {
  initialValue?: SerializedEditorState  // 初始状态
  onChange?: (value: SerializedEditorState) => void
  variant?: 'article' | 'comment' | 'note'  // 显示变体
  theme?: 'light' | 'dark'
  placeholder?: string
  onSubmit?: () => void
  autoFocus?: boolean
  className?: string
  contentClassName?: string
  actions?: ReactNode
  onEditorReady?: (editor: LexicalEditor | null) => void
  extraNodes?: Array<Klass<LexicalNode>>
  rendererConfig?: RendererConfig
  debounceMs?: number
  children?: ReactNode
}
```

### RichRendererProps

```ts
interface RichRendererProps {
  value: SerializedEditorState
  variant?: 'article' | 'comment' | 'note'
  theme?: 'light' | 'dark'
  className?: string
  as?: React.ElementType
  rendererConfig?: RendererConfig
  extraNodes?: Array<Klass<LexicalNode>>
}
```

## 变体

| 变体 | 字体 | 字号 | 行高 | 用途 |
|------|------|------|------|------|
| `article` | 系统无衬线 | 16px | 1.7 | 博客文章 |
| `note` | 思源宋体 | 16px | 1.8 | 个人笔记 |
| `comment` | 系统无衬线 | 14px | 1.5 | 评论 |

## 自定义渲染器

```tsx
import type { RendererConfig } from '@haklex/rich-editor'

const customConfig: RendererConfig = {
  Image: CustomImageRenderer,
  CodeBlock: CustomCodeRenderer,
}

<RichRenderer value={content} rendererConfig={customConfig} />
```

## 自定义节点

```tsx
import { RichEditor } from '@haklex/rich-editor'
import { MyCustomNode } from './nodes'

<RichEditor extraNodes={[MyCustomNode]} />
```

## 主要导出

```ts
// 组件
export { RichEditor } from './components/RichEditor'
export { RichRenderer } from './components/RichRenderer'

// 节点配置
export { allNodes, builtinNodes, customNodes } from './config'
export { allEditNodes, customEditNodes } from './config-edit'

// Context
export { ColorSchemeProvider, useColorScheme } from './context/ColorSchemeContext'
export { useRendererConfig } from './context/RendererConfigContext'

// 类型
export type { RichEditorProps, RichRendererProps, RichEditorVariant } from './types'
export type { RendererConfig } from './types/renderer-config'
export type { SlashMenuItemConfig } from './types/slash-menu'

// 工具函数
export { createRendererDecoration } from './components/RendererWrapper'
export { getVariantClass } from './components/utils'
```

## 依赖

```json
{
  "lexical": "^0.40.0",
  "@lexical/react": "^0.40.0",
  "react": ">=19",
  "react-dom": ">=19"
}
```

## License

MIT
