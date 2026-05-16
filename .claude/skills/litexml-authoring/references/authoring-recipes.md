# Authoring recipes and gotchas

Recurring patterns that come up when writing LiteXML fragments. Each entry is intentionally small — pull the matching one when you hit the situation.

## When to use CDATA

Wrap body content in `<![CDATA[ ... ]]>` whenever the body is opaque or contains characters that XML would otherwise escape:

| Situation                                        | Required?                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| `<excalidraw>` JSON snapshot                     | yes                                                                 |
| `<codeblock>` containing `<`, `>`, `&`, or `]]>` | yes                                                                 |
| `<codeblock>` containing only safe characters    | optional, but preferred for multi-line code                         |
| `<file>` body inside `<code-snippet>`            | same rules as `<codeblock>`                                         |
| `<mermaid>` source                               | optional; usually unnecessary because Mermaid syntax is XML-safe    |
| `<math>` equation                                | rarely needed; KaTeX source uses `\`, not XML metacharacters        |
| `<p>`, `<h1>`, `<li>`, `<td>` prose              | never — escape entities instead (`&amp;`, `&lt;`, `&gt;`, `&quot;`) |

CDATA inside `<codeblock>` and `<file>` is parsed via a small linkedom-specific extraction (`extractCdataText`). Do **not** nest CDATA sections or place trailing `]]>` inside the body.

## Block IDs (`id` attribute)

- **Omit** for fresh content. The hydrating editor generates an ID on insert.
- **Add** when later tool calls need to target the exact block, or when porting an existing document that already carries IDs (so cross-references / diff entries stay attached).
- The `id` attribute maps to `$.blockId`. It is preserved on round-trip (`litexml ... --format json` then back).
- Tags that accept `id`: every block-level tag in [`nodes-structural.md`](./nodes-structural.md) and [`nodes-extensions.md`](./nodes-extensions.md) except inline tags and `<tr>` / `<th>` / `<td>`.

## Quote attribution

`<blockquote>` accepts an optional `attribution` attribute. The reader emits `type: "rich-quote"` when present and `type: "quote"` when absent — both materialize as the same `RichQuoteNode` in the editor.

```xml
<blockquote attribution="— Wang Xizhi, Lantingji Xu">
  <p>未尝不临文嗟悼，不能喻之于怀。</p>
</blockquote>

<blockquote>
  <p>An unattributed quote.</p>
</blockquote>
```

## Nested block content vs inline content

Containers that hold a fresh `SerializedEditorState` (and therefore need block children, not inline text):

- `<alert>`
- `<banner>`
- `<nested-doc>`
- `<grid><cell>`

Always wrap the body in block tags (`<p>`, `<h2>`, `<ul>`, etc.):

```xml
<alert type="tip">
  <p>Wrap the body in a paragraph.</p>
</alert>

<!-- bad: bare text body -->
<alert type="tip">Bare text — works at parse time but won't round-trip cleanly.</alert>
```

`<details>` is different: it uses ordinary block children (no nested editor state). Either form is fine, but use `<p>` for consistency.

## Mixing extension tags with prose

If a fragment contains **any** LiteXML extension tag, the surrounding prose must also be expressed as LiteXML — Markdown is not parsed inside a LiteXML fragment.

```xml
<!-- correct -->
<h2>Install</h2>
<p>Run the command:</p>
<codeblock lang="bash">pnpm add @haklex/rich-editor</codeblock>
<p>Then import the editor.</p>

<!-- wrong: Markdown syntax inside a LiteXML fragment is rendered literally -->
## Install
Run the command:
<codeblock lang="bash">pnpm add @haklex/rich-editor</codeblock>
Then import the editor.
```

The right time to write pure Markdown is when the whole document has no extension tags. As soon as one shows up, lift the whole document into LiteXML.

## Choosing similar nodes

| Decision                                 | Use                               | Not                                           |
| ---------------------------------------- | --------------------------------- | --------------------------------------------- |
| Quoted external text                     | `<blockquote>`                    | `<alert>` (use for warnings/tips, not quotes) |
| Editorial warning                        | `<alert type="warning">`          | `<blockquote>`                                |
| Page-wide announcement                   | `<banner>`                        | `<alert>`                                     |
| Multi-column comparison data             | `<table>`                         | `<grid>`                                      |
| Multi-column editorial layout            | `<grid>`                          | `<table>`                                     |
| Inline citation                          | `<a>`                             | `<link-card>`                                 |
| Standalone reference deserving a preview | `<link-card>`                     | `<a>`                                         |
| YouTube / Vimeo embed                    | `<embed url="..." source="..."/>` | `<img>` (which would be a static thumbnail)   |
| Direct video asset                       | `<video src="..."/>`              | `<embed>`                                     |
| Single image                             | `<img>`                           | `<gallery>`                                   |
| Image set                                | `<gallery>`                       | many `<img>`                                  |
| Single-language code                     | `<codeblock>`                     | `<code-snippet>`                              |
| Multi-file example                       | `<code-snippet>`                  | repeated `<codeblock>`                        |
| Mermaid-expressible diagram              | `<mermaid>`                       | `<excalidraw>`                                |
| Opaque hand-drawn snapshot               | `<excalidraw>`                    | `<mermaid>`                                   |
| Inline equation                          | `<math>`                          | `<math display="block">`                      |
| Standalone equation                      | `<math display="block">`          | inline `<math>`                               |
| Collapsible secondary content            | `<details>`                       | `<spoiler>` (inline only)                     |
| Hidden inline reveal                     | `<spoiler>`                       | `<details>`                                   |
| Reader-visible callout                   | `<alert>` / `<banner>`            | `<comment>`                                   |
| Reviewer note (not for end readers)      | `<comment>`                       | `<alert>`                                     |
| Survey / live vote                       | `<poll>`                          | `<ul>` / `<ol>`                               |
| Static option list                       | `<ul>`                            | `<poll>`                                      |
| Task checklist                           | `<ul type="check">`               | `<poll>`                                      |
| Transcript                               | `<chat>`                          | `<blockquote>`                                |

## Validation

After producing or editing a LiteXML fragment, convert to compact JSON to confirm the registry parses every tag:

```bash
pnpm --silent litexml '<doc><p>Hello</p></doc>' --format json --compact
```

For round-trip verification on an article file:

```bash
litexml article.xml --format json -o /tmp/state.json
litexml /tmp/state.json --format markdown -o /tmp/article.md
```

Any node that disappears or changes shape across the round-trip is a writer/reader bug — file against `@haklex/rich-litexml`, not the CLI.

When `litexml` succeeds but a downstream editor cannot materialize a node, the consumer is missing that Haklex node class. The CLI registry is authoritative for what _can_ be parsed; node class registration is the consumer's responsibility.

## Adding a new node

If you find yourself wanting a tag that this skill does not document, the underlying machinery is in `packages/rich-litexml/`. Following its `CLAUDE.md`:

1. Add a writer in `packages/rich-litexml/src/writers/` (SerializedNode JSON → XML).
2. Add a reader in `packages/rich-litexml/src/readers/` (XML → SerializedNode JSON).
3. Register both in `createDefaultRegistry()` in `src/default-registry.ts`.
4. Add a roundtrip test in `tests/`.
5. Update this skill's [`nodes-extensions.md`](./nodes-extensions.md) so the new tag is discoverable from the authoring side.
