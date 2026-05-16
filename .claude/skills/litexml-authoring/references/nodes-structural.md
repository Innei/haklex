# Structural and inline-formatting nodes

Tags in this file are the standard CommonMark-shaped building blocks. They are always available without any extension package. Use them to build the prose around extension nodes. If a fragment contains **any** LiteXML extension tag, the surrounding prose must also be expressed via these tags — Markdown syntax is not parsed inside LiteXML fragments.

For the Haklex-specific tags (alerts, banners, code blocks, math, etc.), see [`nodes-extensions.md`](./nodes-extensions.md).

## Block tags

### `<p>` — paragraph

- **When**: Default container for ordinary prose. The body of nearly every block-level extension (`<alert>`, `<banner>`, `<details>`, `<nested-doc>`, `<grid><cell>`, `<blockquote>`, `<li>`) is one or more `<p>` elements.
- **Avoid when**: The content is a heading, list item, or any specialized container — use the matching tag instead.
- **Required**: none.
- **Optional**: `id` (sets `$.blockId` for stable references).
- **Body**: inline content (text, links, inline formatting tags, inline extension nodes).

```xml
<p>Plain prose with an <a href="https://example.com">inline link</a>.</p>
```

### `<h1>` … `<h6>` — headings

- **When**: Section hierarchy and document scan anchors.
- **Avoid when**: You only want to style text — headings imply structural meaning and contribute to the document outline.
- **Required**: none.
- **Optional**: `id`.
- **Body**: inline content.

```xml
<h2 id="install">Installation</h2>
```

### `<blockquote>` — quote

- **When**: Quoted external text or cited excerpt. The reader emits `type: "rich-quote"` when `attribution` is present, otherwise `type: "quote"`. Both hydrate to `RichQuoteNode` in the editor; the distinction is a writer-side optimization for fixtures without attribution.
- **Avoid when**: Warnings or editorial callouts — use `<alert>` or `<banner>`.
- **Required**: at least one block child (typically `<p>`).
- **Optional**: `id`, `attribution` (citation line — author, source, work).
- **Body**: block children.

```xml
<blockquote attribution="— Wang Xizhi, Lantingji Xu">
  <p>未尝不临文嗟悼，不能喻之于怀。</p>
</blockquote>
```

### `<ul>`, `<ol>` — lists

- **When**: Sequences of items. `<ul>` for unordered, `<ol>` for ordered. Set `type="check"` on `<ul>` for a task list.
- **Avoid when**: Two-dimensional comparison — use `<table>` or `<grid>`. Boolean survey choices — use `<poll>`.
- **Required**: one or more `<li>` children.
- **Optional on `<ul>`**: `id`, `type="check"`.
- **Optional on `<ol>`**: `id`, `start` (numeric starting value, default `1`).

```xml
<ul>
  <li><p>First</p></li>
  <li><p>Second</p></li>
</ul>

<ol start="3">
  <li><p>Third</p></li>
</ol>

<ul type="check">
  <li checked="true"><p>Done</p></li>
  <li checked="false"><p>Todo</p></li>
</ul>
```

### `<li>` — list item

- **Required**: at least one block child.
- **Optional**: `id`, `checked` (`"true"` / `"false"`, only meaningful inside `<ul type="check">`).
- **Body**: block children (usually a single `<p>`; nested `<ul>` / `<ol>` is allowed).

### `<table>`, `<tr>`, `<th>`, `<td>` — tables

- **When**: Dense factual comparison with rows and columns.
- **Avoid when**: Editorial multi-column layout — use `<grid>`.
- **Required**: `<table>` contains `<tr>`; each `<tr>` contains `<th>` or `<td>`; each cell contains block children (typically `<p>`).
- **Optional**: `id` on `<table>`.
- **Body**: cells contain `<p>` (or other block content). Header state is encoded by the tag — `<th>` for headers, `<td>` for data cells.

```xml
<table>
  <tr>
    <th><p>Tag</p></th>
    <th><p>Use</p></th>
  </tr>
  <tr>
    <td><p>p</p></td>
    <td><p>Paragraph</p></td>
  </tr>
</table>
```

### `<hr />` — horizontal rule

- **When**: Hard section break.
- **Required**: self-closing.
- **Optional**: `id`.

```xml
<hr />
```

## Inline tags

### `<a>` — link

- **When**: Inline citation or hyperlink.
- **Avoid when**: The URL deserves a rich preview — use `<link-card>` (see extensions).
- **Required**: `href` attribute.
- **Optional**: `target`, `title`.
- **Body**: inline children (text and inline formatting tags).

```xml
<a href="https://example.com" target="_blank" title="More info">Example</a>
```

`<a>` writers emit either `type: "link"` or `type: "autolink"` depending on origin; both hydrate to a `LinkNode`. From an authoring perspective, always emit `<a>`.

### `<br />` — line break

Soft break inside a paragraph. Self-closing.

### Inline formatting tags

These map to text-node format flags. Wrap inline text only.

| Format      | LiteXML                                                      |
| ----------- | ------------------------------------------------------------ |
| Bold        | `<b>text</b>` or `<strong>text</strong>`                     |
| Italic      | `<i>text</i>` or `<em>text</em>`                             |
| Strike      | `<s>text</s>`, `<del>text</del>`, or `<strike>text</strike>` |
| Underline   | `<u>text</u>`                                                |
| Inline code | `<code>text</code>`                                          |
| Subscript   | `<sub>text</sub>`                                            |
| Superscript | `<sup>text</sup>`                                            |
| Highlight   | `<mark>text</mark>`                                          |

These tags **must** appear inside an inline-accepting parent (`<p>`, `<h1>`-`<h6>`, `<li>`, `<th>`, `<td>`, etc.). Nesting is allowed: `<b><i>both</i></b>`.

## Cross-cutting rules

- **`id` attribute** on any block tag sets `$.blockId`, which is the Lexical-side anchor used by tool calls that need to target a specific block. Omit for fresh content; preserve when editing existing fragments.
- **Attribute quoting**: all attribute values must be quoted (`<p id="intro">`, not `<p id=intro>`).
- **XML escaping** in body text: `&amp;`, `&lt;`, `&gt;`, `&quot;`. Use CDATA when the body is opaque or contains many sensitive characters (typically only needed for code / drawing snapshots, not for ordinary prose).
- **Canonical tag names**: lowercase, hyphenated. Do not emit legacy aliases (`<linkcard>`, `<codesnippet>`, `<nesteddoc>`, `<code-block>`).
