import type { ReactNode } from 'react';

export interface WhiteboardExpandPayload {
  content: ReactNode;
  elementCount?: number;
  target: HTMLElement;
  theme: 'light' | 'dark';
}

export type OnWhiteboardExpand = (payload: WhiteboardExpandPayload) => void;

export interface WhiteboardModuleConfig {
  onExpand?: OnWhiteboardExpand;
}
