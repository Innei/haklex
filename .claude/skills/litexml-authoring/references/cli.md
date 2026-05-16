# litexml CLI reference

`@haklex/rich-litexml-cli` publishes the `litexml` binary. It accepts **LiteXML** or **Lexical SerializedEditorState JSON** as input (auto-detected) and emits one of three target formats: **HTML preview**, **Lexical JSON**, or **Markdown**.

This file is the canonical reference for every flag, every input/output mode, and the runtime caveats. The main `SKILL.md` only lists the format decision matrix; come here when you need the actual command.

## Invocation forms

### Inside this monorepo

```bash
pnpm --silent litexml < input > --format < fmt > [options]
```

The repo's root `package.json` exposes `litexml` as a pnpm-runnable script that resolves the local workspace build. Always pair with `--silent` so pnpm chatter does not corrupt stdout when piping into a file.

### Outside the repo

```bash
npx --yes -p @haklex/rich-litexml-cli@ < version > litexml < input > --format < fmt > [options]
```

Or after a global install:

```bash
npm install -g @haklex/rich-litexml-cli
litexml < input > --format < fmt > [options]
```

The package depends on `@haklex/rich-compose`, `@haklex/rich-headless`, and `@haklex/rich-litexml` at the same version, and reads `@haklex/rich-compose/dist/style.css` plus `dist/litexml-html-preview-client.js` at runtime via `require.resolve`. Do not strip those packages in a custom install.

## Input

| Form               | Example                                      | Notes                                                                                         |
| ------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| File path          | `litexml article.xml --format json`          | Path is detected via `existsSync`. Reads with `utf8`.                                         |
| Stdin              | `cat article.xml \| litexml - --format json` | Explicit `-` reads from `fd 0`. Also used when input arg is omitted entirely.                 |
| Inline string      | `litexml '<p>hi</p>' --format json`          | If the arg does not match an existing file and starts with `<` or `{`, it is parsed directly. |
| Force input format | `litexml input.txt --input-format litexml`   | Use when auto-detection cannot decide (e.g. unusual whitespace or empty leading lines).       |

**Auto-detection rule** (`src/input.ts`): first non-whitespace character — `<` → LiteXML, `{` → JSON, anything else → error. Override with `--input-format litexml|json` (alias `-i`).

## Output

| Form               | Example                                               |
| ------------------ | ----------------------------------------------------- |
| Stdout (default)   | `litexml input.xml --format html > article.html`      |
| Explicit file      | `litexml input.xml --format html -o article.html`     |
| Browser preview    | `litexml input.xml --format html --open`              |
| Write **and** open | `litexml input.xml --format html -o page.html --open` |

When `--open` is set without `-o`, the CLI writes the HTML to a tmp file (`mkdtemp` under `os.tmpdir()`) and opens it via `open` / `cmd /c start` / `xdg-open` depending on platform.

Stdout EPIPE is handled gracefully (`process.stdout.on('error', ...)`), so piping into `head` / `less` will not crash the process.

## Flags

| Flag                    | Alias | Applies to  | Default      | Meaning                                                                       |
| ----------------------- | ----- | ----------- | ------------ | ----------------------------------------------------------------------------- |
| `--format <fmt>`        | `-f`  | all         | **required** | `html` \| `json` \| `markdown`.                                               |
| `--input-format <fmt>`  | `-i`  | all         | auto         | Force `litexml` or `json`.                                                    |
| `--output <file>`       | `-o`  | all         | stdout       | Write rendered output to a file.                                              |
| `--compact`             |       | `json` only | off          | Strip indentation from emitted JSON.                                          |
| `--theme <light\|dark>` |       | `html` only | `light`      | Sets `<meta color-scheme>` and `<html>` background.                           |
| `--variant <v>`         |       | `html` only | `article`    | `article` (sans, 16px) \| `note` (CJK serif, 16px) \| `comment` (sans, 14px). |
| `--title <t>`           |       | `html` only | derived      | Sets the HTML `<title>`. Default: input filename or `Haklex LiteXML Preview`. |
| `--lang <l>`            |       | `html` only | `en`         | Sets `<html lang>`.                                                           |
| `--open`                |       | `html` only | off          | Open the generated HTML in the system browser.                                |
| `--help`                | `-h`  | —           | —            | Print help and exit `0`.                                                      |

Irrelevant flags are not errors — the CLI prints a warning on stderr (`Warning: ignoring options not applicable to --format <fmt>: ...`) and continues. Use `2>/dev/null` to suppress.

## Output formats in detail

### `--format json` — Lexical SerializedEditorState

Emits a full `SerializedEditorState` (i.e. `{ "root": { ... } }`), not a node array. Use this when you need to feed the result into `editor.parseEditorState(JSON.stringify(state))` or persist it to a database.

```bash
litexml input.xml --format json > state.json
litexml input.xml --format json --compact # single-line, smallest
litexml input.xml --format json -o state.json
litexml '<p>hi</p>' --format json --compact # inline → JSON, one-shot
```

When the input is already JSON, the CLI still rebuilds it via `JSON.parse` → format → emit. This is intentional: it lets you re-format / compact existing state files via the same binary.

### `--format markdown` — `$toMarkdown()` via rich-headless

```bash
litexml input.xml --format markdown > article.md
litexml state.json --format markdown         # auto-detected as JSON
litexml state.json --format markdown -i json # force
```

The Markdown writer is `@haklex/rich-headless`'s `$toMarkdown()`. Coverage includes all standard nodes plus haklex extensions (mentions, footnotes, KaTeX, code blocks, tables, banners, alerts, spoilers, etc.). When a Haklex node has no Markdown analogue, the headless writer emits a sensible textual fallback rather than failing.

Useful pairings:

```bash
# Round-trip: render the canonical Markdown that an article would export as
litexml article.xml --format markdown | diff - article.md

# Convert a stored Lexical state back into editable Markdown
litexml state.json --format markdown -o editable.md
```

### `--format html` — full preview document

Writes a standalone HTML document with:

- `@haklex/rich-compose/dist/style.css` inlined inside `<style>`.
- The `SerializedEditorState` embedded as `<script id="haklex-litexml-payload" type="application/json">`.
- `@haklex/rich-compose/dist/litexml-html-preview-client.js` inlined inside a trailing `<script>`. The bundle reads the payload script and renders into `#haklex-litexml-root` via the same Rich Compose renderer used by the static renderer.

The resulting file is fully self-contained — no external network requests, no missing CSS — and can be opened from any disk path. Theme / variant / title / lang are baked into the document at render time.

```bash
litexml input.xml --format html > preview.html
litexml input.xml --format html -o preview.html
litexml input.xml --format html --open # tmpfile + system open
litexml input.xml --format html --theme dark -o dark.html
litexml input.xml --format html --variant note --lang ja -o note.html
litexml input.xml --format html --title "Draft v3" -o draft.html
```

If you build the CLI from source and `@haklex/rich-compose` has not been built, the HTML format will fail with `Cannot resolve @haklex/rich-compose asset "style.css"`. Run `pnpm --filter @haklex/rich-compose build` first.

## Exit behavior

- Success: exit code `0`. Output goes to stdout (or `-o` path).
- Error: exit code `1`, message + full `HELP` text written to stderr. Common causes: missing `--format`, unknown flag, empty input, malformed JSON, unresolvable compose asset.
- `--help`: exit code `0`, help text written to stdout.
- EPIPE on stdout (e.g. piping into `head`): exit code `0` silently.

## Validation recipe

After producing or editing a LiteXML fragment, convert to compact JSON to confirm the registry parses every tag:

```bash
pnpm --silent litexml '<doc><p>Hello</p></doc>' --format json --compact
```

If the command succeeds but a downstream editor cannot materialize a node, the runtime is missing that Haklex node class — re-check the consumer's `nodes` registration, not the CLI.

For round-trip verification on a real article:

```bash
litexml article.xml --format json | litexml - --format markdown -i json
```

Any node that round-trips differently between LiteXML → JSON → Markdown is a writer/reader bug in `@haklex/rich-litexml` or a missing Markdown export in `@haklex/rich-headless`.

## Common mistakes

| Mistake                                          | Symptom                                                     | Fix                                                                                     |
| ------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Omitting `--format`                              | `Missing required option: --format <html\|json\|markdown>.` | Always supply `-f` / `--format`.                                                        |
| Forgetting `--silent` when piping                | pnpm progress lines mixed into the output file              | `pnpm --silent litexml ... > out.html`.                                                 |
| Passing inline LiteXML without quotes            | Shell parses `<` as redirect                                | Wrap in single quotes: `litexml '<p>x</p>' -f json`.                                    |
| Using `--compact` with `-f html`                 | Warning, no effect                                          | `--compact` is JSON-only.                                                               |
| Running `-f html` without compose build          | `Cannot resolve @haklex/rich-compose asset "style.css".`    | Run `pnpm --filter @haklex/rich-compose build` (only inside a source checkout).         |
| Treating output as node array                    | Downstream `editor.parseEditorState` rejects the JSON       | Output is `SerializedEditorState` (`{root: {...}}`), not a node list.                   |
| Mixing Markdown syntax inside a LiteXML fragment | `**bold**` rendered literally                               | If the fragment contains any LiteXML tag, write the whole surrounding prose as LiteXML. |
