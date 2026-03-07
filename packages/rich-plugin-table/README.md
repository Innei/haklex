# @haklex/rich-plugin-table

表格编辑插件。

## 安装

```bash
pnpm add @haklex/rich-plugin-table @haklex/rich-editor
```

## 导出

```ts
export { TableCellResizerPlugin } from './TableCellResizerPlugin'
export { TableRowColumnHandlesPlugin } from './TableRowColumnHandlesPlugin'
```

## 使用

```tsx
import { 
  TableCellResizerPlugin, 
  TableRowColumnHandlesPlugin 
} from '@haklex/rich-plugin-table'
import { RichEditor } from '@haklex/rich-editor'

<RichEditor>
  <TableRowColumnHandlesPlugin />
  <TableCellResizerPlugin />
</RichEditor>
```

## License

MIT
