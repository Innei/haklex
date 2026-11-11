import type { ComponentType } from 'react';

export const WHITEBOARD_NODE_KEY = 'Whiteboard' as const;

export interface WhiteboardSlotProps {
  snapshot: string;
}

declare module '@haklex/rich-editor/static' {
  interface RendererConfig {
    Whiteboard?: ComponentType<WhiteboardSlotProps>;
  }
}
