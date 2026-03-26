# SpecStory: AI coding sessions

This folder holds **SpecStory** exports: full transcripts of AI-assisted development on Haklex (Cursor, Codex, Claude, and others). They are part of the project’s **open dialogue** — see the root [`README.md`](../README.md#open-source-ai-and-dialogue).

## Privacy & redaction

Transcripts are sanitized for public sharing:

- **`<HOME>`** — replaced local home directory prefixes (e.g. former `/Users/…` paths).
- **`<HOME>/git/repos/…`** — local clone layout; the real parent directory name is normalized to `repos`.
- **`<CURSOR_WORKSPACE>`** — replaced Cursor’s encoded project folder name (which embedded the original path).
- **`<TMP>/…`** — replaced macOS `/private/tmp/…` scratch paths and temporary component copies.
- **`statistics.json` / `.project.json`** — workspace identifiers are redacted as `<redacted>` where applicable.

If you add new exports, run the same redaction rules before pushing, or keep paths generic.

## Session index

Files live in `history/`. Names follow `YYYY-MM-DD_HH-MM-SSZ-<slug>.md` (UTC time in the filename).

| Period         | File(s)                                                                                                | Theme (from slug / content)                  |
| -------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| **2026-03-07** | `09-12-13Z`, `09-25-12Z`, `09-25-16Z`, `09-37-09Z`, `09-54-19Z`, `12-24-04Z`, `13-34-30Z`, `16-17-36Z` | Early scaffolding, editor setup, misc.       |
|                | `09-36-41Z-packages-rich-editor-src.md`                                                                | `packages/rich-editor` source                |
|                | `12-27-17Z-rich-details-arrow-ui.md`                                                                   | Rich `<details>` UI, arrow / style-token     |
|                | `12-51-54Z-package-demo-package-demo.md`                                                               | Demo package / playground                    |
|                | `12-55-11Z-hash-haklex-css-ts.md`                                                                      | Vanilla Extract / CSS hashing                |
|                | `13-03-53Z-this-session-is-being.md`                                                                   | Session tooling                              |
|                | `13-06-56Z-codex-hash-haklex-rich.md`                                                                  | Large Codex pass on `haklex` rich editor     |
|                | `13-22-14Z-view-source-http-localhost.md`                                                              | Local dev / view-source                      |
|                | `13-42-12Z-migrate-imports-in-these.md`                                                                | Import migration (large session)             |
|                | `14-13-13Z-component-ui-base-ui.md`                                                                    | Base UI components                           |
|                | `14-30-39Z-lint-fix.md`                                                                                | Lint fixes                                   |
| **2026-03-09** | `06-19-34Z-editor-lexical-code-override.md`                                                            | Lexical code overrides                       |
|                | `06-27-42Z-review-the-current-git.md`                                                                  | Git / repo review                            |
|                | `06-39-28Z-your-task-is-to.md`                                                                         | Markdown → Lexical pipeline, fixtures        |
|                | `07-18-38Z-tagnode-edit-inline-code.md`                                                                | Tag / inline code nodes                      |
|                | `17-41-04Z-inline-code-node-node.md`                                                                   | Inline code node                             |
|                | `18-02-36Z`, `18-04-23Z-main-tsx-1-markdownpasteplugin.md`                                             | Demo `main`, Markdown paste plugin           |
| **2026-03-11** | `06-10-57Z-at-private-tmp-b.md`                                                                        | Checkbox UI reference (temp paths redacted)  |
|                | `13-41-18Z`, `14-23-09Z-this-may-or-may.md`                                                            | Follow-up work                               |
| **2026-03-13** | `07-09-08Z-actionbar-this-may-or.md`                                                                   | Action bar                                   |
|                | `07-18-02Z-commentnode-node-html-comment.md`                                                           | Comment node / HTML                          |
|                | `07-26-19Z-at-packages-rich-editor.md`                                                                 | Large `rich-editor` session                  |
|                | `08-40-26Z-static-render-headingnode-anchor.md`                                                        | Static render, heading anchors               |
| **2026-03-22** | `12-39-00Z-variant-note-2.md`                                                                          | `note` variant / typography                  |
| **2026-03-23** | `09-02-40Z-at-packages-rich-editor.md`                                                                 | Spoiler styles, static render, release notes |

Aggregated stats (message counts, session IDs) are in `statistics.json`.

## CLI

Project-level SpecStory config is in `cli/config.toml`. See [SpecStory docs](https://docs.specstory.com/).
