import type {} from '@haklex/rich-editor';
import type { ComponentType } from 'react';

import type { ChatRendererProps } from './types';

declare module '@haklex/rich-editor' {
  interface RendererConfig {
    Chat?: ComponentType<ChatRendererProps>;
  }
}

export {};
