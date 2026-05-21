import type {} from '@haklex/rich-editor/static';
import type { ComponentType } from 'react';

import type { PollRendererProps } from './types';

declare module '@haklex/rich-editor/static' {
  interface RendererConfig {
    Poll?: ComponentType<PollRendererProps>;
  }
}

export const __augmentLoaded_poll = true;
