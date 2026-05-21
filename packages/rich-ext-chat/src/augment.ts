import type {} from '@haklex/rich-editor/static';
import type { ComponentType } from 'react';

import type { ChatRendererProps } from './types';

declare module '@haklex/rich-editor/static' {
  interface RendererConfig {
    Chat?: ComponentType<ChatRendererProps>;
  }
}

export const __augmentLoaded_chat = true;
