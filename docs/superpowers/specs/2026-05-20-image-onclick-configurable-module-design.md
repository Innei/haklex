# Image `onImageClick` — Configurable Module Mechanism

Date: 2026-05-20

## Goal

Remove the `react-photo-view` dependency from the library packages
(`@haklex/rich-renderer-image`, `@haklex/rich-ext-gallery`, `@haklex/rich-compose`).
Replace the built-in lightbox with an opt-in `onImageClick` callback delivered
through a new, reusable "configurable module" mechanism. Downstream apps own the
lightbox UI. The `demo/` workspace keeps `react-photo-view` and implements a
sample lightbox to validate the flow end-to-end.

## Background

`react-photo-view` powers a click-to-zoom lightbox in two places:
`rich-renderer-image/src/ImageRenderer.tsx` and
`rich-ext-gallery/src/GalleryRenderer.tsx`. `rich-compose` modules are currently
plain `RichRendererModule` objects; the `RichRendererModule.Provider` field
exists in the type but is unused.

## Photo-list scoping

- A standalone `ImageNode` belongs to an article-wide collection: one registry
  per `RichRenderer` instance collects every standalone image; `onImageClick`
  receives all of them ordered by document position, plus the clicked index.
- Each `Gallery` is an independent scope: clicking a gallery image yields that
  gallery's own images.

## 1. Generic mechanism — `defineConfigurableModule`

New file `packages/rich-compose/src/core/configurable-module.tsx`.

```ts
export interface ConfigurableModule<TConfig> extends RichRendererModule {
  setup(config: TConfig): RichRendererModule;
}

export function defineConfigurableModule<TConfig extends object>(opts: {
  name: string;
  defaultConfig: TConfig;
}): {
  createModule: (base: Omit<RichRendererModule, 'name'>) => ConfigurableModule<TConfig>;
  useConfig: () => TConfig;
};
```

- A React Context carries `TConfig`, default value = `defaultConfig`.
- `useConfig()` reads it via `use(Context)`.
- `defineConfigurableModule` is split from module construction so the renderer
  (which needs `useConfig`) and the module (which needs the renderer) form a
  clean dependency graph instead of a circular import. It only needs
  `name` + `defaultConfig`; `createModule(base)` builds the module later.
- `createModule(base)` returns a `ConfigurableModule` — usable directly
  (default config) or via `.setup(config)`. Its `Provider` is `base.Provider`
  composed with a `ConfigProvider` that sets `<Context value={config}>`.
- `.setup(config)` returns a plain `RichRendererModule` (no `.setup`) — the
  NestJS `DynamicModule` analog.
- Per node, a leaf `module-config.ts` holds the `defineConfigurableModule`
  call (exporting `useConfig` + `createModule`); the renderer imports
  `useConfig`; `module.ts` imports `createModule` + the renderer.
- `composeRenderer` / `composeEditor` need no changes: both the configurable
  module and `module.setup(...)` are valid `RichRendererModule` array entries.

## 2. Shared image types

New file `packages/rich-compose/src/modules/image/types.ts`:

```ts
export interface RichImageInfo {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  thumbhash?: string;
}
export interface ImageClickPayload {
  current: RichImageInfo;
  images: RichImageInfo[];
  index: number;
  target: HTMLElement;
}
export type OnImageClick = (payload: ImageClickPayload) => void;
export interface ImageModuleConfig {
  onImageClick?: OnImageClick;
}
```

The gallery module reuses these. `@haklex/rich-ext-gallery` cannot depend on
`rich-compose`, so the gallery _package_ declares structurally-compatible local
payload types; the gallery _module_ (inside rich-compose) bridges them.

## 3. Image module

- `packages/rich-compose/src/modules/image/registry.tsx` — new.
  `ImageRegistryProvider` creates a per-mount registry via `useRef`. Entries:
  `{ el: HTMLElement, info: RichImageInfo }`. Hooks: `useRegisterImage(ref, info)`
  registers/unregisters across mount; `useImageRegistry()` exposes
  `resolve(target)` which sorts entries by `compareDocumentPosition` and locates
  the entry whose `el` contains `target`, returning `{ images, index }`.
- `packages/rich-compose/src/modules/image/renderer.tsx` — becomes
  `ComposedImageRenderer: ComponentType<ImageRendererProps>`:
  - reads `useImageConfig()`.
  - no `onImageClick` → render plain `<ImageRenderer {...props} />`.
  - with `onImageClick` → hold `figureRef`; `useRegisterImage(figureRef, info)`;
    render `<ImageRenderer ref={figureRef} {...props} onActivate={handleActivate} />`;
    `handleActivate(target)` → `resolve(target)` →
    `onImageClick({ current: images[index], images, index, target })`.
- `packages/rich-compose/src/modules/image/module-config.ts` — new leaf:
  `defineConfigurableModule({ name: 'image', defaultConfig: {} })`, exporting
  `useImageConfig` + `createImageModule`.
- `packages/rich-compose/src/modules/image/module.ts` — calls
  `createImageModule({ renderers: { Image: ComposedImageRenderer }, Provider:
ImageRegistryProvider })`.

## 4. Gallery module

- `packages/rich-compose/src/modules/gallery/module-config.ts` — new leaf:
  `defineConfigurableModule({ name: 'gallery', defaultConfig: {} })`, exporting
  `useGalleryConfig` + `createGalleryModule` (config type reuses
  `ImageModuleConfig`).
- `packages/rich-compose/src/modules/gallery/renderer.tsx` — `ComposedGalleryRenderer`:
  reads `useGalleryConfig()`, renders
  `<Suspense><LazyGallery {...props} onImageClick={onImageClick} /></Suspense>`
  with `LazyGallery = lazy(() => import('@haklex/rich-ext-gallery/renderer'))`
  created once at module scope (preserves code-splitting).
- `module.ts` — `createGalleryModule({ nodes, renderers: { Gallery:
ComposedGalleryRenderer } })`, replacing the previous `lazyRenderers` entry.
- `src/cli/litexml-html-preview-client.tsx` repoints its `GalleryRenderer`
  import to `@haklex/rich-ext-gallery/renderer` (the module renderer is now the
  config wrapper).

## 5. Library package changes — remove `react-photo-view`

### `@haklex/rich-renderer-image`

- `src/ImageRenderer.tsx`: drop the CSS side-effect import and
  `PhotoProvider`/`PhotoView`. Props become
  `ImageRendererProps & { onActivate?: (target: HTMLElement) => void; ref?: Ref<HTMLElement> }`;
  `ref` targets the root `<figure>`. With `onActivate` set, the frame is
  interactive (`cursor: zoom-in`, `role="button"`, `tabIndex`, Enter/Space) and
  invokes `onActivate(imgElement)`. Without it, the figure is plain and
  non-interactive (no role/tabIndex/keyboard).
- `package.json`: remove `react-photo-view`; description drops "and lightbox".

### `@haklex/rich-ext-gallery`

- `src/GalleryRenderer.tsx`: drop react-photo-view. `GalleryRendererProps` gains
  `onImageClick?` (local type). `GalleryFigure` becomes interactive when the
  handler is present; click invokes it with the gallery's images mapped to the
  payload shape plus the clicked `target`.
- `package.json`: remove `react-photo-view`.

### `@haklex/rich-compose`

- `src/types.d.ts`: keep `declare module '*.css'` (other packages still
  side-effect-import raw CSS); update the comment to drop the react-photo-view
  reference.

## 6. Public exports

`rich-compose` `core/index.ts` + `src/index.ts` export `defineConfigurableModule`,
`ConfigurableModule`, and `RichImageInfo` / `ImageClickPayload` / `OnImageClick` /
`ImageModuleConfig`.

## 7. Demo

- `demo/package.json` and `demo/vite.config.ts` are unchanged (demo remains a
  `react-photo-view` consumer).
- New `demo/src/lightbox/`:
  - a module-scope **stable** `onImageClick` that forwards payloads to a
    subscribed handler (`composeRenderer` runs at module scope, so the handler
    baked into `.setup()` must be stable).
  - `LightboxProvider`: subscribes to the forwarder; holds `{ images, index,
visible }`; renders `<PhotoSlider>` from `react-photo-view`. Maps
    `RichImageInfo[]` → `DataType[]` (`{ key, src, width, height }`) and sets the
    current item's `originRef` to the payload `target`. Imports
    `react-photo-view/dist/react-photo-view.css`. Mounted at the demo App root.
- `demo/src/lexical/LexicalRenderer.tsx`: rebuild the modules list, replacing the
  `image` and `gallery` modules (matched by `.name`) with their
  `.setup({ onImageClick })` forms.
- `demo/src/lexical/LexicalEditor.tsx`: unchanged — the lightbox applies to the
  renderer only.

## Verification

- `pnpm install` to refresh `pnpm-lock.yaml`.
- Lint changed files + `pnpm typecheck`.
- `pnpm dev`, open the demo, confirm: a standalone image opens the lightbox with
  every article image navigable; a gallery image opens the lightbox scoped to
  that gallery.

## Backward compatibility

`imageModule` / `galleryModule` stay valid `RichRendererModule` values (default
config = no `onImageClick` → plain images). `allRendererModules` and the default
`rich-compose` preset are unaffected.
