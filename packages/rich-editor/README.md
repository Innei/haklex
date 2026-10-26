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
| `@lexical/extension` | `^0.45.0`  | Yes      |
| `@lexical/link`      | `^0.45.0`  | Yes      |
| `@lexical/list`      | `^0.45.0`  | Yes      |
| `@lexical/markdown`  | `^0.45.0`  | Yes      |
| `@lexical/react`     | `^0.45.0`  | Yes      |
| `@lexical/rich-text` | `^0.45.0`  | Yes      |
| `@lexical/table`     | `^0.45.0`  | Yes      |
| `lexical`            | `^0.45.0`  | Yes      |
| `lucide-react`       | `^1.0.0`   | Yes      |
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

## Experimental editor recycler

Virtualization is **off by default**. The optional plugin keeps the full document in the main editor and projects visible blocks into editable Lexical instances. The recycler implementation loads on demand. Native selection currently spans one editing instance; collaboration and custom plugins still need compatibility work. See the [integration contract and validation](../../demo/src/poc-virtualization/EDITOR-RESULTS.md).

```tsx
const scrollRef = useRef<HTMLDivElement>(null);

<div ref={scrollRef} style={{ height: 600, overflow: 'auto' }}>
  <RichEditor
    initialValue={savedState}
    onChange={save} // receives the full document
    virtualization={{ scrollContainer: scrollRef, preserveCapacity: 32 }}
  />
</div>;
```

Alternatively, inject the same recycler as a child plugin:

```tsx
import { RichEditor } from '@haklex/rich-editor';
import { VirtualizationPlugin } from '@haklex/rich-editor/virtualization';

<RichEditor initialValue={savedState} onChange={save}>
  <VirtualizationPlugin scrollContainer={scrollRef} />
</RichEditor>;
```

The scroll container must contain the editor; pass its DOM element, ref, or getter. Without an explicit container, the recycler finds the nearest scrolling ancestor, falling back to the window. `virtualization={false}` overrides a plugin. Options also accept `overscan` in pixels and `estimateBlockHeight(block, width)` for custom block estimates.

`preserveCapacity` defaults to **32 offscreen nodes**. Their portals, DOM and editor instances stay mounted in detached hosts. Returning to a preserved node keeps its internal state directly. Once the budget is exceeded, the least recently used offscreen node falls back to state capture and recycling; `0` always uses that fallback. Focused/composing nodes and retained async operations are excluded from eviction. Dormant DOM plugins are suspended, while node components remain mounted. Components with background work can use `useEditorBlock().active` to pause it.

The core exposes generic `EditorSurfacePlugin` and `EditorSurfacePlugins` extension points. The virtualization plugin owns its view, node preservation/LRU policy, measurement, scrolling and document bridge. `EditorSurfacePlugins` installs DOM/selection plugins in the selected view; save/history plugins remain on the document editor. `ActiveEditorScope` routes toolbar actions to the focused view editor, and `useActiveEditor()` exposes that editor. In composed modules, use `surfacePlugins` for DOM/selection plugins and `plugins` for document-level extensions, including `VirtualizationPlugin` itself. Do not put the surface-registering plugin inside `EditorSurfacePlugins`.

`useEditorBlock()` provides logical node state and `retain()` for UI/async operations. Retention also postpones a requested view switch until the operation commits. Built-in media uploads use this contract. Custom components need a fallback state adapter if their internal state must survive LRU eviction; details and dynamic components are already adapted. Dynamic `getState()` should return an independent snapshot, and `setState(undefined)` must reset a fresh binding.

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
