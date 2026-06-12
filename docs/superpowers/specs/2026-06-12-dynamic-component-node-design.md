# Dynamic External Component Node — Design

**Date**: 2026-06-12
**Status**: Approved

## Problem

Authors want to embed externally-authored interactive components (e.g. a teaching interaction widget) directly into documents. The component is not part of the haklex codebase or the host app bundle — it is written, built, and deployed independently, and loaded at runtime from a URL. This requires:

1. A new Lexical node to carry the reference (URL + per-instance props).
2. A loading mechanism and a stable interface contract between host and external component.
3. Complete style isolation between the external component and the editor.
4. Host-state awareness in the external component, primarily color scheme (light/dark).

## Decisions Made

| Question            | Decision                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Distribution format | Remote ESM module, loaded via dynamic `import(url)`                                                                              |
| Export contract     | Framework-agnostic mount protocol, plus a `defineDynamicComponent()` React helper that wraps a React component into the protocol |
| Style isolation     | Shadow DOM container; theme crosses the boundary via CSS custom properties                                                       |
| Height stability    | Node stores `initialHeight`; used as `min-height` until mount, then natural content height takes over                            |
| Per-instance props  | Node stores a `props: Record<string, unknown>` JSON payload, passed through at mount                                             |
| Read-only rendering | Static renderer also loads and mounts the component (readers interact); SSR emits a placeholder sized by `initialHeight`         |
| Theme awareness     | Two channels: JS push via `handle.update()` + CSS custom properties piercing the shadow boundary                                 |

## Architecture

### Packages

- **`@haklex/rich-dynamic-protocol`** (new, published) — the only package external authors install.
  - Root export: protocol types only, zero dependencies.
  - `./react` subpath: `defineDynamicComponent()` helper, `react` / `react-dom` as peer dependencies.
- **`@haklex/rich-ext-dynamic`** (new) — `DynamicNode`, `DynamicEditNode`, static + edit renderers, module loader.
- **`@haklex/rich-compose`** — new `src/modules/dynamic/` module following the excalidraw module pattern (`module.ts`, `module-config.ts`, `renderer.tsx`, `node.ts`, `types.ts`).
- **`@haklex/rich-litexml`** — writer + reader + `default-registry.ts` registration.

### Node Payload

```ts
type SerializedDynamicNode = Spread<
  {
    url: string;
    props: Record<string, unknown>;
    initialHeight: number;
  },
  SerializedLexicalNode
>;
```

- `DynamicNode extends DecoratorNode<ReactElement>`; `$createDynamicNode()` / `$isDynamicNode()` factories.
- All setters go through `getWritable()`, reads through `getLatest()`, per existing convention (see `ExcalidrawNode`).
- `decorate()` returns `createRendererDecoration(DYNAMIC_NODE_KEY, undefined, payload)` — no default renderer import, keeping the node tree-shakable; the composed renderer is injected via the compose module.
- Slot declared via module augmentation on `RendererConfig` (same pattern as `rich-ext-excalidraw/src/slot.ts`).
- `DynamicEditNode extends DynamicNode`, overriding `decorate()` with the edit renderer. Registered in `config-edit.ts`; base node in `config.ts`.

### Mount Protocol (`@haklex/rich-dynamic-protocol`)

```ts
export interface DynamicHostContext {
  theme: 'light' | 'dark';
}

export interface DynamicMountInput {
  props: Record<string, unknown>;
  host: DynamicHostContext;
}

export interface DynamicMountHandle {
  update?(input: DynamicMountInput): void;
  unmount(): void;
}

export interface DynamicComponentModule {
  mount(container: HTMLElement, input: DynamicMountInput): DynamicMountHandle;
}
```

The external module's **default export** must satisfy `DynamicComponentModule`.

- `container` is a div the host creates **inside a ShadowRoot**. Components injecting `<style>` tags must target `container.getRootNode()` (the shadow root), not `document.head`. The React helper handles this automatically where possible; the authoring docs state it explicitly.
- The contract is push-based: when host state changes (theme) or node props change, the host calls `handle.update(input)` with the full new input. No subscription API.
- `DynamicHostContext` is designed to grow (e.g. `variant`, `locale`) without breaking the protocol — additions are optional fields.

### React Helper (`@haklex/rich-dynamic-protocol/react`)

```ts
export function defineDynamicComponent(
  render: (props: Record<string, unknown>, host: DynamicHostContext) => ReactElement,
): DynamicComponentModule;
```

Implementation: `mount` calls `createRoot(container)` and renders `render(props, host)`; `update` re-renders with new input; `unmount` calls `root.unmount()`. External authors bundle their own React (host React is not shared — no externals contract, no version coupling).

### Loading & Isolation (renderer behavior)

1. Renderer renders a host element; on mount, `attachShadow({ mode: 'open' })` and create the inner container div.
2. Wrap in `ViewportGate` — the module is only imported when the node enters the viewport (existing project convention).
3. Load via `import(/* @vite-ignore */ url)` with a cancellation flag to guard against unmount races (pattern from `EmbedStaticRenderer`).
4. Three states:
   - **loading**: placeholder with `min-height: initialHeight` to prevent layout collapse.
   - **mounted**: `min-height` removed; height follows the component's natural content flow.
   - **error**: error placeholder (URL shown, retry button), still sized by `initialHeight`.
5. Theme tokens: the host sets CSS custom properties (sourced from `@haklex/rich-style-token`, values switched by color scheme) on the shadow host element. Custom properties pierce the shadow boundary, so external CSS can use `var(--hx-*)` directly with zero JS.

### Theme / State Awareness

Two complementary channels:

- **JS push** (behavioral): renderer reads `useColorScheme()`; the initial `mount` receives `input.host.theme`, and an effect calls `handle.update({ props, host: { theme } })` whenever theme or props change. Components using the React helper receive `host` as the render function's second argument.
- **CSS custom properties** (visual): purely visual theming requires no JS — external stylesheets reference host-provided `var(--hx-*)` tokens which already carry the active scheme's values.

### Edit Experience

- `DynamicEditNode`'s edit renderer adds a settings popover: URL input, `initialHeight` number input, props JSON textarea (validated on apply).
- `INSERT_DYNAMIC_COMMAND` exported from `rich-ext-dynamic`; a slash menu entry registers it.

### LiteXML

- Writer: `<dynamic url="..." initial-height="320">` with props serialized as JSON inside CDATA; self-closing when props are empty.
- Reader: parses attributes + CDATA JSON back into the serialized node shape.
- Registered in `default-registry.ts`. The `rich-ext-ai-agent` system prompt is **not** updated — the node is not agent-creatable in this iteration.

### SSR / Static Rendering

The static renderer SSRs a placeholder div with `min-height: initialHeight`. On the client, the same mount pipeline runs (ViewportGate → import → mount), so read-only documents are fully interactive.

## Security

`import(url)` executes arbitrary remote code in the host page's origin. The trust boundary belongs to the host application:

- The compose module config exposes `validateUrl?: (url: string) => boolean`. When provided, URLs failing validation render the error state instead of loading. When omitted, all URLs load.
- The spec and authoring docs state plainly: only embed components from origins the host application trusts. Shadow DOM isolates styles, **not** script capability.

## Error Handling

- Import failure (network, invalid module, missing default export with `mount`): error placeholder with retry.
- `mount`/`update` throwing: caught, error state shown, handle discarded.
- Invalid props JSON in the edit popover: inline validation error, apply blocked.
- Unmount during in-flight import: cancellation flag prevents mounting into a dead container; if mounted, `handle.unmount()` is called in the effect cleanup.

## Testing

- **Protocol package**: unit tests for `defineDynamicComponent` (mount renders, update re-renders with new props/host, unmount cleans up).
- **Node**: serialization round-trip (`exportJSON`/`importJSON`), litexml writer/reader round-trip.
- **Renderer**: loading → mounted → error state transitions with a mocked `import()`; theme change triggers `handle.update`; `initialHeight` applied before mount and released after.
- **Edit**: props JSON validation, insert command creates a node.

## Out of Scope

- Sharing host React with external components (import maps / externals).
- iframe fallback mode.
- AI-agent creatability of the node.
- Component registry / discovery UI — authors paste URLs.
