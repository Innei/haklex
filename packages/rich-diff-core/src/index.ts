export type { DeltaStats } from './compute-delta-stats';
export { computeDeltaStats, formatDeltaStats } from './compute-delta-stats';
export type {
  DiffHunk,
  DiffOpType,
  InlineDiffBlock,
  InlineDiffBlockType,
  MarkKind,
} from './compute-diff';
export {
  computeDiff,
  computeInlineDiff,
  decorateSubtree,
  diffMergedNode,
  diffModifiedNode,
} from './compute-diff';
