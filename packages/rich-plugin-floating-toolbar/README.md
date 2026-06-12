# @haklex/rich-plugin-floating-toolbar

Floating toolbar plugin that appears on text selection for inline formatting.

## Installation

```bash
pnpm add @haklex/rich-plugin-floating-toolbar
```

## Peer Dependencies

| Package              | Version   |
| -------------------- | --------- |
| `@lexical/link`      | `^0.45.0` |
| `@lexical/react`     | `^0.45.0` |
| `@lexical/selection` | `^0.45.0` |
| `lexical`            | `^0.45.0` |
| `lucide-react`       | `^1.0.0`  |
| `react`              | `>= 19`   |
| `react-dom`          | `>= 19`   |

## Usage

```tsx
import { FloatingToolbarPlugin } from '@haklex/rich-plugin-floating-toolbar';
import '@haklex/rich-plugin-floating-toolbar/style.css';

function Editor() {
  return (
    <RichEditor>
      <FloatingToolbarPlugin />
    </RichEditor>
  );
}
```

When the user selects text, a floating toolbar appears near the selection with inline formatting controls such as bold, italic, underline, strikethrough, code, and link insertion.

## Exports

| Export                  | Type      | Description                                         |
| ----------------------- | --------- | --------------------------------------------------- |
| `FloatingToolbarPlugin` | Component | Main plugin component to render inside `RichEditor` |

## Sub-path Exports

| Path                                             | Description      |
| ------------------------------------------------ | ---------------- |
| `@haklex/rich-plugin-floating-toolbar`           | Plugin component |
| `@haklex/rich-plugin-floating-toolbar/style.css` | Stylesheet       |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
