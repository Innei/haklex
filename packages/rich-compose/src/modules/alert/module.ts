import { AlertRenderer } from '@haklex/rich-renderer-alert/static';

import type { RichRendererModule } from '../../core/types';

export const alertModule: RichRendererModule = {
  name: 'alert',
  renderers: { Alert: AlertRenderer },
};
