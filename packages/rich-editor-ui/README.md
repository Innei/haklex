# @haklex/rich-editor-ui

Headless UI primitives for the Haklex rich editor, built on Base UI (`@base-ui/react`).

## Installation

```bash
pnpm add @haklex/rich-editor-ui
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `react` | `>=19` |
| `react-dom` | `>=19` |

## Usage

```tsx
import { Dialog, DialogTrigger, DialogPopup, presentDialog } from '@haklex/rich-editor-ui'
import '@haklex/rich-editor-ui/style.css'

// Declarative usage
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogPopup>Dialog content here</DialogPopup>
</Dialog>

// Imperative usage
presentDialog({
  title: 'Confirm',
  content: ({ dismiss }) => <p>Are you sure? <button onClick={dismiss}>Close</button></p>,
})
```

## Exports

### Dialog

`Dialog`, `DialogTrigger`, `DialogPopup`, `DialogBackdrop`, `DialogPortal`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`, `DialogStackProvider`

Imperative API: `presentDialog`, `dismissDialog`, `dismissTopDialog`, `dismissAllDialogs`

### DropdownMenu

`DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuRadioGroup`

### Popover

`Popover`, `PopoverTrigger`, `PopoverPopup`, `PopoverPortal`, `PopoverPositioner`, `PopoverPanel`, `PopoverArrow`, `PopoverTitle`, `PopoverDescription`, `PopoverClose`, `usePopover`

### Combobox

`Combobox`, `ComboboxInput`, `ComboboxContent`, `ComboboxList`, `ComboboxItem`, `ComboboxItemIndicator`, `ComboboxGroup`, `ComboboxGroupLabel`, `ComboboxEmpty`

### Other Components

| Export | Description |
| --- | --- |
| `AnimatedTabs` | Tab bar with animated active indicator |
| `AnimatedCheckbox` | Checkbox with animation |
| `ColorPicker` | Color picker input |
| `SegmentedControl` | Segmented control / toggle group |
| `TooltipRoot`, `TooltipTrigger`, `TooltipContent`, `TooltipPopup`, `TooltipPortal`, `TooltipPositioner`, `TooltipProvider` | Tooltip components |
| `createTooltipHandle` | Imperative tooltip control |
| `ViewportGate` | Render children only when visible in viewport |

### Theme Utilities

`PortalThemeProvider`, `PortalThemeWrapper`, `usePortalTheme` (re-exported from `@haklex/rich-style-token`)

### Sub-path Exports

| Import Path | Description |
| --- | --- |
| `@haklex/rich-editor-ui` | All components and utilities |
| `@haklex/rich-editor-ui/style.css` | Compiled stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
