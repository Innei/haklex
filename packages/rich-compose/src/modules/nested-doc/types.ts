import type { SerializedEditorState } from 'lexical';
import type { ReactNode } from 'react';

export interface NestedDocExpandPayload {
  content: ReactNode;
  contentState: SerializedEditorState;
  target: HTMLElement;
  title?: string;
}

export type OnNestedDocExpand = (payload: NestedDocExpandPayload) => void;

export interface NestedDocModuleConfig {
  onExpand?: OnNestedDocExpand;
}
