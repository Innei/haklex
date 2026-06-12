import type { ComponentType } from 'react';

export const DYNAMIC_NODE_KEY = 'Dynamic' as const;

export interface DynamicSlotProps {
  componentProps: Record<string, unknown>;
  initialHeight: number;
  url: string;
}

declare module '@haklex/rich-editor/static' {
  interface RendererConfig {
    Dynamic?: ComponentType<DynamicSlotProps>;
  }
}
