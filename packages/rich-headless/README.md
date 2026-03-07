# @haklex/rich-headless

Zero-React headless Lexical node registry for server-side parsing. Convert Lexical editor state JSON to Markdown without any browser or React dependency.

## Installation

```bash
pnpm add @haklex/rich-headless lexical
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `lexical` | `^0.41.0` |

## Usage

```ts
import { createHeadlessEditor } from '@lexical/headless'
import { allHeadlessNodes, $toMarkdown } from '@haklex/rich-headless'

const editor = createHeadlessEditor({ nodes: allHeadlessNodes })
editor.setEditorState(editor.parseEditorState(jsonString))
editor.read(() => {
  const markdown = $toMarkdown()
})
```

## Exports

### Node Registries

| Export | Description |
| --- | --- |
| `allHeadlessNodes` | All headless nodes (builtin + custom) |
| `builtinNodes` | Lexical builtin nodes (Heading, Quote, List, Link, Table, Code, HorizontalRule) |
| `customHeadlessNodes` | Custom headless nodes only |

### Node Classes

| Export | Description |
| --- | --- |
| `SpoilerNode` | Spoiler/hidden text (inline) |
| `RubyNode` | Ruby annotation (inline) |
| `DetailsNode` | Collapsible details block |
| `ImageNode` | Image |
| `VideoNode` | Video |
| `LinkCardNode` | Rich link card |
| `KaTeXInlineNode` | Inline KaTeX equation |
| `KaTeXBlockNode` | Block KaTeX equation |
| `MermaidNode` | Mermaid diagram |
| `MentionNode` | User mention (inline) |
| `CodeBlockNode` | Code block with language |
| `FootnoteNode` | Footnote reference (inline) |
| `FootnoteSectionNode` | Footnote definitions section |
| `EmbedNode` | Embedded content (iframe) |
| `CodeSnippetNode` | Multi-file code snippet |
| `GalleryNode` | Image gallery |
| `ExcalidrawNode` | Excalidraw drawing |
| `BannerNode` | Banner/callout with nested content |
| `AlertQuoteNode` | GitHub-style alert quote with nested content |
| `NestedDocNode` | Nested document with nested content |
| `GridContainerNode` | Grid layout container with cells |

### Markdown Conversion

| Export | Description |
| --- | --- |
| `$toMarkdown()` | Convert the current editor state to Markdown (call inside `editor.read()`) |
| `allHeadlessTransformers` | All Lexical-to-Markdown transformers |

### Sub-path Exports

| Import Path | Description |
| --- | --- |
| `@haklex/rich-headless` | All nodes, registries, and `$toMarkdown` |
| `@haklex/rich-headless/transformers` | Transformers only |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
