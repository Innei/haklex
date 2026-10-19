import type { ReactNode } from 'react';

export interface ExcalidrawExpandPayload {
  content: ReactNode;
  elementCount?: number;
  target: HTMLElement;
  theme: 'light' | 'dark';
}

export type OnExcalidrawExpand = (payload: ExcalidrawExpandPayload) => void;

export interface ExcalidrawModuleConfig {
  onExpand?: OnExcalidrawExpand;
}
