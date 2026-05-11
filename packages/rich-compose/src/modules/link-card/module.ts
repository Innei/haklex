import { LinkCardRenderer } from '@haklex/rich-renderer-linkcard/static';

import type { RichRendererModule } from '../../core/types';

export const linkCardModule: RichRendererModule = {
  name: 'link-card',
  renderers: { LinkCard: LinkCardRenderer },
};
