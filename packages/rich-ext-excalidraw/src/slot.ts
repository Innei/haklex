import type { ComponentType } from 'react';

export const EXCALIDRAW_NODE_KEY = 'Excalidraw' as const;

export interface ExcalidrawSlotProps {
  snapshot: string;
}

declare module '@haklex/rich-editor/static' {
  interface RendererConfig {
    Excalidraw?: ComponentType<ExcalidrawSlotProps>;
  }
}
