---
name: litexml-authoring
description: Use when writing Haklex articles with Markdown plus LiteXML, choosing the appropriate Haklex node for content, authoring LiteXML fragments, or converting a LightXML/LiteXML string or file into Lexical SerializedEditorState JSON or Static Render HTML.
user_invocable: true
---

# LiteXML Authoring

Use this skill when an article needs Haklex-specific rich nodes or when the user asks to convert LightXML/LiteXML into Lexical JSON or Static Render HTML.

## Conversion CLI

The `@haklex/rich-litexml` package publishes the `litexml-to-lexical` binary.

| Input form           | Command                                               |
| -------------------- | ----------------------------------------------------- |
| File                 | `litexml-to-lexical input.xml > state.json`           |
| String               | `litexml-to-lexical '<p>Hello</p>' > state.json`      |
| Stdin                | `cat input.xml \| litexml-to-lexical - > state.json`  |
| Compact JSON         | `litexml-to-lexical input.xml --compact > state.json` |
| Explicit output file | `litexml-to-lexical input.xml -o state.json`          |

Inside this repository, use:

```bash
pnpm --silent litexml-to-lexical input.xml > state.json
pnpm --silent litexml-to-lexical '<p>Hello</p>' --compact
```

Outside this repository, use an installed package binary or:

```bash
npm exec --yes --package @haklex/rich-litexml -- litexml-to-lexical input.xml > state.json
```

The CLI emits a full Lexical `SerializedEditorState`, not only root children.

## HTML Preview CLI

The `@haklex/rich-compose` package publishes the `litexml-to-html` binary. It writes a browser-openable HTML preview and inlines `@haklex/rich-compose/style.css`.

The generated HTML is a self-contained React preview shell. The CLI embeds the original LiteXML as a JSON payload; the browser bundle then parses that LiteXML and renders it through the same Rich Compose renderer stack used by the static renderer.

| Input form           | Command                                                 |
| -------------------- | ------------------------------------------------------- |
| File to stdout       | `litexml-to-html input.xml > article.html`              |
| File to output       | `litexml-to-html input.xml -o article.html`             |
| String to output     | `litexml-to-html '<p>Hello</p>' -o article.html`        |
| Stdin                | `cat input.xml \| litexml-to-html - > article.html`     |
| Open browser preview | `litexml-to-html input.xml --open`                      |
| Write and open       | `litexml-to-html input.xml -o article.html --open`      |
| Dark theme           | `litexml-to-html input.xml --theme dark -o dark.html`   |
| Note/comment variant | `litexml-to-html input.xml --variant note -o note.html` |

Inside this repository, use:

```bash
pnpm --silent litexml-to-html input.xml -o article.html
pnpm --silent litexml-to-html input.xml --open
```

Outside this repository, use an installed package binary or:

```bash
npm exec --yes --package @haklex/rich-compose -- litexml-to-html input.xml -o article.html
```

## Format Decision

| Content requirement                                                     | Preferred format                                                  |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Plain prose, headings, simple links, lists, quotes, tables, code fences | Markdown                                                          |
| Haklex-only decorator nodes or semantic containers                      | LiteXML                                                           |
| A fragment that mixes extension nodes with normal prose                 | LiteXML for the whole fragment; wrap prose in `<p>`, `<h2>`, etc. |
| A block needs stable identity for later edits                           | Add `id="..."`; it maps to `$.blockId`                            |
| Fresh poll/chat content                                                 | Omit generated IDs unless stable references are required          |

Read `packages/rich-editor/docs/markdown-flavor-litexml.md` for the complete canonical tag contract before changing tag names or attributes.

## Node Selection Guide

| Node                                  | Use when                                                                | Avoid when                                                                |
| ------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `<p>`                                 | Ordinary prose paragraph.                                               | The content is a heading, list item, or specialized callout.              |
| `<h1>`-`<h6>`                         | Section hierarchy and scan anchors.                                     | Styling text without creating document structure.                         |
| `<blockquote>`                        | Quoted external text or cited excerpt.                                  | Warnings or editorial callouts; use `<alert>` or `<banner>`.              |
| `<ul>`, `<ol>`                        | Ordered or unordered sequences.                                         | Two-dimensional comparison; use `<table>` or `<grid>`.                    |
| `<ul type="check">`                   | Task state or checklist content.                                        | Boolean survey choices; use `<poll>`.                                     |
| `<table>`                             | Dense factual comparison with rows and columns.                         | Responsive editorial layout; use `<grid>`.                                |
| `<img>`                               | A single image with optional caption and dimensions.                    | Multiple related images; use `<gallery>`.                                 |
| `<video>`                             | A playable media item.                                                  | External platform embeds; use `<embed>`.                                  |
| `<link-card>`                         | A rich preview for an important standalone URL.                         | Ordinary inline citation; use `<a>`.                                      |
| `<embed>`                             | External interactive/media embed such as YouTube or another provider.   | Static screenshots; use `<img>`.                                          |
| `<codeblock>`                         | One code listing with one language.                                     | Multi-file examples; use `<code-snippet>`.                                |
| `<code-snippet>`                      | Multi-file code examples or a named file set.                           | A short inline code phrase; use `<code>`.                                 |
| `<mermaid>`                           | Diagrams expressible as Mermaid source.                                 | Hand-drawn or freeform diagrams; use `<excalidraw>`.                      |
| `<math>`                              | Inline equation; add `display="block"` for standalone equations.        | Ordinary code or variables that should not render as math.                |
| `<alert>`                             | Semantic admonitions such as note, warning, tip, important, or caution. | Promotional or high-level announcement blocks; use `<banner>`.            |
| `<banner>`                            | Prominent editorial notice, announcement, or contextual banner.         | Inline warning within a paragraph; use `<alert>`.                         |
| `<details>`                           | Optional secondary explanation that should be collapsible.              | Required content the reader must see immediately.                         |
| `<nested-doc>`                        | A nested editable document section with its own block content.          | Simple grouped layout; use `<grid>` or normal sections.                   |
| `<grid>`                              | Editorial layout with independent cells.                                | Data tables requiring row/column semantics; use `<table>`.                |
| `<gallery>`                           | Related image set.                                                      | A single figure; use `<img>`.                                             |
| `<spoiler>`                           | Hidden inline text that should be intentionally revealed.               | Collapsible block explanations; use `<details>`.                          |
| `<ruby>`                              | East Asian base text with pronunciation/reading.                        | Simple parenthetical explanation.                                         |
| `<mention>`                           | A person/account reference with platform and handle metadata.           | Plain prose names with no identity metadata.                              |
| `<tag>`                               | Inline topical label.                                                   | Section categories that should be headings.                               |
| `<comment>`                           | Inline annotation or reviewer note embedded in content.                 | Reader-facing aside; use prose, `<alert>`, or `<details>`.                |
| `<footnote>` and `<footnote-section>` | Academic-style references and explanatory notes.                        | Primary content that belongs in the body.                                 |
| `<chat>`                              | Conversation transcript or user-agent exchange.                         | A normal quoted passage; use `<blockquote>`.                              |
| `<poll>`                              | Reader choice, vote, or survey interaction.                             | Static list of options; use `<ul>` or `<ol>`.                             |
| `<excalidraw>`                        | Opaque Excalidraw snapshot that must be preserved.                      | Mermaid-compatible diagrams.                                              |
| `<agent-diff>`                        | Internal agent review/diff markers.                                     | Normal article authoring; do not introduce unless implementing review UI. |

## Quote Attribution

`<blockquote>` accepts an optional `attribution` attribute for the citation line (author, source, work). Omit when the quote has no source.

```xml
<blockquote attribution="— Wang Xizhi, Lantingji Xu">
  <p>未尝不临文嗟悼，不能喻之于怀。</p>
</blockquote>
```

The reader emits `type: "rich-quote"` when `attribution` is present, otherwise `type: "quote"`. Both hydrate to `RichQuoteNode` in the editor; the distinction is a writer-side optimization for fixtures without attribution.

## Extension Node Parameters

All block-like extension tags may use `id="..."` when a stable Lexical `$.blockId` is needed. Omit `id` for fresh authored content unless later tool calls need to target that exact block.

| Tag                  | Required                                 | Optional                                                         | Children / Body                                                                                    | Notes                                                                                                                                                                                                                                                                  |
| -------------------- | ---------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<img>`              | `src`                                    | `id`, `alt`, `width`, `height`, `caption`, `thumbhash`, `accent` | Self-closing.                                                                                      | `width` and `height` are numbers. `accent` is a color string used by image rendering. Inside `<gallery>`, `<img>` becomes a gallery image item rather than a standalone image node.                                                                                    |
| `<video>`            | `src`                                    | `id`, `poster`, `width`, `height`                                | Self-closing.                                                                                      | Use for direct video assets. `poster` is the preview image URL.                                                                                                                                                                                                        |
| `<link-card>`        | `url`                                    | `id`, `source`, `title`, `description`, `favicon`, `image`       | Self-closing.                                                                                      | Use for rich previews of standalone references.                                                                                                                                                                                                                        |
| `<embed>`            | `url`                                    | `id`, `source`                                                   | Self-closing.                                                                                      | Use for provider embeds. `source` is a provider hint such as a platform name.                                                                                                                                                                                          |
| `<codeblock>`        | none                                     | `id`, `lang`                                                     | Raw code text.                                                                                     | Use `lang` for syntax highlighting. For shebangs, imports, template strings, XML-sensitive characters, or multi-line code, prefer `<![CDATA[...]]>` so the exact code body is preserved.                                                                               |
| `<code-snippet>`     | none                                     | `id`                                                             | One or more `<file name="..." lang="...">code</file>`.                                             | Each `<file>` requires `name`; `lang` is optional but recommended. Use CDATA inside `<file>` for multi-line code or XML-sensitive source. Use for multi-file examples.                                                                                                 |
| `<mermaid>`          | none                                     | `id`                                                             | Mermaid diagram source text.                                                                       | Use escaped newlines (`&#10;`) or normal element text. Do not use for arbitrary drawings.                                                                                                                                                                              |
| `<math>`             | equation body                            | `display`, `color`                                               | Equation text.                                                                                     | Omit `display` for inline math. Use `display="block"` for standalone math. `color` only applies to inline math.                                                                                                                                                        |
| `<alert>`            | none                                     | `id`, `type`                                                     | Nested LiteXML block content, usually `<p>...</p>`.                                                | `type`: `note`, `tip`, `important`, `warning`, or `caution`. Defaults to `note`.                                                                                                                                                                                       |
| `<banner>`           | none                                     | `id`, `type`                                                     | Nested LiteXML block content.                                                                      | Common types include `note`, `tip`, `important`, `warning`, `caution`; existing renderer data also uses informational variants such as `info` and `success`. Prefer semantic consistency with the target renderer.                                                     |
| `<nested-doc>`       | none                                     | `id`                                                             | Nested LiteXML block content.                                                                      | Creates a nested editor state. Use for independently editable nested content.                                                                                                                                                                                          |
| `<details>`          | none                                     | `id`, `summary`, `open`                                          | Child block nodes.                                                                                 | `summary` is the visible collapsed label. `open="true"` starts expanded; omit or set false for collapsed.                                                                                                                                                              |
| `<grid>`             | none                                     | `id`, `cols`, `gap`                                              | One or more `<cell>...</cell>` children.                                                           | `cols` is numeric and defaults to `2`. `gap` defaults to `16px`. Each `<cell>` contains LiteXML block content.                                                                                                                                                         |
| `<gallery>`          | one or more child images                 | `id`, `layout`                                                   | Child `<img src="..." alt="..." />` elements.                                                      | `layout` defaults to `grid`; use only image children.                                                                                                                                                                                                                  |
| `<excalidraw>`       | snapshot body or `snapshot`              | `id`, `snapshot`                                                 | Prefer CDATA snapshot body for JSON.                                                               | Use `<![CDATA[...]]>` for opaque Excalidraw JSON. Empty snapshots may be self-closing.                                                                                                                                                                                 |
| `<spoiler>`          | none                                     | none                                                             | Inline children.                                                                                   | Use inside paragraph-like inline content.                                                                                                                                                                                                                              |
| `<ruby>`             | base text body                           | `rt`                                                             | Inline children for base text.                                                                     | `rt` is the reading/pronunciation.                                                                                                                                                                                                                                     |
| `<mention>`          | `platform`, `handle`                     | none                                                             | Display name text.                                                                                 | Body defaults to display name. Preserve `platform` and `handle` for identity metadata.                                                                                                                                                                                 |
| `<tag>`              | text body                                | none                                                             | Plain text.                                                                                        | Produces an inline tag node.                                                                                                                                                                                                                                           |
| `<comment>`          | text body                                | none                                                             | Plain text.                                                                                        | Produces an inline comment annotation node.                                                                                                                                                                                                                            |
| `<footnote>`         | `ref`                                    | none                                                             | Self-closing.                                                                                      | References a definition in `<footnote-section>`.                                                                                                                                                                                                                       |
| `<footnote-section>` | one or more definitions                  | `id`                                                             | `<def ref="...">definition text</def>`.                                                            | Keep `ref` values aligned with `<footnote ref="..."/>`.                                                                                                                                                                                                                |
| `<chat>`             | participants and messages                | `id`, `variant`                                                  | `<participants><participant ... /></participants><messages><message ...>...</message></messages>`. | `variant`: `user-agent` or `user-user`; defaults to `user-agent`. Participant `kind`: `user` or `agent`. Participant optional attrs: `id`, `name`, `avatar`; missing `id` is generated. Message optional attrs: `id`; `participant` should reference a participant id. |
| `<poll>`             | `<question>` plus one or more `<option>` | `id`, `poll-id`, `mode`, `close-at`, `show-results`              | `<question>...</question><option id="...">...</option>`.                                           | `mode`: `single` or `multiple`. `show-results`: `always`, `after-vote`, or `after-close`. `close-at` is an ISO-like timestamp string. For new polls, omit `poll-id` and option `id`; the reader mints IDs. Preserve existing IDs when editing.                         |
| `<agent-diff>`       | none                                     | `id`, `op`, `entry`                                              | Self-closing.                                                                                      | Internal review marker. `op` defaults to `insert`; `entry` links to a diff entry id. Avoid in normal articles.                                                                                                                                                         |

## Authoring Rules

- Use canonical lowercase tags. Do not emit legacy aliases such as `<linkcard>`, `<codesnippet>`, or `<nesteddoc>`.
- Use `<codeblock>`, not `<code-block>`.
- Quote all attribute values.
- Escape XML-sensitive text: `&amp;`, `&lt;`, `&gt;`, and `&quot;`.
- Use CDATA for opaque JSON, drawing snapshots, and multi-line code bodies.
- Use nested LiteXML block children inside `<alert>`, `<banner>`, `<nested-doc>`, `<details>`, `<grid><cell>`, and similar containers.
- Do not rely on Markdown syntax inside a LiteXML fragment. If the fragment contains LiteXML extension tags, represent surrounding text as LiteXML blocks.

## Validation

For generated LiteXML, validate the resulting Lexical JSON before handing it off:

```bash
pnpm --silent litexml-to-lexical '<doc><p>Hello</p></doc>' --compact
```

If the command succeeds but a downstream editor cannot materialize a node, check whether that runtime has registered the corresponding Haklex node class.
