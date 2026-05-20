import type { ComponentType } from 'react';

export const EXCALIDRAW_NODE_KEY = 'Excalidraw' as const;

export interface ExcalidrawSlotProps {
  snapshot: string;
}

declare module '@haklex/rich-editor' {
  interface RendererConfig {
    Excalidraw?: ComponentType<ExcalidrawSlotProps>;
  }
}
