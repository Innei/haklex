import type {} from '@haklex/rich-editor';
import type { ComponentType } from 'react';

import type { PollRendererProps } from './types';

declare module '@haklex/rich-editor' {
  interface RendererConfig {
    Poll?: ComponentType<PollRendererProps>;
  }
}

export {};
