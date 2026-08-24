---
name: litexml-authoring
description: Use when writing Haklex articles with Markdown plus LiteXML, choosing the appropriate Haklex node for content, authoring LiteXML fragments, or converting a LightXML/LiteXML string or file into Lexical SerializedEditorState JSON, Markdown, or Static Render HTML via the `litexml` CLI.
user_invocable: true
---

# LiteXML Authoring

Use this skill when an article needs Haklex-specific rich nodes, or when the user asks to convert LiteXML to Lexical JSON / Markdown / HTML via the `litexml` CLI.

The skill is split into a thin index (this file) plus per-topic references. Load the matching reference when you start the actual work — the index is intentionally short so the format decision table and node selection map fit in one read.

## References

| File                                                                   | When to load                                                                                                               |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [`references/cli.md`](./references/cli.md)                             | Running the `litexml` binary — every flag, every input/output mode, every runtime caveat.                                  |
| [`references/nodes-structural.md`](./references/nodes-structural.md)   | Authoring with structural tags (`<p>`, headings, lists, tables, links) and inline formatting (`<b>`, `<em>`, `<code>`, …). |
| [`references/nodes-extensions.md`](./references/nodes-extensions.md)   | Authoring with Haklex extension tags (media, code, math, callouts, containers, footnotes, chat, poll, …).                  |
| [`references/authoring-recipes.md`](./references/authoring-recipes.md) | CDATA usage, block IDs, nested-content rules, similar-node disambiguation, validation, adding new nodes.                   |

`packages/rich-editor/docs/markdown-flavor-litexml.md` is the canonical tag contract — read it before changing any tag name or attribute schema.

## Format decision

| Content requirement                                                     | Use                                                               |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Plain prose, headings, simple links, lists, quotes, tables, code fences | **Markdown**                                                      |
| Any Haklex extension tag is required                                    | **LiteXML** — for the whole fragment, including surrounding prose |
| A block needs stable identity for later edits                           | LiteXML with `id="..."` (maps to `$.blockId`)                     |
| Fresh poll/chat content                                                 | LiteXML without IDs — the reader mints them                       |

Once a fragment contains any LiteXML tag, **all** surrounding prose in that fragment must also be LiteXML. Markdown is not parsed inside a LiteXML fragment.

## CLI quick start

```bash
# inside the haklex monorepo
pnpm --silent litexml input.xml --format json --compact # → SerializedEditorState
pnpm --silent litexml input.xml --format markdown       # → Markdown
pnpm --silent litexml input.xml --format html --open    # → HTML preview, browser

# outside the monorepo
npx --yes -p @haklex/rich-litexml-cli litexml input.xml --format json
```

Full flag reference, output forms, theme/variant/lang options, error modes, validation pipelines: [`references/cli.md`](./references/cli.md).

## Node selection map

Detailed `When` / `Avoid when` / params / body rules for each tag live in [`nodes-structural.md`](./references/nodes-structural.md) and [`nodes-extensions.md`](./references/nodes-extensions.md). Use this table only to decide which reference to open.

| Need                                                   | Tag                                                                         | Reference  |
| ------------------------------------------------------ | --------------------------------------------------------------------------- | ---------- |
| Paragraph, heading, list, table, link, inline format   | `<p>` / `<h*>` / `<ul>` / `<ol>` / `<table>` / `<a>` / `<b>` / `<code>` / … | structural |
| Quote (with optional `attribution`)                    | `<blockquote>`                                                              | structural |
| Single image / multi-image / video / embed / link card | `<img>` / `<gallery>` / `<video>` / `<embed>` / `<link-card>`               | extensions |
| Downloadable file attachment                           | `<attachment>`                                                              | extensions |
| Code (single / multi-file)                             | `<codeblock>` / `<code-snippet>`                                            | extensions |
| Diagram (Mermaid / opaque)                             | `<mermaid>` / `<excalidraw>`                                                | extensions |
| Math (inline / block)                                  | `<math>` / `<math display="block">`                                         | extensions |
| Callout (semantic / page-wide)                         | `<alert>` / `<banner>`                                                      | extensions |
| Collapsible / nested doc / multi-column                | `<details>` / `<nested-doc>` / `<grid><cell>`                               | extensions |
| Inline annotation                                      | `<spoiler>` / `<ruby>` / `<mention>` / `<tag>` / `<comment>`                | extensions |
| Footnote                                               | `<footnote>` + `<footnote-section>`                                         | extensions |
| Chat / poll                                            | `<chat>` / `<poll>`                                                         | extensions |
| Remote interactive component (host catalog only)       | `<dynamic>`                                                                 | extensions |
| Internal review marker                                 | `<agent-diff>`                                                              | extensions |

## Cross-cutting rules

- Canonical lowercase tag names. Do **not** emit legacy aliases (`<linkcard>`, `<codesnippet>`, `<nesteddoc>`, `<code-block>`).
- Quote every attribute value.
- Escape XML-sensitive text (`&amp;`, `&lt;`, `&gt;`, `&quot;`). Use CDATA for opaque JSON, drawing snapshots, and multi-line code bodies.
- `<alert>`, `<banner>`, `<nested-doc>`, `<grid><cell>` hold a **fresh nested editor state** — wrap their body in block tags (`<p>`, `<h*>`, …), not bare text.
- A fragment that mixes any extension tag with prose must be wholly LiteXML; Markdown syntax is not parsed inside.
- `<dynamic>` URLs must come from the host project's component catalog — never invent one. See the extensions reference for the full catalog rule.

Details, gotchas, and the full disambiguation matrix: [`references/authoring-recipes.md`](./references/authoring-recipes.md).

## Validation

After producing or editing LiteXML, round-trip to compact JSON to confirm the registry parses every tag:

```bash
pnpm --silent litexml '<doc><p>Hello</p></doc>' --format json --compact
```

If the command succeeds but a downstream editor cannot materialize a node, the runtime is missing that Haklex node class — re-check the consumer's `nodes` registration, not the CLI.
