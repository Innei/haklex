import { stepsNodes } from '@haklex/rich-ext-steps/node';

import type { RichRendererModule } from '../../core/types';

export const STEPS_MODULE_NAME = 'steps' as const;

export const stepsModule: RichRendererModule = {
  name: STEPS_MODULE_NAME,
  nodes: stepsNodes,
  lazyRenderers: {
    Steps: () =>
      import('@haklex/rich-ext-steps/renderer').then((m) => ({ default: m.StepsRenderer })),
  },
};
