import { LinkCardRenderer } from '@haklex/rich-renderer-linkcard/static';

import type { RichRendererModule } from '../../core/types';

/**
 * Link-card module — `LinkCardNode` is registered by `@haklex/rich-editor`
 * (it lives in `customNodes`/`allNodes`). This module only contributes the
 * default renderer; consumers wanting a custom renderer construct their own
 * module with the same `name` and avoid importing `linkCardModule`.
 */
export const linkCardModule: RichRendererModule = {
  name: 'link-card',
  renderers: { LinkCard: LinkCardRenderer },
};
