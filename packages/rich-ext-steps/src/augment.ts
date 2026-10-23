import type {} from '@haklex/rich-editor/static';
import type { ComponentType } from 'react';

import type { StepsRendererProps } from './types';

declare module '@haklex/rich-editor/static' {
  interface RendererConfig {
    Steps?: ComponentType<StepsRendererProps>;
  }
}

export const __augmentLoaded_steps = true;
