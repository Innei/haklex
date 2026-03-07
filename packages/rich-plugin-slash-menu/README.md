# @haklex/rich-plugin-slash-menu

斜杠命令菜单插件。

## 安装

```bash
pnpm add @haklex/rich-plugin-slash-menu @haklex/rich-editor
```

## 导出

```ts
export { SlashMenuPlugin } from './SlashMenuPlugin'
export type { SlashMenuPluginProps } from './SlashMenuPlugin'
export { SlashMenuItem } from './SlashMenuItem'
export { SlashMenuList } from './SlashMenuList'
export { getBuiltinItems } from './builtinItems'
```

## 使用

```tsx
import { SlashMenuPlugin } from '@haklex/rich-plugin-slash-menu'
import { RichEditor } from '@haklex/rich-editor'

<RichEditor>
  <SlashMenuPlugin />
</RichEditor>
```

## Props

```ts
interface SlashMenuPluginProps {
  items?: SlashMenuItem[]      // 自定义项目
  extraItems?: SlashMenuItem[] // 额外项目
  triggerChar?: string         // 触发字符，默认 '/'
}
```

## License

MIT
