import { FileRenderer } from '@haklex/rich-renderer-file/static';

import type { RichRendererModule } from '../../core/types';

export const fileModule: RichRendererModule = {
  name: 'file',
  renderers: { File: FileRenderer },
};
