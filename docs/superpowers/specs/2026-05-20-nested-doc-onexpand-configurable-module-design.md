# Nested Doc onExpand — Configurable Module

**Date:** 2026-05-20
**Author:** Innei
**Status:** Approved

## Goal

Remove the `Dialog` dependency (and the `usePresentDialog` context bridge) from the **static render path** of the nested-doc node. Move the "expand to fullscreen" UX out of `@haklex/rich-ext-nested-doc` and into a caller-injected callback, exactly mirroring the `onImageClick` pattern used by `imageModule` / `galleryModule` (`docs/superpowers/specs/2026-05-20-image-onclick-configurable-module-design.md`).

After this change, the `@haklex/rich-ext-nested-doc` static path imports zero dialog/portal code, and the only remaining Dialog leak in static render is `ExcalidrawDisplayRenderer` (deferred to a later refactor).

## Scope

In scope:

- `@haklex/rich-ext-nested-doc`: drop ctx consumption from the static decorator, expose a pure `NestedDocPreviewCard`.
- `@haklex/rich-compose/modules/nested-doc`: become a `defineConfigurableModule` factory exposing `onExpand`, register a composed renderer under `RendererConfig.NestedDoc`.
- Demo (`demo/src/lexical/LexicalRenderer.tsx`): wire `nestedDocModule.setup({ onExpand })` using the existing `presentDialog` for parity with previous behavior.

Out of scope (deferred):

- `ExcalidrawDisplayRenderer` static-path dialog usage.
- Deletion of `packages/rich-editor/src/context/PresentDialogContext.tsx`. Will be removed when excalidraw migrates and the static path has zero callers.
- Edit-path renderers (`*EditRenderer.tsx`) that import `presentDialog` directly — unchanged.

## Architecture

Mirrors `modules/image/` directory layout:

```
packages/rich-compose/src/modules/nested-doc/
  edit.ts            (existing — unchanged)
  index.ts           (extended exports)
  module.ts          (rewritten — uses createNestedDocModule)
  module-config.ts   (new)
  node.ts            (existing — unchanged)
  renderer.tsx       (new)
  types.ts           (new)
```

### Contract

```ts
// packages/rich-compose/src/modules/nested-doc/types.ts
import type { SerializedEditorState } from 'lexical';
import type { ReactNode } from 'react';

export interface NestedDocExpandPayload {
  title?: string;
  contentState: SerializedEditorState;
  /** Pre-rendered <NestedDocRenderer/> with ColorScheme/Variant/NestedContentRenderer ctx already wrapped. */
  content: ReactNode;
  target: HTMLElement;
}

export type OnNestedDocExpand = (payload: NestedDocExpandPayload) => void;

export interface NestedDocModuleConfig {
  onExpand?: OnNestedDocExpand;
}
```

```ts
// packages/rich-compose/src/modules/nested-doc/module-config.ts
import { defineConfigurableModule } from '../../core/configurable-module';
import type { NestedDocModuleConfig } from './types';

export const { createModule: createNestedDocModule, useConfig: useNestedDocConfig } =
  defineConfigurableModule<NestedDocModuleConfig>({
    name: 'nested-doc',
    defaultConfig: {},
  });
```

```tsx
// packages/rich-compose/src/modules/nested-doc/renderer.tsx
import {
  ColorSchemeProvider,
  NestedContentRendererProvider,
  useColorScheme,
  useOptionalNestedContentRenderer,
  useVariant,
} from '@haklex/rich-editor/static';
import {
  NestedDocPreviewCard,
  NestedDocRenderer,
  type NestedDocStaticRendererProps,
} from '@haklex/rich-ext-nested-doc/static';
import type { SerializedEditorState } from 'lexical';
import { type ComponentType, useCallback, useMemo } from 'react';

import { useNestedDocConfig } from './module-config';

export const ComposedNestedDocStaticRenderer: ComponentType<NestedDocStaticRendererProps> = ({
  contentState,
}) => {
  const { onExpand } = useNestedDocConfig();
  const colorScheme = useColorScheme();
  const variant = useVariant();
  const renderNestedContent = useOptionalNestedContentRenderer();

  const title = useMemo(() => extractTitle(contentState), [contentState]);

  const handleActivate = useCallback(
    (target: HTMLElement) => {
      if (!onExpand) return;
      const content = (
        <ColorSchemeProvider colorScheme={colorScheme}>
          <NestedContentRendererProvider value={renderNestedContent}>
            <NestedDocRenderer value={contentState} variant={variant} />
          </NestedContentRendererProvider>
        </ColorSchemeProvider>
      );
      onExpand({ contentState, title, content, target });
    },
    [onExpand, colorScheme, variant, renderNestedContent, contentState, title],
  );

  return (
    <NestedDocPreviewCard
      contentState={contentState}
      onActivate={onExpand ? handleActivate : undefined}
    />
  );
};
```

```ts
// packages/rich-compose/src/modules/nested-doc/module.ts
import { createNestedDocModule } from './module-config';
import { nestedDocNodes } from './node';
import { ComposedNestedDocStaticRenderer } from './renderer';

export const nestedDocModule = createNestedDocModule({
  nodes: nestedDocNodes,
  renderers: { NestedDoc: ComposedNestedDocStaticRenderer },
});
```

```ts
// packages/rich-compose/src/modules/nested-doc/index.ts
export { nestedDocModule } from './module';
export { useNestedDocConfig } from './module-config';
export { ComposedNestedDocStaticRenderer } from './renderer';
export type { NestedDocExpandPayload, NestedDocModuleConfig, OnNestedDocExpand } from './types';
```

### Ext package changes (`@haklex/rich-ext-nested-doc`)

Two distinct prop types:

```ts
// Props the renderer registered under RendererConfig.NestedDoc receives
// (called from NestedDocNode.decorate via RendererWrapper).
export interface NestedDocStaticRendererProps {
  contentState: SerializedEditorState;
}

// Props of the pure preview-card component.
export interface NestedDocPreviewCardProps {
  contentState: SerializedEditorState;
  onActivate?: (target: HTMLElement) => void;
}
```

`NestedDocStaticDecorator.tsx`:

- Extract the preview card UI into a new exported component `NestedDocPreviewCard` (props `NestedDocPreviewCardProps`). Render the Maximize2 overlay and attach click/keydown handlers only when `onActivate` is provided.
- Rewrite `DefaultNestedDocStaticRenderer` to be a thin `<NestedDocPreviewCard contentState={...} />` — no ctx reads, no dynamic import, no `onActivate`. This is the fallback path; in practice it never renders because `nestedDocModule` registers `ComposedNestedDocStaticRenderer` under `RendererConfig.NestedDoc`.
- Drop imports of `usePresentDialog`, `useColorScheme`, `useVariant`, `useOptionalNestedContentRenderer`, `usePortalTheme`, `ColorSchemeProvider`, `NestedContentRendererProvider`, `Maximize2` from this file (Maximize2 moves into `NestedDocPreviewCard`).
- Keep `NestedDocStaticDecorator` itself as a `RendererWrapper` shim — same signature, used by `NestedDocNode.decorate()`.

`static.ts` / `index.ts`:

- Export `NestedDocPreviewCard`, `NestedDocPreviewCardProps`, `NestedDocStaticRendererProps`.

### Demo wiring

`demo/src/lexical/LexicalRenderer.tsx`:

```ts
import { composeRenderer } from '@haklex/rich-compose';
import {
  allRendererModules,
  galleryModule,
  imageModule,
  nestedDocModule,
} from '@haklex/rich-compose/renderer';
import { presentDialog } from '@haklex/rich-editor-ui';

import { onImageClick } from '../lightbox/lightbox-store';
import * as css from './nested-doc-dialog.css';

const modules = allRendererModules.map((module) => {
  if (module === imageModule) return imageModule.setup({ onImageClick });
  if (module === galleryModule) return galleryModule.setup({ onImageClick });
  if (module === nestedDocModule) {
    return nestedDocModule.setup({
      onExpand: ({ title, content }) => {
        presentDialog({
          title,
          content: () => content,
          className: css.dialogPopup,
          showCloseButton: true,
          clickOutsideToDismiss: true,
          sheet: 'auto',
        });
      },
    });
  }
  return module;
});

export const LexicalRenderer = composeRenderer({ modules });
```

`demo/src/lexical/nested-doc-dialog.css.ts` — port the existing `staticDialogPopup` / `staticDialogBody` styles out of `@haklex/rich-ext-nested-doc/src/styles.css.ts` into the demo. Source style file in ext package keeps preview-card classes only.

## Default Behavior & Breaking Change

| Scenario                                                          | Behavior                                                              |
| ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| Caller composes `nestedDocModule` without `.setup({ onExpand })`  | Preview card renders; no Maximize2 overlay; click is a no-op          |
| Caller composes `nestedDocModule.setup({ onExpand })`             | Preview card renders with Maximize2 overlay; click invokes `onExpand` |
| Caller uses fallback `DefaultNestedDocStaticRenderer` (no module) | Identical to the first row — preview-only                             |

This is a **breaking change** for downstream consumers (Shiroi, Yohaku, admin-vue3) that rely on the previous auto-expand behavior. They must opt in by calling `nestedDocModule.setup({ onExpand })` after upgrading. Documented in changelog; downstream wiring updated by `release-orchestrator` skill flow.

## Files Modified

```
packages/rich-ext-nested-doc/src/
  NestedDocStaticDecorator.tsx   (rewrite — extract NestedDocPreviewCard, strip ctx reads)
  static.ts                      (add NestedDocPreviewCard export)
  index.ts                       (add NestedDocPreviewCard export)
  styles.css.ts                  (drop staticDialog* classes)

packages/rich-compose/src/modules/nested-doc/
  module.ts                      (rewrite using createNestedDocModule)
  module-config.ts               (new)
  renderer.tsx                   (new)
  types.ts                       (new)
  index.ts                       (add exports)

demo/src/lexical/
  LexicalRenderer.tsx            (wire nestedDocModule.setup)
  nested-doc-dialog.css.ts       (new — moved styles)
```

## Testing

- `pnpm --filter @haklex/rich-ext-nested-doc test` (if present) — verify pure renderer renders preview without onExpand and with onActivate.
- `pnpm --filter @haklex/rich-compose test` — verify `nestedDocModule.setup({ onExpand })` passes `onExpand` through ctx and the composed renderer calls it on click.
- Manual: `pnpm dev` in demo — click nested doc preview, dialog opens with full nested content, ColorScheme/variant preserved.
- Lint + typecheck only on changed files (per CLAUDE.md).

## Migration Notes for Downstream

After release:

- **Shiroi / Yohaku** (Next.js): in `shiroRendererConfig`/equivalent, when mapping modules, intercept `nestedDocModule` and call `.setup({ onExpand: ({ content, title }) => presentDialog({ title, content: () => content, ... }) })`.
- **admin-vue3**: same wiring in `packages/rich-react/src/shiro/`.

The downstream patch is mechanical and the `release-orchestrator` skill should handle propagation.

## Open Questions

None. `PresentDialogContext` cleanup deferred until `ExcalidrawDisplayRenderer` is refactored along the same pattern.
