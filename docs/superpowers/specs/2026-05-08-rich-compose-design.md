# Rich Compose Design

Status: Draft
Date: 2026-05-08
Owner: @innei

## Goal

Replace the monolithic preset bundle `@haklex/rich-kit-shiro` (renderer side only) with a new package `@haklex/rich-compose` that follows a **Gundam-style assembly** model: small, independent modules that the consumer composes into a renderer. Each module owns its node class, default renderer, optional CSS, and optional context provider. Tree-shake is a first-class concern: a consumer who overrides `CodeBlock` or `LinkCard` must not pay the cost of the default renderer's dependencies (shiki, default LinkCardRenderer, etc.).

## Non-Goals

- **Editor side**. `ShiroEditor` stays in `@haklex/rich-kit-shiro` untouched. A future `composeEditor` may be designed in a separate spec; out of scope here.
- **`admin-vue3` / dashboard changes**. The editor consumers are not migrated.
- **In-place patches to the old `rich-kit-shiro`**. The old package is frozen and marked deprecated. No new features added there.
- **API changes to `@haklex/rich-editor`, `@haklex/rich-renderers`, `@haklex/rich-static-renderer`**. The new package consumes them as-is.
- **Build-time codemods or babel/swc plugins** for override tree-shake. Solved via subpath imports (see § 4) instead.

## Background

`@haklex/rich-kit-shiro/renderer` (`ShiroRenderer.tsx`) hardcodes `defaultExtraNodes` (Excalidraw, embed, link-card, gallery, code-snippet, chat, katex, nested-doc) and a `enhancedRendererConfig` map. Consumers can `extraNodes` add but never remove. `apps/web/src/components/ui/rich-content/LexicalContent.tsx` (Yohaku) overrides `CodeBlock` and `LinkCard` via `rendererConfig` — the runtime override works, but the default `CodeBlockRenderer` (with shiki) and default `LinkCardRenderer` are still pulled into the production bundle.

## Architecture

### Package layout

New package `packages/rich-compose/` in the haklex monorepo. Single package containing compose primitives, the module catalog, and the Shiro preset.

```
packages/rich-compose/
├── package.json                    ESM-only, "type": "module", strict subpath exports
├── src/
│   ├── core/
│   │   ├── compose.tsx             composeRenderer()
│   │   ├── types.ts                RichRendererModule, ComposeRendererOptions
│   │   ├── lazy.tsx                LazyRendererBoundary (Suspense + ssrFallback)
│   │   ├── dedup.ts                module dedup logic (reference > name > getType)
│   │   └── style.css               core tokens + .rich-content container
│   ├── modules/
│   │   ├── embed/                  full shape (custom Lexical node)
│   │   │   ├── node.ts             { embedNodes }    — Klass(es) only
│   │   │   ├── renderer.tsx        EmbedRenderer + './style.css'
│   │   │   ├── module.ts           { embedModule }   — sugar
│   │   │   └── index.ts            pure named re-exports of all three
│   │   ├── katex/                  builtin-only shape: no node.ts (no /node subpath either)
│   │   │   ├── renderer.tsx
│   │   │   ├── module.ts
│   │   │   └── index.ts
│   │   ├── link-card/              same shape
│   │   ├── gallery/                same
│   │   ├── code-block/             same (renderer is heavy: shiki)
│   │   ├── code-snippet/           same
│   │   ├── chat/                   same
│   │   ├── excalidraw/             same (renderer is heavy + lazy)
│   │   ├── katex/                  same (lazy)
│   │   ├── mermaid/                same (lazy)
│   │   ├── mention/                same
│   │   ├── poll/                   same
│   │   ├── video/                  same
│   │   ├── ruby/                   same
│   │   ├── alert/                  same
│   │   ├── banner/                 same
│   │   ├── image/                  same
│   │   └── nested-doc/             same
│   └── presets/
│       └── shiro/
│           ├── index.ts            named re-exports of every default module
│           └── full.ts             const shiroPreset = [...] sugar array
├── bundle-test/
│   ├── core-only/                  fixture: composeRenderer + style.css alone
│   ├── minimal/                    fixture: 2 modules
│   ├── shiro-full-eager/           fixture: shiroPreset (excludes lazy chunks from initial)
│   └── shiro-with-2-overrides/     fixture: 15 modules + CodeBlock + LinkCard overrides
└── tsconfig.json                   "module": "ESNext", "moduleResolution": "bundler"
```

### `package.json` exports map

```jsonc
{
  "name": "@haklex/rich-compose",
  "type": "module",
  "sideEffects": ["**/*.css", "./src/modules/*/renderer.tsx"],
  "exports": {
    ".": { "import": "./dist/core/index.mjs", "types": "./dist/core/index.d.ts" },
    "./style.css": "./dist/core/style.css",

    "./modules/embed": {
      "import": "./dist/modules/embed/index.mjs",
      "types": "./dist/modules/embed/index.d.ts",
    },
    "./modules/embed/node": {
      "import": "./dist/modules/embed/node.mjs",
      "types": "./dist/modules/embed/node.d.ts",
    },
    "./modules/embed/renderer": {
      "import": "./dist/modules/embed/renderer.mjs",
      "types": "./dist/modules/embed/renderer.d.ts",
    },
    /* ... 17 modules × 3 subpaths each ... */

    "./presets/shiro": {
      "import": "./dist/presets/shiro/index.mjs",
      "types": "./dist/presets/shiro/index.d.ts",
    },
    "./presets/shiro/full": {
      "import": "./dist/presets/shiro/full.mjs",
      "types": "./dist/presets/shiro/full.d.ts",
    },
  },
}
```

Three subpaths per module (or two, for builtin-only modules) ensure tree-shake works even when bundlers fail to eliminate unused named re-exports from a barrel:

- `./modules/<name>` — full barrel (node + renderer + sugar; for builtin-only modules: renderer + sugar only)
- `./modules/<name>/node` — Klass(es) only, physically isolated from renderer. **Omitted for builtin-only modules** (no Klass to expose).
- `./modules/<name>/renderer` — default renderer only

### Module shape

```ts
// core/types.ts
import type { Klass, LexicalNode, SerializedEditorState } from 'lexical';
import type { ComponentType, ReactNode } from 'react';
import type { RendererConfig, RichEditorVariant } from '@haklex/rich-editor';
import type { BuiltinNodeRenderer } from '@haklex/rich-static-renderer';

export interface RichRendererModule {
  /** Stable identifier; used for dedup, debug logs, and Provider DevTools naming. */
  name: string;

  /**
   * Lexical node classes. Always synchronous. Optional — modules that only override
   * renderers for Lexical builtin types (e.g., `code`, `paragraph`, `heading`) omit
   * this field. composeRenderer treats missing `nodes` as `[]`.
   */
  nodes?: Klass<LexicalNode>[];

  /** type → Component map. Sync renderers. */
  renderers?: Partial<RendererConfig>;

  /**
   * Optional context provider. composeRenderer stacks Providers in module order
   * outside `<RichRenderer>`. Module Providers are for internal plumbing only —
   * do not redeclare `NestedContentRendererProvider`; composeRenderer manages it.
   */
  Provider?: ComponentType<{ children: ReactNode }>;

  /**
   * Lazy renderers. Each loader returns the renderer component as default export.
   * composeRenderer wraps each in `React.lazy` (factory created once at compose time)
   * + `<Suspense fallback={ssrFallback?.[type]}>`.
   */
  lazyRenderers?: Record<string, () => Promise<{ default: ComponentType<any> }>>;

  /**
   * SSR / Suspense fallback. Must be deterministic — no Date.now, no random,
   * no client-only API access. Renders identically server-side and during
   * client hydration to avoid hydration mismatch.
   */
  ssrFallback?: Record<string, ReactNode>;
}
```

### `composeRenderer` API

```ts
// core/compose.tsx
import { lazy, Suspense } from 'react';
import { RichRenderer } from '@haklex/rich-static-renderer';
import { NestedContentRendererProvider } from '@haklex/rich-editor';

export interface ComposeRendererOptions {
  /** Starting set; can be `shiroPreset`, custom array, or omitted. */
  preset?: RichRendererModule[];
  /** Appended to preset; later modules override earlier on `name` collision. */
  modules?: RichRendererModule[];
  /** Final renderer overrides; takes precedence over module-supplied renderers. */
  overrides?: Partial<RendererConfig>;
  /** Pass-through to `<RichRenderer>` for `paragraph` / `link` / `autolink` etc. */
  builtinNodeOverrides?: Record<string, BuiltinNodeRenderer>;
}

export interface RichRendererBaseProps {
  value: SerializedEditorState;
  variant?: RichEditorVariant;
  theme?: 'light' | 'dark';
  className?: string;
  style?: React.CSSProperties;
  nested?: boolean;
  /* extends as needed; superset of current ShiroRendererProps */
}

export function composeRenderer(opts: ComposeRendererOptions): ComponentType<RichRendererBaseProps>;
```

**Implementation outline:**

1. **Resolve modules** — concatenate `preset` and `modules`, then dedup (see Dedup below). All subsequent steps work on the deduped, ordered list.
2. **Flatten nodes** — `flatMap(m => m.nodes ?? [])`, then dedup by reference.
3. **Build renderer map** — for each module, merge `renderers` (sync). Then for each `lazyRenderers` entry, build `React.lazy(loader)` **once at compose time** (not per render) and wrap in `<Suspense fallback={ssrFallback[type] ?? null}>`. Lazy entries override sync entries when both exist on the same `type`. Finally, apply `opts.overrides` last — these are the consumer's final word and are pure components (no Suspense added).
4. **Compose Provider stack** — pull every module's `Provider`, build a single `<ComposedProviders>` that nests them in order. Always include `NestedContentRendererProvider` as the innermost wrapper, with `value` set to the recursive renderer closure (which calls back into the same composed component for nested editor states).
5. **Return component** — a `ComponentType<RichRendererBaseProps>` that renders `<ComposedProviders><RichRenderer ... /></ComposedProviders>`. The component should `React.memo` the result; props pass through unchanged.

```tsx
// Sketch (not exhaustive)
export function composeRenderer(opts: ComposeRendererOptions) {
  const merged = mergeModules(opts.preset, opts.modules);
  const allNodes = dedupNodes(merged.flatMap((m) => m.nodes));
  const sync = mergeRenderers(merged.map((m) => m.renderers));
  const lazy = wrapLazy(merged); // factories built ONCE here
  const final = { ...sync, ...lazy, ...opts.overrides };
  const ComposedProviders = composeProviders(merged);

  function ComposedRenderer(props: RichRendererBaseProps) {
    const renderNested = useCallback(
      (value: SerializedEditorState, overrideVariant?: RichEditorVariant) => (
        <ComposedRenderer
          {...props}
          nested
          value={value}
          variant={overrideVariant ?? props.variant}
        />
      ),
      [props],
    );
    return (
      <NestedContentRendererProvider value={renderNested}>
        <ComposedProviders>
          <RichRenderer
            {...props}
            extraNodes={allNodes}
            rendererConfig={final}
            builtinNodeOverrides={opts.builtinNodeOverrides}
          />
        </ComposedProviders>
      </NestedContentRendererProvider>
    );
  }
  return React.memo(ComposedRenderer);
}
```

### Dedup rules

```
For each module in (preset ++ modules):
  - if module reference already seen → skip silently (idempotent)
  - else if module.name already seen → warn (dev only), replace previous module entirely
  - else → append

For each Klass in flattened nodes:
  - dedup by reference
  - if two distinct Klasses share getType() → throw at compose time
    (multiple Klass instances will break `instanceof` checks across module boundaries)
```

### Lazy modules

The following four modules ship `lazyRenderers` + `ssrFallback`:

| Module       | Heavy dep                | ssrFallback                                                                       |
| ------------ | ------------------------ | --------------------------------------------------------------------------------- |
| `excalidraw` | `@excalidraw/excalidraw` | `<div className="rich-excalidraw-skeleton" aria-busy />`                          |
| `mermaid`    | `mermaid`                | `<pre className="rich-mermaid-skeleton">{rawSource}</pre>`                        |
| `katex`      | `katex` + CSS            | inline `<span className="rich-katex-skeleton">{tex}</span>`                       |
| `code-block` | `shiki`                  | `<pre><code>{rawSource}</code></pre>` (uses pre-tokenized text from node payload) |

The `code-block` SSR fallback should still emit the raw code text so SSR'd HTML is searchable / readable before the lazy chunk loads. The lazy renderer enhances it with shiki tokens after hydration.

Consumers who want sync renderers (e.g., for SSR-rendered code blocks served pre-tokenized from the server) override via `opts.overrides.CodeBlock` — the lazy chunk is still emitted by the bundler but never fetched at runtime.

### CSS strategy

- `core/style.css` — design tokens, typography, `.rich-content` container scope. Consumer imports once: `import '@haklex/rich-compose/style.css'`.
- Per-module CSS — placed adjacent to the module's `renderer.tsx` and imported at the top of `renderer.tsx`. When the renderer enters the bundle (eager or lazy), so does its CSS. Modules without visual concerns omit CSS entirely.
- Lazy module CSS — bundled into the lazy chunk; not loaded until the renderer is fetched.
- The `sideEffects` array in `package.json` lists `**/*.css` and `./src/modules/*/renderer.tsx`. All other module files (`node.ts`, `module.ts`, `index.ts`) are pure and tree-shake-eligible.

### Override-vs-tree-shake pattern

Three consumer modes, each with explicit subpath import:

**Mode A — defaults (sugar):**

```ts
import { embedModule } from '@haklex/rich-compose/modules/embed';
// pulls EmbedRenderer + EmbedNode + CSS
```

**Mode B — custom renderer (tree-shake the default):**

```ts
import { EmbedNode } from '@haklex/rich-compose/modules/embed/node';
// pulls Klass only — default renderer and its CSS stay out of bundle
const myEmbedModule: RichRendererModule = {
  name: 'embed',
  nodes: [EmbedNode],
  renderers: { Embed: MyEmbedRenderer },
};
```

**Mode C — wrap the default:**

```ts
import { EmbedNode } from '@haklex/rich-compose/modules/embed/node'
import { EmbedRenderer } from '@haklex/rich-compose/modules/embed/renderer'
const wrappedModule: RichRendererModule = {
  name: 'embed',
  nodes: [EmbedNode],
  renderers: { Embed: (props) => <div className="extra-wrap"><EmbedRenderer {...props} /></div> },
}
```

The `/node` subpath is the **defense-in-depth** path: even if the bundler fails to tree-shake unused named re-exports from `index.ts`, importing from `/node` physically isolates the Klass file from the renderer file.

### `shiroPreset`

`presets/shiro/index.ts` contains pure named re-exports of every default module (and convenient access to their `*Node` types). `presets/shiro/full.ts` exports a `shiroPreset` array literal for zero-config consumers.

```ts
// presets/shiro/index.ts
export { embedModule, EmbedNode } from '../../modules/embed';
export { linkCardModule, LinkCardNode } from '../../modules/link-card';
export { codeBlockModule, CodeBlockNode } from '../../modules/code-block';
/* ... 17 modules ... */

// presets/shiro/full.ts
import { embedModule, linkCardModule, codeBlockModule /* ... */ } from './index';
export const shiroPreset: RichRendererModule[] = [
  embedModule,
  linkCardModule,
  codeBlockModule /* ... */,
];
```

`shiroPresetExcept(...names)` is **not** included in the API. Consumers wanting a subset filter the array themselves and document the limitation: filtering does not break the import graph, so excluded modules' renderers may still ship in the bundle. For true tree-shake, use Mode B (manually list modules).

## Module catalog

The catalog is derived from the existing `defaultExtraNodes` in `ShiroRenderer.tsx` plus the `enhancedRendererConfig` map from `@haklex/rich-renderers`. Phase 0 verifies the actual exported nodes/renderers from upstream packages and finalizes the list.

| Module         | Source pkg                                                   | Has node?        | Lazy?   | Notes                                                                                                                                                          |
| -------------- | ------------------------------------------------------------ | ---------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `embed`        | `rich-renderers` (`embedNodes`, `EmbedStaticRenderer`)       | yes              | no      | Bundles platform plugins (bilibili, youtube, codesandbox, gist, …); plugin registration via `LinkCardFetchProvider` / `EmbedRendererProvider` (consumer-level) |
| `link-card`    | `rich-renderers` (`LinkCardRenderer`)                        | yes              | no      | Default renderer pulls plugin map; consumer can override via Mode B and lose plugin cost                                                                       |
| `gallery`      | `rich-renderers` (`galleryNodes`, `GalleryRenderer`)         | yes              | no      |                                                                                                                                                                |
| `code-block`   | `rich-renderers` (`CodeBlockRenderer`)                       | builtin          | **yes** | Heavy: shiki. Lazy by default; consumer can override for SSR-pretokenized code                                                                                 |
| `code-snippet` | `rich-renderers` (`codeSnippetNodes`, `CodeSnippetRenderer`) | yes              | no      |                                                                                                                                                                |
| `chat`         | `rich-renderers` (`chatNodes`)                               | yes              | no      |                                                                                                                                                                |
| `excalidraw`   | `rich-ext-excalidraw` (`ExcalidrawNode`)                     | yes              | **yes** | Heavy: @excalidraw/excalidraw                                                                                                                                  |
| `katex`        | `rich-renderers` (`KatexRenderer`)                           | builtin          | **yes** | Heavy: katex + CSS                                                                                                                                             |
| `mention`      | `rich-renderers` (`MentionRenderer`)                         | builtin          | no      | Configured via `MentionPlatformProvider` (consumer-level)                                                                                                      |
| `poll`         | `rich-renderers` (`PollRenderer`)                            | builtin          | no      | Configured via `PollDataProvider` (consumer-level)                                                                                                             |
| `mermaid`      | `rich-renderers` (`MermaidRenderer`)                         | builtin          | **yes** | Heavy: mermaid                                                                                                                                                 |
| `video`        | `rich-renderers` (`VideoRenderer`)                           | builtin          | no      |                                                                                                                                                                |
| `ruby`         | `rich-renderers` (`RubyRenderer`)                            | builtin          | no      |                                                                                                                                                                |
| `alert`        | `rich-renderers` (`AlertRenderer`)                           | builtin (verify) | no      | Phase 0: verify if a Lexical node exists                                                                                                                       |
| `banner`       | `rich-renderers` (`BannerRenderer`)                          | builtin (verify) | no      |                                                                                                                                                                |
| `image`        | `rich-renderers` (`ImageRenderer`)                           | builtin (verify) | no      |                                                                                                                                                                |
| `nested-doc`   | `rich-ext-nested-doc/static` (`nestedDocNodes`)              | yes              | no      | Recursive renderer relies on `NestedContentRendererProvider` set by composeRenderer                                                                            |

## Yohaku Migration

Single touchpoint: `apps/web/src/components/ui/rich-content/LexicalContent.tsx`.

```ts
// before
import '@haklex/rich-kit-shiro/style.css';
import { ShiroRenderer } from '@haklex/rich-kit-shiro/renderer';
import { createThemeStyle, PollDataProvider, PresentDialogProvider } from '@haklex/rich-kit-shiro';

// after
import '@haklex/rich-compose/style.css';
import { composeRenderer } from '@haklex/rich-compose';
import { embedModule } from '@haklex/rich-compose/modules/embed';
import { galleryModule } from '@haklex/rich-compose/modules/gallery';
import { codeSnippetModule } from '@haklex/rich-compose/modules/code-snippet';
import { chatModule } from '@haklex/rich-compose/modules/chat';
import { excalidrawModule } from '@haklex/rich-compose/modules/excalidraw';
import { katexModule } from '@haklex/rich-compose/modules/katex';
import { mentionModule } from '@haklex/rich-compose/modules/mention';
import { pollModule } from '@haklex/rich-compose/modules/poll';
import { mermaidModule } from '@haklex/rich-compose/modules/mermaid';
import { videoModule } from '@haklex/rich-compose/modules/video';
import { rubyModule } from '@haklex/rich-compose/modules/ruby';
import { alertModule } from '@haklex/rich-compose/modules/alert';
import { bannerModule } from '@haklex/rich-compose/modules/banner';
import { imageModule } from '@haklex/rich-compose/modules/image';
import { nestedDocModule } from '@haklex/rich-compose/modules/nested-doc';
import { LinkCardNode } from '@haklex/rich-compose/modules/link-card/node';
//   ^^ code-block uses Lexical's builtin `code` node — no custom Klass to import
import { createThemeStyle, PollDataProvider, PresentDialogProvider } from '@haklex/rich-editor';
//   ^^ direct import — kit-shiro's re-exports were proxies; new package does not re-export

const ShiroRenderer = composeRenderer({
  modules: [
    embedModule,
    galleryModule,
    codeSnippetModule,
    chatModule,
    excalidrawModule,
    katexModule,
    mentionModule,
    pollModule,
    mermaidModule,
    videoModule,
    rubyModule,
    alertModule,
    bannerModule,
    imageModule,
    nestedDocModule,
    {
      name: 'code-block',
      // builtin Lexical node, no `nodes` field needed
      renderers: { CodeBlock: LexicalCodeBlockOverride },
    },
    {
      name: 'link-card',
      nodes: [LinkCardNode],
      renderers: { LinkCard: LexicalLinkCard },
    },
  ],
  builtinNodeOverrides,
});

// JSX unchanged — Yohaku still wraps with PollDataProvider, PresentDialogProvider externally.
```

After migration, the Yohaku production bundle should contain neither shiki nor the default `LinkCardRenderer` chain. CI bundle gate enforces this.

## Old package deprecation

```jsonc
// haklex/packages/rich-kit-shiro/package.json
{
  "deprecated": "Renderer migrated to @haklex/rich-compose. Editor (ShiroEditor) remains here but receives no new features.",
}
```

Top of `packages/rich-kit-shiro/README.md` gets a banner pointing to `@haklex/rich-compose` and linking the migration guide.

## Tree-shake verification

`bundle-test/` contains four fixtures, each a minimal Vite app that imports a different shape:

| Fixture                  | Imports                                                | Expected gzipped (initial chunk) |
| ------------------------ | ------------------------------------------------------ | -------------------------------- |
| `core-only`              | `composeRenderer` + `core/style.css`                   | ~5 KB                            |
| `minimal`                | core + `embedModule` + `linkCardModule`                | ~30 KB                           |
| `shiro-full-eager`       | `shiroPreset` (lazy chunks split out)                  | ~120 KB                          |
| `shiro-with-2-overrides` | 15 modules + `CodeBlockNode` + `LinkCardNode` (Mode B) | ~95 KB                           |

CI gate (must run **production** Vite build, not dev — Turbopack/dev tree-shake differs):

- `core-only` > 8 KB → fail
- `minimal` > 40 KB → fail
- `shiro-with-2-overrides` MUST NOT contain `shiki` or `LinkCardRenderer` chunks (asset-graph assertion)

## Testing

- **Unit** (vitest): `composeRenderer` dedup / merge / lazy wrap / Provider stacking; module factories built once (identity-stable across re-renders).
- **Integration** (vitest + jsdom): each module gets a fixture serialized Lexical state → render → snapshot. Compares against the existing `ShiroRenderer` output for parity.
- **E2E** (existing Yohaku Playwright suite): visual diff of post / note / thinking pages; static HTML hash comparison server-side to catch hydration mismatches.

## Risks

| Risk                                                         | Severity | Mitigation                                                                                                               |
| ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| Yohaku visual regression                                     | High     | Per-module snapshot tests + Yohaku visual e2e diff                                                                       |
| Turbopack dev/prod tree-shake skew                           | Medium   | CI gate runs `pnpm build` (production) only                                                                              |
| Multiple lexical Klass instances → `instanceof` failure      | Low      | Strict `peerDependencies.lexical` (`^0.44.0`); Yohaku already pinned; README warning                                     |
| Lazy chunk SSR fallback nondeterminism → hydration mismatch  | Medium   | `ssrFallback` contract: no Date, no random, no client-only API; e2e static-HTML hash check                               |
| 17-module refactor scope creep                               | Medium   | Phase 2 split across multiple PRs (3-5 modules each)                                                                     |
| TS type regression vs old `ShiroRendererProps`               | Low      | `RichRendererBaseProps` defined as superset; dts diff in CI                                                              |
| `React.lazy` factory recreated per render → fallback flicker | High     | Lazy wrap done **once at compose time**, never inside the rendered component                                             |
| Suspense fallback re-shows during urgent updates             | Medium   | Wrap each lazy renderer in its own `<Suspense>` (granular boundaries); document for consumers                            |
| Nested content bypasses Provider stack                       | Medium   | composeRenderer always sets `NestedContentRendererProvider` to a recursive closure that re-enters the composed component |

## Phasing

| Phase                           | Scope                                                                                                                                                                                               | Estimate |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **0 · Bootstrap**               | Create `packages/rich-compose/`; ESM-only Vite + dts config; bundle-test scaffold; verify upstream node/renderer exports for catalog finalization                                                   | 1d       |
| **1 · Core**                    | `core/{types,compose,lazy,dedup,style.css}`; unit tests                                                                                                                                             | 1-2d     |
| **2 · Module migration**        | Port 17 modules into `node.ts/renderer.tsx/module.ts/index.ts` shape; add `lazyRenderers` + `ssrFallback` to the four heavy modules; per-module snapshot tests. Split across PRs (3-5 modules each) | 2-3d     |
| **3 · Preset + bundle gate**    | `presets/shiro/{index,full}`; CI bundle gate on production builds                                                                                                                                   | 1d       |
| **4 · Yohaku migration**        | Update `LexicalContent.tsx`; verify production bundle excludes shiki and default `LinkCardRenderer`; e2e visual diff                                                                                | 1d       |
| **5 · Old package deprecation** | `package.json` `deprecated` field; README banner; npm publish                                                                                                                                       | 0.5d     |

Total: ~7-9 working days.

## Open Items

1. **`shiroPresetExcept` API** — currently excluded as YAGNI. Documentation provides a filter example but warns it does not break the import graph.
2. **link-card platform plugins** (mx-space, github, leetcode, etc.) — currently kept inside the single `link-card` module, configured via `LinkCardFetchProvider` (consumer-level). Decision deferred: revisit if a consumer wants to drop specific platforms.
3. **Phase 0 verification** of `alert` / `banner` / `image` / `video` / `ruby` — confirm whether each has a dedicated Lexical node in `@haklex/rich-renderers` or is a builtin renderer mapping only. Catalog table updated accordingly.
4. **Yohaku's `Mermaid.tsx`** — Yohaku has its own Mermaid component in `apps/web/src/components/modules/shared/Mermaid.tsx`. Phase 0: confirm whether it bypasses kit-shiro's mermaid renderer. If yes, the new `mermaidModule`'s migration is no-op for Yohaku.
5. **Initial version of `@haklex/rich-compose`** — `0.1.0`. Not aligned with the haklex monorepo's `0.4.x` series; semver is independent.
6. **Dev-only warnings**: should the dev `composeRenderer` log a warning when a registered node type has no renderer (sync, lazy, or override)? — yes, with a suppression option for testing.
