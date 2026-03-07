# @haklex/rich-plugin-slash-menu

Slash command menu plugin for inserting blocks via `/` trigger.

## Installation

```bash
pnpm add @haklex/rich-plugin-slash-menu
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `@lexical/list` | `^0.41.0` |
| `@lexical/react` | `^0.41.0` |
| `@lexical/rich-text` | `^0.41.0` |
| `@lexical/selection` | `^0.41.0` |
| `@lexical/table` | `^0.41.0` |
| `lexical` | `^0.41.0` |
| `lucide-react` | `^0.574.0` |
| `react` | `>= 19` |
| `react-dom` | `>= 19` |

## Usage

```tsx
import { SlashMenuPlugin } from '@haklex/rich-plugin-slash-menu'
import '@haklex/rich-plugin-slash-menu/style.css'

function Editor() {
  return (
    <RichEditor>
      <SlashMenuPlugin />
    </RichEditor>
  )
}
```

Typing `/` at the start of a block opens a command menu with filterable block insertion options (headings, lists, code blocks, tables, etc.). The menu supports keyboard navigation and fuzzy matching.

```tsx
import {
  SlashMenuPlugin,
  SlashMenuItem,
  SlashMenuList,
  getBuiltinItems,
  collectNodeSlashItems,
} from '@haklex/rich-plugin-slash-menu'
import type { SlashMenuPluginProps } from '@haklex/rich-plugin-slash-menu'

// Get builtin slash menu items
const items = getBuiltinItems()

// Collect slash items registered by nodes
const nodeItems = collectNodeSlashItems()
```

## Exports

| Export | Type | Description |
| --- | --- | --- |
| `SlashMenuPlugin` | Component | Main plugin component to render inside `RichEditor` |
| `SlashMenuItem` | Component | Individual menu item component |
| `SlashMenuList` | Component | Menu list container component |
| `getBuiltinItems` | Function | Returns the default set of slash menu items |
| `collectNodeSlashItems` | Function | Collects slash menu items registered by editor nodes |
| `SlashMenuPluginProps` | TypeScript type | Props type for `SlashMenuPlugin` |

## Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-plugin-slash-menu` | Plugin component, menu items, utilities, and types |
| `@haklex/rich-plugin-slash-menu/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
