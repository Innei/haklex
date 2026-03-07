# @haklex/rich-diff

编辑器状态差异对比组件。

## 安装

```bash
pnpm add @haklex/rich-diff @haklex/rich-editor
```

## 导出

```ts
export { RichDiff } from './RichDiff'
export type { RichDiffProps } from './RichDiff'
export { computeDiff } from './compute-diff'
export type { DiffHunk, DiffOpType } from './compute-diff'
```

## 使用

```tsx
import { RichDiff } from '@haklex/rich-diff'
import '@haklex/rich-diff/style.css'

<RichDiff oldValue={oldState} newValue={newState} />
```

## License

MIT
