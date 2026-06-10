# Haklex extension nodes

These tags are not part of CommonMark. Each one maps to a Haklex-specific Lexical node and is the only way to author content that those node renderers can pick up. For prose scaffolding (paragraphs, lists, tables, links, inline formatting) see [`nodes-structural.md`](./nodes-structural.md).

Every block-level extension may carry `id="..."` → `$.blockId`. Omit for fresh authoring; preserve when editing.

## Media

### `<img>` — image

- **When**: A single image, optionally with caption and explicit dimensions.
- **Avoid when**: Multiple related images — use `<gallery>`. Decorative inline glyph — use the renderer's icon system.
- **Required**: `src`.
- **Optional**: `id`, `alt`, `width` (numeric), `height` (numeric), `caption`, `thumbhash`, `accent` (color string for image rendering).
- **Body**: self-closing.
- **Inside `<gallery>`**: `<img>` becomes a gallery image item instead of a standalone image node — only `src` and `alt` are read.

```xml
<img src="/photo.jpg" alt="Cover" width="1200" height="800" caption="At dusk." accent="#ff8855" />
```

### `<video>` — video

- **When**: A directly playable video asset.
- **Avoid when**: Provider-hosted clip (YouTube, Vimeo) — use `<embed>`.
- **Required**: `src`.
- **Optional**: `id`, `poster` (preview image URL), `width`, `height`.
- **Body**: self-closing.

```xml
<video src="/clip.mp4" poster="/thumb.jpg" />
```

### `<link-card>` — rich link preview

- **When**: A standalone reference URL that deserves a visible card (title, description, favicon, hero image).
- **Avoid when**: Inline citation in the middle of prose — use `<a>`.
- **Required**: `url`.
- **Optional**: `id`, `source`, `title`, `description`, `favicon`, `image`.
- **Body**: self-closing.

```xml
<link-card url="https://haklex.dev"
           title="Haklex"
           description="Lexical-based rich editor ecosystem."
           favicon="https://haklex.dev/icon.svg" />
```

### `<embed>` — provider embed

- **When**: A third-party provider embed such as YouTube, Vimeo, CodePen, Tweet, etc. The renderer detects the provider and produces the right iframe / oEmbed payload.
- **Avoid when**: A static screenshot — use `<img>`.
- **Required**: `url`.
- **Optional**: `id`, `source` (provider hint, e.g. `youtube`, `vimeo`).
- **Body**: self-closing.

```xml
<embed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" source="youtube" />
```

### `<gallery>` — image gallery

- **When**: A related image set displayed together.
- **Avoid when**: A single figure — use `<img>`.
- **Required**: one or more `<img>` children.
- **Optional**: `id`, `layout` (defaults to `grid`).
- **Body**: only `<img src="..." alt="..." />` children. Other tags are ignored.

```xml
<gallery layout="grid">
  <img src="/a.jpg" alt="A" />
  <img src="/b.jpg" alt="B" />
  <img src="/c.jpg" alt="C" />
</gallery>
```

## Code

### `<codeblock>` — single code listing

- **When**: One code listing in a single language.
- **Avoid when**: Multi-file example (e.g. `index.ts` + `package.json`) — use `<code-snippet>`. Short inline phrase — use `<code>`.
- **Required**: none (empty body is allowed).
- **Optional**: `id`, `lang`.
- **Body**: raw code text. For shebangs, imports, template strings, XML-sensitive characters (`<`, `&`), or multi-line code, prefer `<![CDATA[...]]>` so the body is preserved verbatim.

```xml
<codeblock lang="ts"><![CDATA[
import { foo } from './bar';
const x = <T>(t: T): T => t;
]]></codeblock>
```

Note: the canonical tag is `<codeblock>`, **not** `<code-block>`.

### `<code-snippet>` — multi-file code example

- **When**: An example that spans multiple named files.
- **Avoid when**: Single file — use `<codeblock>`.
- **Required**: one or more `<file name="..." lang="...">code</file>` children.
- **Optional on `<code-snippet>`**: `id`.
- **Required on `<file>`**: `name`.
- **Optional on `<file>`**: `lang`.
- **Body of `<file>`**: raw code text; use CDATA for multi-line or XML-sensitive code.

```xml
<code-snippet>
  <file name="index.ts" lang="ts"><![CDATA[
export const main = () => console.log('hi');
]]></file>
  <file name="package.json" lang="json"><![CDATA[
{ "type": "module" }
]]></file>
</code-snippet>
```

## Math

### `<math>` — inline or block equation

- **When**: A KaTeX equation.
- **Required**: equation text in the body.
- **Optional**: `display` (`"block"` for standalone equation; omit for inline), `color` (only honored on inline math).
- **Body**: equation source.

```xml
<p>Inline: <math>E = mc^2</math>.</p>

<math display="block">\int_0^1 x^2\, dx = \tfrac{1}{3}</math>

<p><math color="#ff5577">a^2 + b^2 = c^2</math></p>
```

The reader chooses `katex-block` vs `katex-inline` based on `display`. Block math is rendered in its own block; inline math sits inside paragraph text.

## Diagrams

### `<mermaid>` — Mermaid diagram

- **When**: A diagram expressible as Mermaid source.
- **Avoid when**: Freeform / hand-drawn diagram — use `<excalidraw>`.
- **Required**: none.
- **Optional**: `id`.
- **Body**: Mermaid source text. Use `&#10;` to encode newlines if you must keep the body on one line; otherwise normal element text with real newlines is fine.

```xml
<mermaid>
flowchart LR
  A --> B
  B --> C
</mermaid>
```

### `<excalidraw>` — opaque Excalidraw snapshot

- **When**: An opaque drawing snapshot that must round-trip exactly.
- **Avoid when**: A diagram you would otherwise express in Mermaid — pick `<mermaid>`.
- **Required**: snapshot body (preferred) or `snapshot` attribute (legacy).
- **Optional**: `id`, `snapshot` (legacy attribute form).
- **Body**: one of three forms (see `parseSnapshot` in `rich-ext-excalidraw/src/types.ts`):
  - **inline** — opaque JSON inside `<![CDATA[...]]>`;
  - **remote** — a single line starting with `http`, `blob:`, or `ref:` pointing at an uploaded `.excalidraw` file (no CDATA needed; URLs are XML-safe);
  - **delta** — a remote base URL on the first line followed by a JSON delta object (remote base + local edits).
- Empty snapshots may be self-closing.

```xml
<excalidraw><![CDATA[{"elements":[],"appState":{}}]]></excalidraw>

<excalidraw>https://cdn.example.com/uploads/diagram.excalidraw</excalidraw>
```

## Callouts and admonitions

### `<alert>` — semantic admonition

- **When**: Inline-of-section semantic admonitions (note, tip, warning, important, caution).
- **Avoid when**: Top-of-page announcement — use `<banner>`.
- **Required**: none (empty body allowed).
- **Optional**: `id`, `type` (`note` default | `tip` | `important` | `warning` | `caution`).
- **Body**: nested LiteXML block content (usually `<p>...</p>`). Stored as a nested `SerializedEditorState`.

```xml
<alert type="warning">
  <p>This operation cannot be undone.</p>
</alert>
```

### `<banner>` — prominent editorial notice

- **When**: Page-level announcement or contextual banner.
- **Avoid when**: Inline admonition — use `<alert>`.
- **Required**: none.
- **Optional**: `id`, `type`. Renderer-supported values include `note`, `tip`, `important`, `warning`, `caution`, plus informational `info` and `success`. Pick the value consistent with the target renderer.
- **Body**: nested LiteXML block content.

```xml
<banner type="info">
  <p>The article was updated on 2026-05-16.</p>
</banner>
```

## Containers

### `<details>` — collapsible

- **When**: Optional secondary explanation that should default to collapsed.
- **Avoid when**: Required reading — render inline.
- **Required**: none.
- **Optional**: `id`, `summary` (visible collapsed label), `open` (`"true"` to start expanded; omit otherwise).
- **Body**: block children.

```xml
<details summary="Implementation notes" open="false">
  <p>Internals…</p>
</details>
```

### `<nested-doc>` — independently editable nested document

- **When**: A nested editor state that the consumer renders or edits as its own document.
- **Avoid when**: Plain grouping — use `<grid>` or just sequential blocks.
- **Required**: none.
- **Optional**: `id`.
- **Body**: nested LiteXML block content (becomes its own `SerializedEditorState`).

```xml
<nested-doc>
  <h3>Nested section</h3>
  <p>Body.</p>
</nested-doc>
```

### `<grid>` — editorial multi-column layout

- **When**: Two-up / three-up editorial layout where each cell is independent.
- **Avoid when**: Data with row/column semantics — use `<table>`.
- **Required**: one or more `<cell>...</cell>` children.
- **Optional**: `id`, `cols` (numeric, default `2`), `gap` (CSS length string, default `16px`).
- **Body of `<cell>`**: nested LiteXML block content (becomes its own `SerializedEditorState`).

```xml
<grid cols="3" gap="24px">
  <cell><h3>A</h3><p>One</p></cell>
  <cell><h3>B</h3><p>Two</p></cell>
  <cell><h3>C</h3><p>Three</p></cell>
</grid>
```

## Inline annotations

### `<spoiler>` — hidden inline text

- **When**: Text the reader can intentionally reveal.
- **Avoid when**: A collapsible block — use `<details>`.
- **Required**: none.
- **Optional**: none.
- **Body**: inline children. Must appear inside an inline-accepting parent (e.g. `<p>`).

```xml
<p>The killer is <spoiler>the butler</spoiler>.</p>
```

### `<ruby>` — East Asian ruby annotation

- **When**: A base text needs a pronunciation/reading overlay.
- **Avoid when**: A plain parenthetical — use prose.
- **Required**: base text in the body.
- **Optional**: `rt` (the reading).
- **Body**: inline base text.

```xml
<p><ruby rt="haklex">Haklex</ruby> エディタ。</p>
```

### `<mention>` — handle reference

- **When**: A person or account reference that carries platform + handle metadata.
- **Avoid when**: Plain name with no identity metadata — write prose.
- **Required**: `platform`, `handle`.
- **Optional**: none.
- **Body**: display name text. Defaults to handle if empty.

```xml
<p>Author: <mention platform="github" handle="innei">Innei</mention>.</p>
```

### `<tag>` — inline topical label

- **When**: An inline tag chip (`#ai`, `#editor`).
- **Avoid when**: A document-level section category — use a heading.
- **Required**: text body.
- **Optional**: none.
- **Body**: plain text.

```xml
<p>Topics: <tag>AI</tag> <tag>Lexical</tag>.</p>
```

### `<comment>` — inline reviewer annotation

- **When**: An inline note that should render as a reviewer comment (yellow highlight, side margin marker, etc.).
- **Avoid when**: Reader-facing aside — use prose, `<alert>`, or `<details>`.
- **Required**: text body.
- **Optional**: none.
- **Body**: plain text.

```xml
<p>The pipeline scales linearly<comment>citation needed</comment>.</p>
```

### `<footnote>` and `<footnote-section>` — footnotes

- **When**: Academic-style references with collapsible definitions.
- **Avoid when**: Primary content — keep it in the body.

`<footnote>`:

- **Required**: `ref` — must match a `<def ref="...">` later.
- **Optional**: none.
- **Body**: self-closing.

`<footnote-section>`:

- **Required**: one or more `<def ref="...">definition text</def>`.
- **Optional**: `id` on `<footnote-section>`.
- **Body**: `<def>` children only.

```xml
<p>Lexical 0.44<footnote ref="1" /> is the runtime.</p>
…
<footnote-section>
  <def ref="1">See Facebook's Lexical 0.44 release notes.</def>
</footnote-section>
```

## Interactive

### `<chat>` — conversation transcript

- **When**: A user/agent or user/user transcript that should render as chat bubbles.
- **Avoid when**: A normal quote — use `<blockquote>`.
- **Required**: `<participants>` block + `<messages>` block.
- **Optional on `<chat>`**: `id`, `variant` (`user-agent` default | `user-user`).
- **Required on `<participant>`**: `kind` (`user` | `agent`).
- **Optional on `<participant>`**: `id` (auto-minted if missing), `name`, `avatar`.
- **Required on `<message>`**: `participant` (matching a participant `id`).
- **Optional on `<message>`**: `id` (auto-minted if missing).
- **Body of `<message>`**: plain text.

```xml
<chat variant="user-agent">
  <participants>
    <participant id="u1" kind="user" name="Innei" />
    <participant id="a1" kind="agent" name="Haklex" />
  </participants>
  <messages>
    <message id="m1" participant="u1">How do I add a node?</message>
    <message id="m2" participant="a1">Register a reader and a writer in default-registry.ts.</message>
  </messages>
</chat>
```

### `<poll>` — reader choice / survey

- **When**: A live poll readers can vote on.
- **Avoid when**: A static list of options — use `<ul>` / `<ol>`.
- **Required**: one `<question>` + one or more `<option>`.
- **Optional on `<poll>`**: `id`, `poll-id` (auto-minted if missing), `mode` (`single` default | `multiple`), `close-at` (ISO-like timestamp), `show-results` (`always` | `after-vote` | `after-close`).
- **Optional on `<option>`**: `id` (auto-minted if missing).
- **Body of `<question>`** / **`<option>`**: plain text.

```xml
<poll mode="single" show-results="after-vote">
  <question>Pick a runtime</question>
  <option>Bun</option>
  <option>Node</option>
  <option>Deno</option>
</poll>
```

For freshly authored polls, **omit** `poll-id` and option `id` — the reader mints them. Preserve them when editing an existing poll so vote counts stay attached to the right option.

## Internal / agent

### `<agent-diff>` — review/diff marker

- **When**: Internal agent review UI rendering inline diff markers.
- **Avoid when**: Normal article authoring — do not introduce unless implementing the review pipeline.
- **Required**: none.
- **Optional**: `id`, `op` (defaults to `insert`), `entry` (id of a diff entry to link to).
- **Body**: self-closing.

```xml
<agent-diff op="insert" entry="diff-7" />
```

## Cross-cutting rules

- **`id` attribute** on any block-level extension sets `$.blockId`. Omit for fresh content; preserve when editing.
- **Quoting**: all attribute values must be quoted.
- **Escaping**: in element text, escape `&` `<` `>` `"` as `&amp;` `&lt;` `&gt;` `&quot;`.
- **CDATA**: required for opaque JSON snapshots (`<excalidraw>`), strongly recommended for multi-line or XML-sensitive code bodies (`<codeblock>`, `<code-snippet><file>`).
- **Nested block content** is required inside `<alert>`, `<banner>`, `<nested-doc>`, `<details>`, `<grid><cell>`. The body becomes a fresh `SerializedEditorState` rooted at the container, so Markdown does **not** work inside them.
- **Canonical tag names** only. Do not emit legacy aliases (`<linkcard>`, `<codesnippet>`, `<nesteddoc>`, `<code-block>`).
- **Unregistered tags** serialize to `<node type="..." data='{...}' />` — data is preserved but opaque. Always prefer a registered tag.
