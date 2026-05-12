# rich-compose CSS Exports — Design

**Date:** 2026-05-12

**Goal:** Make `@haklex/rich-compose` the single CSS contract surface for downstream consumers. Provide both an all-in-one bundle for the "I didn't override anything" path and per-module subpath exports for the "I replaced renderer X" path — so consumers never reach into `rich-renderer-*` / `rich-ext-*` packages for CSS.

## Why now

In 0.8.0 the JS composition layer was consolidated under `rich-compose` (`compose/modules/*`), but the CSS surface stayed scattered:

- Each `rich-compose/modules/<name>/index.mjs` side-effect imports its corresponding `@haklex/rich-renderer-X/style.css` or `@haklex/rich-ext-X/style.css`.
- `rich-compose/package.json` declares `sideEffects: ["**/*.css"]`, so `.mjs` files are treated as side-effect-free.
- In bundlers that perform tree-shaking on side-effect-free modules (webpack, Rspack, Vite with Rollup), the bare `import "X/style.css"` statement is dropped — its CSS never reaches the output bundle.
- The breakage is amplified by Next.js `optimizePackageImports`, but the same root cause hits any bundler that strips bare imports from side-effect-free modules.

Today's `rich-compose/style.css` is **not** an all-in-one bundle — it contains only the foundation (`:root` `--rc-*` tokens, three `._1tdqahx*` variant classes, and the table renderer's `.icqzyn*` classes). 16 rule blocks, ~11 KB. A consumer who imports nothing else gets unstyled alerts, banners, images, mermaid, ruby, video, mentions, chat, code-snippet, embed, excalidraw, gallery, and nested-doc.

The "do nothing" path is therefore broken on two axes:

1. The all-in-one bundle doesn't actually contain "all"; it contains only foundation + table.
2. The auto-injecting `modules/<name>/index.mjs` side-effect import path is unreliable under realistic bundler configs.

A consumer who wants fine-grained control (e.g. Yohaku, which replaces code-block / link-card / poll / table with its own Tailwind-based renderers) has to know the internal package layout and import from 11 different packages:

```ts
import '@haklex/rich-editor/style.css'; // foundation prose
import '@haklex/rich-compose/style.css'; // tokens + variants
import '@haklex/rich-ext-chat/style.css';
import '@haklex/rich-ext-code-snippet/style.css';
import '@haklex/rich-ext-embed/style.css';
import '@haklex/rich-ext-excalidraw/style.css';
import '@haklex/rich-ext-gallery/style.css';
import '@haklex/rich-ext-nested-doc/style.css';
import '@haklex/rich-renderer-alert/style.css';
import '@haklex/rich-renderer-banner/style.css';
import '@haklex/rich-renderer-image/style.css';
import '@haklex/rich-renderer-mention/style.css';
import '@haklex/rich-renderer-mermaid/style.css';
import '@haklex/rich-renderer-ruby/style.css';
import '@haklex/rich-renderer-video/style.css';
```

This is a leaky abstraction. The `rich-renderer-*` / `rich-ext-*` split is `rich-compose`'s internal supply chain — consumers should never see it.

## Target Contract

`rich-compose` becomes the **single CSS contract** for consumers. Two paths exist:

### Path 1 — All-in-one (default)

```ts
import '@haklex/rich-compose/style.css';
```

Pulls in foundation + every module. Zero further imports needed. This is what `style.css` was always supposed to be; today's foundation-only file is the bug.

### Path 2 — Fine-grained subpaths (advanced)

```ts
import '@haklex/rich-compose/style/foundation.css'; // tokens + variants only
import '@haklex/rich-compose/style/alert.css'; // callout module
import '@haklex/rich-compose/style/image.css';
// ... only what you keep
// Skip subpaths for modules you've replaced with custom renderers.
```

Every module has a stable subpath. Consumers never import from `rich-renderer-*` or `rich-ext-*` packages directly.

### Target file map

`rich-compose/dist/`:

```
style.css                        ← all-in-one (foundation + every module)
style/foundation.css             ← :root tokens + ._1tdqahx* variants + .rich-paragraph reset
style/table.css                  ← .icqzyn* (built-in table renderer)
style/alert.css                  ← from rich-renderer-alert
style/banner.css                 ← from rich-renderer-banner
style/chat.css                   ← from rich-ext-chat
style/code-block.css             ← from rich-renderer-codeblock
style/code-snippet.css           ← from rich-ext-code-snippet
style/embed.css                  ← from rich-ext-embed
style/excalidraw.css             ← from rich-ext-excalidraw
style/gallery.css                ← from rich-ext-gallery
style/image.css                  ← from rich-renderer-image
style/katex.css                  ← from rich-renderer-katex
style/link-card.css              ← from rich-renderer-linkcard
style/mention.css                ← from rich-renderer-mention
style/mermaid.css                ← from rich-renderer-mermaid
style/nested-doc.css             ← from rich-ext-nested-doc
style/poll.css                   ← from rich-ext-poll
style/ruby.css                   ← from rich-renderer-ruby
style/video.css                  ← from rich-renderer-video
```

### package.json exports

```jsonc
{
  "exports": {
    // existing JS subpaths unchanged …
    "./style.css": "./dist/style.css",
    "./style/*": "./dist/style/*", // wildcard
  },
}
```

## Implementation

`rich-compose` already declares every renderer/ext package as a workspace dependency, so no new dependency edges are introduced. The build pipeline gains a CSS-copy + concat step.

### Step 1 — Carve foundation.css out of today's rich-compose.css

Today's `dist/rich-compose.css` contains foundation (`:root`, `._1tdqahx*`) plus the built-in table renderer (`.icqzyn*`). Split:

- `dist/style/foundation.css` — the `:root` + `._1tdqahx*` rules (~10 KB).
- `dist/style/table.css` — the `.icqzyn*` rules (~1 KB).

Both are produced from the same vanilla-extract sources (`src/style-token/*.css.ts`, `src/static-renderer/table.css.ts`). Configure vite-plugin-vanilla-extract or the post-build script to emit two files instead of one.

### Step 2 — Copy each module's CSS into rich-compose

Post-build step iterates over the workspace dep list and copies each `dist/<pkg-name>.css` into `dist/style/<module-name>.css`. Map:

```
@haklex/rich-renderer-alert       → style/alert.css
@haklex/rich-renderer-banner      → style/banner.css
@haklex/rich-ext-chat             → style/chat.css
@haklex/rich-renderer-codeblock   → style/code-block.css
@haklex/rich-ext-code-snippet     → style/code-snippet.css
@haklex/rich-ext-embed            → style/embed.css
@haklex/rich-ext-excalidraw       → style/excalidraw.css
@haklex/rich-ext-gallery          → style/gallery.css
@haklex/rich-renderer-image       → style/image.css
@haklex/rich-renderer-katex       → style/katex.css
@haklex/rich-renderer-linkcard    → style/link-card.css
@haklex/rich-renderer-mention     → style/mention.css
@haklex/rich-renderer-mermaid     → style/mermaid.css
@haklex/rich-ext-nested-doc       → style/nested-doc.css
@haklex/rich-ext-poll             → style/poll.css
@haklex/rich-renderer-ruby        → style/ruby.css
@haklex/rich-renderer-video       → style/video.css
```

Implementation choice: a `scripts/copy-module-css.ts` that runs after vite build. It reads `package.json#dependencies`, resolves each to `node_modules/@haklex/<name>/dist/*.css`, and copies to `dist/style/<module>.css`. Naming map is a small table in the script.

### Step 3 — Generate style.css (all-in-one)

After Step 2, concatenate all per-module CSS files into `dist/style.css`:

```
/* @haklex/rich-compose — generated all-in-one bundle. Do not edit. */
@import './style/foundation.css';
@import './style/alert.css';
@import './style/banner.css';
@import './style/chat.css';
… etc
@import './style/table.css';
```

Bundlers resolve `@import` at build time, so consumers get a single network/CSS module that pulls everything. No runtime `@import` waterfall.

Alternative: inline-concat the per-module CSS files into one file rather than using `@import`. This is more portable across bundlers that don't honor `@import` paths inside `node_modules` (less common, but possible). The script chooses based on what we test.

### Step 4 — Remove module-side side-effect CSS imports

Today every `src/modules/<name>/index.ts` does:

```ts
import '@haklex/rich-renderer-X/style.css';
```

These get tree-shaken in real bundlers anyway. With the new contract — consumers import directly from `rich-compose/style*` — these lines become both unnecessary and confusing. Remove them.

This is the breaking change in this spec. Consumers who were (luckily) getting CSS via the side-effect import path on a forgiving bundler will need to add an explicit `import '@haklex/rich-compose/style.css'` after upgrading. The migration is a one-line change and the failure mode (missing styles) is loud and obvious.

### Step 5 — Update sideEffects

```jsonc
{
  "sideEffects": ["**/*.css", "./dist/style/**"],
}
```

The first glob still flags CSS files as side-effectful; the second is belt-and-suspenders for any bundler that handles the `style/` directory as a referenced asset graph.

## Subpaths the consumer needs to know

Stable contract — these are the only CSS imports a consumer ever writes:

```ts
import '@haklex/rich-compose/style.css'; // all-in-one
import '@haklex/rich-compose/style/foundation.css'; // just tokens + variants
import '@haklex/rich-compose/style/<module>.css'; // per module
```

`<module>` matches the JS subpath: `./modules/<module>`. If a consumer uses `composeRenderer({ modules: [alertModule, imageModule] })` and replaces the rest, they import `foundation.css` + `alert.css` + `image.css`. The mapping is mechanical and discoverable.

Documentation update: the rich-compose README gains a CSS section listing the three patterns above with a one-line example for each.

## Foundation prose styles (rich-editor)

`@haklex/rich-editor/style.css` currently holds the base prose layer — `.rich-paragraph`, `.rich-heading-h1..6`, `.rich-text-bold`, the `r8uj4t*` hashed equivalents of `sharedStyles`, etc. The static renderer in `rich-compose` emits these classes for every paragraph/heading/list/link, so consumers of `rich-compose` need this CSS too — but `rich-compose` doesn't currently expose it.

Two options:

**Option A** — Inline rich-editor's prose CSS into `style/foundation.css`. This makes `rich-compose/style.css` truly standalone for the read-only path: a Yohaku-style consumer never imports from `rich-editor` (they don't need the editor at all). `rich-editor`'s `style.css` becomes editor-UI-only (keystrokes, slash menu, toolbar) — still needed by editor consumers, never by static-renderer consumers.

**Option B** — Add `@import '@haklex/rich-editor/style.css'` to the top of `rich-compose/style/foundation.css`. Simpler to implement; preserves a single CSS source of truth for prose styles inside `rich-editor`. Downside: `rich-compose/style.css` indirectly pulls in editor-UI bytes too.

**Recommendation: Option A.** The editor and the renderer have genuinely different audiences; bundling editor UI CSS into the read-only path costs ~30 KB for every reader-only site. Split rich-editor's `style.css` into `style/prose.css` (re-exported by rich-compose's foundation) and `style/editor-ui.css` (stays in rich-editor). This is a small refactor inside rich-editor and aligns with the package-roles boundary already established in `2026-05-10-package-consolidation-design.md`.

## What stays the same

- `rich-renderer-*` and `rich-ext-*` packages keep their own `./style.css` exports. They remain consumable standalone (independent demos, tests, third parties using only one node type). `rich-compose` consuming them is just one such consumer.
- No JS API changes. The `composeRenderer` / `RichRenderer` / `*Module` surface is untouched.
- `rich-style-token` continues to own theme variables at the source level; foundation.css is its compiled output.

## Risks

- **Bundlers that don't resolve `@import` inside `node_modules`.** Mitigation: in CI, build the demo with Webpack, Rspack, Vite, and Next.js (turbopack + webpack). If `@import` is unreliable, switch `style.css` to a concat'd single file.
- **CSS order matters for cascade.** The all-in-one bundle's concatenation order should be: foundation → modules (alphabetical) → table. Any cross-module override (rare, by design) should still happen at the consumer level.
- **Version drift between rich-compose and rich-renderer-\* at consumer install time.** Mitigation: rich-compose's `dependencies` pin renderer/ext to the same major; lockfile resolves to one version per workspace publish. Same risk exists today.

## Migration for downstream consumers

**Before (0.8.x):**

```ts
import '@haklex/rich-editor/style.css';
import '@haklex/rich-compose/style.css';
import '@haklex/rich-renderer-alert/style.css';
import '@haklex/rich-renderer-banner/style.css';
// + 11 more
```

**After (next minor):**

```ts
import '@haklex/rich-compose/style.css'; // if all defaults
// or
import '@haklex/rich-compose/style/foundation.css'; // if some modules are replaced
import '@haklex/rich-compose/style/alert.css';
import '@haklex/rich-compose/style/banner.css';
// … only the ones kept
```

Migration is mechanical and the package surface to learn shrinks from ~15 packages to one.

## Out of scope

- Tailwind-token bridge between `--rc-*` and downstream design systems (separate spec).
- Tree-shakeable CSS via JS-driven import maps (premature; the current explicit-subpath model is simple and sufficient).
- Per-variant CSS subsets (`style/article.css` / `style/note.css` / `style/comment.css`). The three variant classes total ~3 KB and are part of foundation; splitting them isn't worth the surface complexity.
