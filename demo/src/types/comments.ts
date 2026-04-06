import type { CommentAnchor } from '@haklex/rich-editor';

export interface Comment {
  anchor: CommentAnchor;
  createdAt: number;
  id: string;
  text: string;
}

export interface BlockInfo {
  blockId: string;
  fingerprint: string;
  index: number;
  textContent: string;
  type: string;
}
