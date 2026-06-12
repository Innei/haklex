import type {} from '@haklex/rich-editor/static';
import type { ComponentType } from 'react';

import type { DynamicSlotProps } from './slot';

declare module '@haklex/rich-editor/static' {
  interface RendererConfig {
    Dynamic?: ComponentType<DynamicSlotProps>;
  }
}

export const __augmentLoaded_dynamic = true;
