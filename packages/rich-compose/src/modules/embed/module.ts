import { embedNodes } from '@haklex/rich-ext-embed/static';

import type { RichRendererModule } from '../../core/types';

/**
 * Embed module — registers the EmbedNode Klass.
 *
 * The embed node's `decorate()` calls `EmbedStaticRenderer` internally; per-
 * platform component injection happens via `EmbedRendererProvider` at the
 * consumer level (it's data, not a renderer slot in `RendererConfig`).
 * Hence this module declares only `nodes`.
 */
export const embedModule: RichRendererModule = {
  name: 'embed',
  nodes: embedNodes,
};
