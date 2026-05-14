import { AlertRenderer } from '@haklex/rich-renderer-alert/static';

import type { RichRendererModule } from '../../core/types';

export const ALERT_MODULE_NAME = 'alert' as const;

export const alertModule: RichRendererModule = {
  name: ALERT_MODULE_NAME,
  renderers: { Alert: AlertRenderer },
};
