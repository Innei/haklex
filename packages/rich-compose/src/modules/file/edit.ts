import { FileEditRenderer } from '@haklex/rich-renderer-file';

import type { RichEditorModule } from '../../core/types';
import { fileModule } from './module';

export const fileEditModule: RichEditorModule = {
  ...fileModule,
  editRenderers: { File: FileEditRenderer },
};
