import { embedNodes } from '@haklex/rich-ext-embed/static';

import type { RichRendererModule } from '../../core/types';

export const embedModule: RichRendererModule = {
  name: 'embed',
  nodes: embedNodes,
};
