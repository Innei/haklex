import { AlertEditRenderer } from '@haklex/rich-renderer-alert';

import type { RichEditorModule } from '../../core/types';
import { alertModule } from './module';

export const alertEditModule: RichEditorModule = {
  ...alertModule,
  editRenderers: { Alert: AlertEditRenderer },
};
