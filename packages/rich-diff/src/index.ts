import './style.css';

export type { RichDiffLayout, RichDiffProps } from './RichDiff';
export { RichDiff } from './RichDiff';
export type {
  DeltaStats,
  DiffHunk,
  DiffOpType,
  InlineDiffBlock,
  InlineDiffBlockType,
} from '@haklex/rich-diff-core';
export {
  computeDeltaStats,
  computeDiff,
  computeInlineDiff,
  formatDeltaStats,
} from '@haklex/rich-diff-core';
