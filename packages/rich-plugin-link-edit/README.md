# @haklex/rich-plugin-link-edit

Link editing plugin with floating popover for creating and editing links.

## Installation

```bash
pnpm add @haklex/rich-plugin-link-edit
```

## Peer Dependencies

| Package          | Version   |
| ---------------- | --------- |
| `@lexical/link`  | `^0.45.0` |
| `@lexical/react` | `^0.45.0` |
| `lexical`        | `^0.45.0` |
| `lucide-react`   | `^1.0.0`  |
| `react`          | `>= 19`   |
| `react-dom`      | `>= 19`   |

## Usage

```tsx
import { FloatingLinkEditorPlugin } from '@haklex/rich-plugin-link-edit';
import '@haklex/rich-plugin-link-edit/style.css';

function Editor() {
  return (
    <RichEditor>
      <FloatingLinkEditorPlugin />
    </RichEditor>
  );
}
```

When the cursor is placed on a link node, a floating popover appears allowing the user to view, edit, or remove the link URL. The popover also supports creating new links from selected text.

```tsx
import type { FloatingLinkEditorPluginProps } from '@haklex/rich-plugin-link-edit';

// Props can be used to type custom wrappers
const props: FloatingLinkEditorPluginProps = {
  // ...
};
```

## Exports

| Export                          | Type            | Description                                         |
| ------------------------------- | --------------- | --------------------------------------------------- |
| `FloatingLinkEditorPlugin`      | Component       | Main plugin component to render inside `RichEditor` |
| `FloatingLinkEditorPluginProps` | TypeScript type | Props type for `FloatingLinkEditorPlugin`           |

## Sub-path Exports

| Path                                      | Description                |
| ----------------------------------------- | -------------------------- |
| `@haklex/rich-plugin-link-edit`           | Plugin component and types |
| `@haklex/rich-plugin-link-edit/style.css` | Stylesheet                 |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
