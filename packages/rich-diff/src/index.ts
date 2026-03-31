import './style.css';

export type { RichDiffProps } from './RichDiff';
export { RichDiff } from './RichDiff';
export type { DeltaStats, DiffHunk, DiffOpType } from '@haklex/rich-diff-core';
export { computeDeltaStats, computeDiff, formatDeltaStats } from '@haklex/rich-diff-core';
