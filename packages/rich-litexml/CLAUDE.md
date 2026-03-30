# @haklex/rich-litexml

Bidirectional conversion between Lexical SerializedNode JSON and XML (lite XML format).
Pure functions — no Lexical editor instance required.

## Adding a New Node

When a new Lexical node type is created anywhere in haklex:

1. Add a writer in `src/writers/` — maps SerializedNode JSON → XML element
2. Add a reader in `src/readers/` — maps XML element → SerializedNode JSON
3. Register both in `createDefaultRegistry()` in `src/default-registry.ts`
4. Add a roundtrip test in `tests/`

### Writer/Reader Patterns by Node Category

- **Simple attributes** (image, video, link-card, embed): self-closing XML tag with attributes from JSON fields
- **Text content** (code-block, mermaid, katex): XML tag wrapping text content (e.g. `<codeblock lang="ts">code</codeblock>`)
- **Nested EditorState** (alert-quote, banner): XML tag wrapping recursively serialized children from the `content` field
- **Element with children** (details, spoiler): XML tag wrapping inline or block children
- **Inline** (mention, tag, footnote): inline XML tag within paragraph content

### Fallback

Unregistered nodes serialize as `<node type="..." data='{...}' />`. This preserves data
but is opaque to AI agents. Always register for best agent experience.
