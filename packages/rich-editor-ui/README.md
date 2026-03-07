# @haklex/rich-editor-ui

基于 @base-ui/react 的无头 UI 组件，用于富文本编辑器。

## 安装

```bash
pnpm add @haklex/rich-editor-ui
```

## 组件

### Dialog

```tsx
import { Dialog, presentDialog } from '@haklex/rich-editor-ui'

// 声明式
<Dialog.Root>
  <Dialog.Trigger>打开</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <Dialog.Header>
        <Dialog.Title>标题</Dialog.Title>
      </Dialog.Header>
      <Dialog.Description>内容</Dialog.Description>
      <Dialog.Footer>
        <Dialog.Close>关闭</Dialog.Close>
      </Dialog.Footer>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>

// 命令式
const result = await presentDialog({
  title: '确认',
  content: <MyForm />,
})
```

### DropdownMenu

```tsx
import { DropdownMenu } from '@haklex/rich-editor-ui'

<DropdownMenu.Root>
  <DropdownMenu.Trigger>菜单</DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content>
      <DropdownMenu.Item>操作 1</DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item>操作 2</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

### Popover

```tsx
import { Popover } from '@haklex/rich-editor-ui'

<Popover.Root>
  <Popover.Trigger>触发</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup>
        <Popover.Title>标题</Popover.Title>
        <Popover.Description>描述</Popover.Description>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
```

### Tooltip

```tsx
import { Tooltip } from '@haklex/rich-editor-ui'

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger>悬停</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup>提示文本</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
```

### SegmentedControl

```tsx
import { SegmentedControl } from '@haklex/rich-editor-ui'

<SegmentedControl.Root value={value} onValueChange={setValue}>
  <SegmentedControl.Item value="a">A</SegmentedControl.Item>
  <SegmentedControl.Item value="b">B</SegmentedControl.Item>
</SegmentedControl.Root>
```

### ColorPicker

```tsx
import { ColorPicker } from '@haklex/rich-editor-ui'

<ColorPicker value={color} onChange={setColor} />
```

## 导出

```ts
// Dialog
export { Dialog, DialogBackdrop, DialogClose, ... } from './components/dialog'
export { presentDialog, dismissDialog, dismissAllDialogs } from './components/dialog/store'

// DropdownMenu
export { DropdownMenu, DropdownMenuItem, ... } from './components/dropdown-menu'

// Popover
export { Popover, PopoverPopup, PopoverTrigger, ... } from './components/popover'

// Tooltip
export { TooltipRoot, TooltipTrigger, TooltipPopup, ... } from './components/tooltip'

// SegmentedControl
export { SegmentedControl } from './components/segmented-control'

// ColorPicker
export { ColorPicker } from './components/color-picker'

// Portal 主题
export { PortalThemeProvider, PortalThemeWrapper, usePortalTheme } from '@haklex/rich-style-token'
```

## 依赖

```json
{
  "@base-ui/react": "^1.1.0",
  "lucide-react": "^0.574.0",
  "react": ">=19",
  "react-dom": ">=19"
}
```

## License

MIT
