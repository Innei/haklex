# @haklex/rich-editor

Core rich text editor based on Lexical. Provides the `RichEditor` component, all builtin and custom nodes, built-in plugins, and editor contexts.

## Installation

```bash
pnpm add @haklex/rich-editor lexical @lexical/react react react-dom
```

## Peer Dependencies

Lexical 0.44+ exposes code blocks in `@lexical/code-core` (no Prism). This package depends on it; add `@lexical/code-core` to your app only if you import it yourself (e.g. custom code-block tooling).

| Package              | Version    | Required |
| -------------------- | ---------- | -------- |
| `@base-ui/react`     | `^1.1.0`   | Yes      |
| `@lexical/extension` | `^0.44.0`  | Yes      |
| `@lexical/link`      | `^0.44.0`  | Yes      |
| `@lexical/list`      | `^0.44.0`  | Yes      |
| `@lexical/markdown`  | `^0.44.0`  | Yes      |
| `@lexical/react`     | `^0.44.0`  | Yes      |
| `@lexical/rich-text` | `^0.44.0`  | Yes      |
| `@lexical/table`     | `^0.44.0`  | Yes      |
| `lexical`            | `^0.44.0`  | Yes      |
| `lucide-react`       | `^0.574.0` | Yes      |
| `react`              | `>=19`     | Yes      |
| `react-dom`          | `>=19`     | Yes      |
| `katex`              | `>=0.16.0` | Optional |
| `shiki`              | `^3.0.0`   | Optional |

## Usage

```tsx
import { RichEditor } from '@haklex/rich-editor';
import '@haklex/rich-editor/style.css';

<RichEditor variant="article" initialValue={savedState} onChange={(value) => save(value)} />;
```

For read-only rendering, use `@haklex/rich-compose` (exports `RichRenderer` and the modular composition API).

## Exports

### Components

| Export                          | Description                                   |
| ------------------------------- | --------------------------------------------- |
| `RichEditor`                    | Main editor component                         |
| `ColorSchemeProvider`           | Context provider for light/dark theme         |
| `FootnoteDefinitionsProvider`   | Context provider for footnote definitions     |
| `NestedContentRendererProvider` | Context provider for nested content rendering |

### Node Registries

| Export            | Description                                 |
| ----------------- | ------------------------------------------- |
| `allNodes`        | All static nodes (builtin + custom)         |
| `builtinNodes`    | Lexical builtin nodes only                  |
| `customNodes`     | Custom static nodes only                    |
| `allEditNodes`    | All edit-mode nodes (builtin + custom edit) |
| `customEditNodes` | Custom edit-mode nodes only                 |

### Node Classes

| Export                                                                        | Description                     |
| ----------------------------------------------------------------------------- | ------------------------------- |
| `MermaidNode`, `$createMermaidNode`, `$isMermaidNode`                         | Mermaid diagram node            |
| `RubyNode`, `$createRubyNode`, `$isRubyNode`                                  | Ruby annotation node            |
| `GridContainerNode`, `$createGridContainerNode`, `$isGridContainerNode`       | Grid layout container           |
| `FootnoteSectionNode`, `$createFootnoteSectionNode`, `$isFootnoteSectionNode` | Footnote section node           |
| `FootnoteSectionEditNode`                                                     | Footnote section edit-mode node |
| `ImageNode`, `$createImageNode`, `$isImageNode`                               | Image node                      |
| `LinkCardNode`, `$createLinkCardNode`, `$isLinkCardNode`                      | Link card node                  |
| `KaTeXBlockNode`, `$isKaTeXBlockNode`                                         | KaTeX block equation node       |
| `KaTeXInlineNode`, `$isKaTeXInlineNode`                                       | KaTeX inline equation node      |
| `MentionNode`, `$createMentionNode`, `$isMentionNode`                         | Mention node                    |

### Plugins

| Export                    | Description                            |
| ------------------------- | -------------------------------------- |
| `AutoLinkPlugin`          | Automatic link detection               |
| `BlockExitPlugin`         | Exit block nodes with Enter/arrow keys |
| `HorizontalRulePlugin`    | Horizontal rule insertion              |
| `ImagePlugin`             | Image node handling                    |
| `ImageUploadPlugin`       | Image upload dialog and logic          |
| `KaTeXPlugin`             | KaTeX equation insertion               |
| `LinkFaviconPlugin`       | Favicon resolution for links           |
| `MarkdownShortcutsPlugin` | Markdown syntax shortcuts              |
| `MermaidPlugin`           | Mermaid diagram insertion              |
| `FootnotePlugin`          | Footnote insertion and management      |

### Commands

| Export                             | Description                    |
| ---------------------------------- | ------------------------------ |
| `INSERT_ALERT_COMMAND`             | Insert an alert/callout block  |
| `INSERT_IMAGE_COMMAND`             | Insert an image node           |
| `OPEN_IMAGE_UPLOAD_DIALOG_COMMAND` | Open the image upload dialog   |
| `INSERT_KATEX_BLOCK_COMMAND`       | Insert a KaTeX block equation  |
| `INSERT_KATEX_INLINE_COMMAND`      | Insert a KaTeX inline equation |
| `INSERT_MERMAID_COMMAND`           | Insert a Mermaid diagram       |

### Utilities

| Export                                 | Description                                      |
| -------------------------------------- | ------------------------------------------------ |
| `extractTextContent`                   | Extract plain text from editor state             |
| `collectCommandItems`                  | Collect slash menu / toolbar command items       |
| `computeImageMeta`                     | Compute thumbhash and dimensions for an image    |
| `decodeThumbHash`                      | Decode a thumbhash string to a data URL          |
| `createRendererDecoration`             | Create a renderer decoration for decorator nodes |
| `getVariantClass`                      | Get the CSS class for a variant                  |
| `defaultImageUpload`                   | Default image upload implementation              |
| `buildBlockAnchor`, `buildRangeAnchor` | Comment anchor utilities                         |
| `ALL_TRANSFORMERS`                     | All Markdown transformers (inline + block)       |

### Slot Keys

`RendererConfig` keys are exposed as `as const` constants for safer call sites. Use them in `createRendererDecoration` and module override maps instead of bare string literals:

```ts
import {
  ALERT_NODE_KEY,
  BANNER_NODE_KEY,
  CODE_BLOCK_NODE_KEY,
  FOOTNOTE_NODE_KEY,
  FOOTNOTE_SECTION_NODE_KEY,
  IMAGE_NODE_KEY,
  KATEX_NODE_KEY,
  LINK_CARD_NODE_KEY,
  MENTION_NODE_KEY,
  MERMAID_NODE_KEY,
  RUBY_NODE_KEY,
  TAG_NODE_KEY,
  VIDEO_NODE_KEY,
} from '@haklex/rich-editor';
```

Extension packages (`@haklex/rich-ext-*`) expose their own slot keys (e.g. `POLL_NODE_KEY`, `CHAT_NODE_KEY`).

### Extending `RendererConfig`

`@haklex/rich-editor` ships only the built-in slots. Extension and downstream packages add their own slots via TypeScript module augmentation:

```ts
import type { ComponentType } from 'react';
import type { MyChartProps } from './MyChart';
// Force the augmentation target to resolve as an external module.
import type {} from '@haklex/rich-editor';

declare module '@haklex/rich-editor' {
  interface RendererConfig {
    MyChart?: ComponentType<MyChartProps>;
  }
}

export {};
```

Re-export the augmentation file as a side-effect from every public entry (`/node`, `/renderer`, `/edit`, `/static`, `/index`) so consumers see the slot regardless of which sub-path they import.

### Types

`RichEditorProps`, `RichEditorVariant`, `RendererConfig`, `ColorScheme`, `RendererMode`, `ImageUploadFn`, `ImageUploadResult`, `CommandItemConfig`, `SlashMenuItemConfig`, `ToolbarGroup`, `CommandPlacement`, and **built-in** renderer prop types (`AlertRendererProps`, `ImageRendererProps`, `CodeBlockRendererProps`, etc.). Extension renderer props (`PollRendererProps`, `ChatRendererProps`, `CodeFile`, `GalleryRendererProps`, …) live in their owning packages — import from `@haklex/rich-ext-<name>/node`.

### Sub-path Exports

| Import Path                     | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `@haklex/rich-editor`           | Full export (components, nodes, plugins, commands, contexts, types) |
| `@haklex/rich-editor/editor`    | Editor-specific entry (RichEditor + node configs)                   |
| `@haklex/rich-editor/nodes`     | Node classes + edit-mode node classes                               |
| `@haklex/rich-editor/plugins`   | Built-in plugins                                                    |
| `@haklex/rich-editor/commands`  | Insert / open commands + `CommandItemConfig`                        |
| `@haklex/rich-editor/renderers` | Built-in renderer components, prop types, and slot key constants    |
| `@haklex/rich-editor/static`    | Static/SSR utilities (for renderer and extension packages)          |
| `@haklex/rich-editor/styles`    | Style variables and variant class exports                           |
| `@haklex/rich-editor/style.css` | Compiled editor stylesheet                                          |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
