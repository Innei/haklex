import type {} from '@haklex/rich-editor/static';
import type { ComponentType } from 'react';

import type { ChartSlotProps } from './slot';

declare module '@haklex/rich-editor/static' {
  interface RendererConfig {
    Chart?: ComponentType<ChartSlotProps>;
  }
}

export const __augmentLoaded_chart = true;
