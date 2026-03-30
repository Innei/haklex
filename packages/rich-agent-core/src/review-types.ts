import type { SerializedEditorState } from 'lexical';

import type { AgentOperation } from './types';

export type ReviewEntryStatus = 'pending' | 'accepted' | 'rejected' | 'conflicted';
export type ReviewBatchStatus =
  | 'pending'
  | 'order_dependent'
  | 'accepted'
  | 'rejected'
  | 'conflicted';

export type ReviewEntry = {
  id: string;
  op: AgentOperation;
  targetBlockId?: string;
  anchorBeforeId?: string;
  anchorAfterId?: string;
  originalFingerprint: string;
  status: ReviewEntryStatus;
};

export type ReviewBatch = {
  id: string;
  baseRevision: number;
  baseSnapshot: SerializedEditorState;
  previewSnapshot: SerializedEditorState;
  status: ReviewBatchStatus;
  entries: ReviewEntry[];
  touchedBlockIds: string[];
};

export type ReviewState = {
  documentRevision: number;
  batches: ReviewBatch[];
};
