# LiteXML CLI: multi-format export

**Date**: 2026-05-14
**Status**: Spec — ready for implementation planning

## Background

Today the LiteXML CLI surface is split across two packages:

- `@haklex/rich-litexml` ships `litexml-to-lexical`, which converts LiteXML → Lexical `SerializedEditorState` JSON.
- `@haklex/rich-compose` ships `litexml-to-html`, which converts LiteXML → a self-contained HTML preview document (CSS + client hydration bundle inlined).

Markdown is already available programmatically through `@haklex/rich-headless` (`$toMarkdown()` + `allHeadlessNodes`), used today by `mx-core` to materialize Lexical JSON as Markdown for search and feed output. There is no CLI surface for Markdown.

The goal of this spec is to consolidate the CLI surface into a single command that supports all three output formats (HTML, JSON, Markdown), accepts both LiteXML and Lexical JSON as input, and lives in a dedicated thin package so neither `rich-litexml` (pure conversion, no heavy deps) nor `rich-compose` (rendering engine) needs to carry CLI plumbing.

## Goals

- One unified CLI command — `litexml` — replacing the two existing bins.
- Three output formats selected by `--format html | json | markdown`.
- Two accepted input formats — LiteXML and Lexical JSON — with content-based auto-detection and an explicit override.
- Full coverage of all haklex node types in the Markdown path (mentions, footnotes, spoilers, KaTeX, code blocks, tables, etc.) by reusing the existing `$toMarkdown()` pipeline in `@haklex/rich-headless`.
- Old bins (`litexml-to-lexical`, `litexml-to-html`) are removed cleanly in the same release. No shim, no alias.

## Non-Goals

- No Markdown flavor switch (GFM-only, no frontmatter, no sanitize options). The single Markdown output mirrors what `$toMarkdown()` produces today.
- No new node coverage work. The CLI is a wiring layer — it surfaces what the underlying packages already do.
- No streaming, no watch mode, no daemon. One-shot conversion only.
- No backwards-compatibility shim for the old bin names.

## Package Structure

A new package `@haklex/rich-litexml-cli` (path `packages/rich-litexml-cli/`):

```
packages/rich-litexml-cli/
├── src/
│   ├── cli.ts              # Entry point, arg parsing, dispatch
│   ├── input.ts            # Reads input, auto-detects litexml vs json
│   ├── formats/
│   │   ├── json.ts         # SerializedEditorState → JSON string
│   │   ├── markdown.ts     # SerializedEditorState → Markdown
│   │   └── html.ts         # SerializedEditorState → HTML preview document
│   └── shared/
│       ├── parse-litexml.ts
│       └── help.ts
├── tests/
│   ├── input-detect.test.ts
│   ├── format-json.test.ts
│   ├── format-markdown.test.ts
│   ├── format-html.test.ts
│   ├── cli-integration.test.ts
│   └── errors.test.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Runtime dependencies:

- `@haklex/rich-litexml` — LiteXML parser + default registry.
- `@haklex/rich-headless` — `createHeadlessEditor` equivalent surface (`allHeadlessNodes`, `$toMarkdown`).
- `@lexical/headless` — to instantiate a headless editor for the Markdown path.
- `@haklex/rich-compose` — for the HTML preview assets (CSS bundle + client hydration JS) consumed at runtime.

Version is held in lockstep with the rest of `@haklex/*` and participates in `pnpm release:rich`.

### Removals

Same release deletes:

- `packages/rich-litexml/package.json` → drop `bin` and `publishConfig.bin`.
- `packages/rich-litexml/src/cli.ts`.
- `packages/rich-compose/package.json` → drop `bin` and `publishConfig.bin`.
- `packages/rich-compose/src/cli/` (entire directory, including `litexml-to-html.ts` and the preview client entry).
- `packages/rich-compose/vite.cli.config.ts` and any package script that references it.
- Mentions of the old bins in `packages/rich-litexml/CLAUDE.md` and `packages/rich-compose/CLAUDE.md`.

Because this is a breaking change to the published bin surface, it ships as a major bump for `@haklex/*`.

## CLI Surface

```
Usage:
  litexml <input> --format <fmt> [options]
  litexml - < input.xml --format <fmt> [options]

Input:
  <input>                  File path, "-" for stdin, or an inline string.
                           Format is auto-detected by the first non-whitespace
                           character: "{" → json, "<" → litexml. Anything else
                           is an error. Override with --input-format.

Options:
  -f, --format <fmt>       Output format: html | json | markdown. Required.
  -i, --input-format <fmt> Force input format: litexml | json. Default: auto.
  -o, --output <file>      Write to file instead of stdout.
  --compact                Compact JSON output (format=json only).
  --theme <light|dark>     HTML theme. Default: light. (format=html only)
  --variant <v>            HTML variant: article | note | comment.
                           Default: article. (format=html only)
  --title <t>              HTML <title>. (format=html only)
  --lang <l>               HTML lang attribute. Default: en. (format=html only)
  --open                   Open the generated HTML in the system browser.
                           (format=html only)
  -h, --help               Show help.
```

### Behavior rules

- `--format` is **required**. No default. Missing `--format` exits non-zero with the help text.
- Flags that do not apply to the chosen format (e.g. `--theme` with `--format json`) emit a warning to stderr but do not error out.
- `--open` without `-o` writes to a temp file (matches today's `litexml-to-html` behavior) and opens that.
- stdin is read via `readFileSync(0, 'utf8')` (same as today's CLIs).
- stdout `EPIPE` is silently absorbed with exit 0 (same as today's `litexml-to-html`).
- Unknown flags fail fast with a descriptive error.

## Data Flow

All formats route through `SerializedEditorState` as the canonical intermediate:

```
                  ┌──────────────────────────────────────────────┐
input ─ detect ─┬─→ LiteXML ─ deserializeFromXml() → SerializedEditorState
                └─→ JSON    ─ JSON.parse() ────────→ SerializedEditorState
                                                          │
                            ┌─────────────────────────────┼─────────────────────────┐
                            ↓                             ↓                         ↓
                       JSON.stringify              renderToHTML (rich-compose)   $toMarkdown
                       (compact?)                  + style/preview JS bundle     (rich-headless)
                            ↓                             ↓                         ↓
                          stdout                        stdout                    stdout
```

### Module responsibilities

- **`input.ts`** — `readInput()` (file / stdin / inline string, same as today). Adds `detectFormat(raw)` which trims and looks at the first non-whitespace character: `<` → `litexml`, `{` → `json`, otherwise throw. `--input-format` overrides detection.
- **`shared/parse-litexml.ts`** — wraps `createDefaultRegistry()` + `deserializeFromXml()` from `@haklex/rich-litexml`, returns a parsed `SerializedEditorState`.
- **`formats/json.ts`** — `JSON.stringify(state, null, compact ? 0 : 2)`.
- **`formats/markdown.ts`** —
  ```ts
  const editor = createHeadlessEditor({ nodes: allHeadlessNodes });
  editor.setEditorState(editor.parseEditorState(state));
  return editor.read(() => $toMarkdown());
  ```
- **`formats/html.ts`** — refactored from today's `litexml-to-html`. Input is already `SerializedEditorState` (we parsed LiteXML upstream), so the embedded payload changes from `{ xml, theme, variant }` to `{ state, theme, variant }`. The client hydration bundle is updated to consume the JSON state directly instead of re-parsing LiteXML in the browser.

### HTML assets at runtime

The HTML format depends on two prebuilt assets currently shipped by `rich-compose`:

- `dist/style.css` — the static-render CSS.
- `dist/litexml-html-preview-client.{js,css}` — the hydration bundle.

The CLI package resolves these assets at runtime via the `@haklex/rich-compose` dependency rather than duplicating the bundles. Resolution candidates, in order:

1. `fileURLToPath(new URL('./style.css', import.meta.url))` — when colocated in the CLI dist (unlikely).
2. `require.resolve('@haklex/rich-compose/style.css')` (or the corresponding `package.json` export entry) — preferred.
3. Workspace fallbacks (`packages/rich-compose/dist/...`) for dev, mirroring the current `litexml-to-html.ts` candidates.

A failure to resolve throws a clear error directing the user to run `pnpm --filter @haklex/rich-compose build`.

### JSON-as-input validation

When `--input-format json` (or auto-detected as JSON), we `JSON.parse` and pass straight to the format handler. No additional schema validation — the underlying Lexical parser will raise its own error if the state is malformed. Malformed JSON yields a wrapped `SyntaxError` with the original message and exit code 1.

## Testing

All tests live in `packages/rich-litexml-cli/tests/` and run under vitest:

- **`input-detect.test.ts`** — `detectFormat()` returns `litexml` / `json` correctly; throws on empty input and on inputs that start with neither `<` nor `{`; `--input-format` override wins over detection.
- **`format-json.test.ts`** — LiteXML in → pretty + compact JSON out; JSON in → JSON out (passthrough + reformat).
- **`format-markdown.test.ts`** — representative node coverage: paragraph, heading, list, table, code block, KaTeX, mention, footnote, spoiler. Snapshot-style assertions — we are validating CLI wiring, not re-testing `$toMarkdown` itself (which has its own coverage in `@haklex/rich-headless`).
- **`format-html.test.ts`** — output begins with `<!doctype html>`; embedded payload script contains `"state":` (not `"xml":`); `--theme dark`, `--variant note`, `--title`, `--lang` are reflected in the output.
- **`cli-integration.test.ts`** — `child_process.spawnSync` against the built `dist/cli.mjs`. Covers: stdin input, file input, inline string input, `-o` file output, stdout output, exit codes for success and failure.
- **`errors.test.ts`** — missing `--format`, unknown flag, empty input, malformed JSON, malformed LiteXML, invalid `--theme` / `--variant` values.

## Build & Release

- `vite.config.ts` — SSR build, entry `src/cli.ts` → `dist/cli.mjs`. Preserve the `#!/usr/bin/env node` shebang. Externalize all workspace and node_modules deps (same pattern as the current bins).
- `package.json`:
  - `bin: { litexml: ./dist/cli.mjs }`.
  - `publishConfig.bin` mirrors it.
  - `version` matches `packages/rich-editor/package.json` (the source-of-truth for the unified `@haklex/*` version).
- `pnpm release:rich` already iterates over all `@haklex/*` workspace packages, so no orchestration changes are required.

Major bump on the next release because two existing bins are removed.

## Documentation

- New `packages/rich-litexml-cli/README.md` with usage, flag table, examples.
- Update root `CLAUDE.md` to register the new CLI under "Commands" and remove references to the old bins.
- Update `packages/rich-litexml/CLAUDE.md` and `packages/rich-compose/CLAUDE.md` to drop the old-CLI sections.

## Open Questions

None outstanding — all decisions captured above were confirmed during brainstorming.
