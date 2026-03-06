# @haklex/rich-kit-shiro

生产就绪的编辑器包，包含所有渲染器、插件和扩展。

## 安装

```bash
pnpm add @haklex/rich-kit-shiro lexical @lexical/react
```

## 使用

### 编辑器

```tsx
import { ShiroEditor } from '@haklex/rich-kit-shiro/editor'
import '@haklex/rich-kit-shiro/style.css'

function Editor() {
  const [state, setState] = useState()

  return (
    <ShiroEditor
      initialValue={state}
      onChange={setState}
      variant="article"
    />
  )
}
```

### 渲染器

```tsx
import { ShiroRenderer } from '@haklex/rich-kit-shiro/renderer'
import '@haklex/rich-kit-shiro/style.css'

function Article({ content }) {
  return <ShiroRenderer value={content} variant="article" />
}
```

## 内置功能

ShiroEditor 自动包含：

- 所有编辑渲染器
- SlashMenuPlugin
- FloatingToolbarPlugin
- FloatingLinkEditorPlugin
- TldrawPlugin
- EmbedPlugin
- 表格单元格调整

## API

### ShiroEditorProps

继承 `RichEditorProps`，但省略 `rendererConfig`、`extraNodes`：

```ts
interface ShiroEditorProps extends Omit<RichEditorProps, 'rendererConfig' | 'extraNodes' | 'actions'> {
  extraNodes?: Array<Klass<LexicalNode>>
  actions?: ReactNode
  selfHostnames?: string[]  // EmbedPlugin 用
}
```

### ShiroRendererProps

继承 `RichRendererProps`，但省略 `rendererConfig`、`extraNodes`：

```ts
interface ShiroRendererProps extends Omit<RichRendererProps, 'rendererConfig' | 'extraNodes'> {
  extraNodes?: Array<Klass<LexicalNode>>
}
```

## 导出

```ts
// 组件
export { ShiroEditor } from './ShiroEditor'
export { ShiroRenderer } from './ShiroRenderer'

// 类型
export type { ShiroEditorProps } from './ShiroEditor'
export type { ShiroRendererProps } from './ShiroRenderer'

// 重新导出常用类型
export type { ColorScheme, RendererConfig, RichEditorVariant } from '@haklex/rich-editor'

// 重新导出配置（高级用法）
export { enhancedRendererConfig } from '@haklex/rich-renderers'
export { enhancedEditRendererConfig } from '@haklex/rich-renderers-edit'
```

## 依赖

```json
{
  "lexical": "^0.41.0",
  "@lexical/react": "^0.41.0",
  "react": ">=19",
  "react-dom": ">=19"
}
```

## License

MIT
