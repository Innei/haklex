import type { InlineDiffBlock, InlineDiffBlockType } from '@haklex/rich-diff-core';
import type { SerializedLexicalNode } from 'lexical';

export type InlineSegment =
  | { kind: 'blocks'; nodes: SerializedLexicalNode[]; type: InlineDiffBlockType }
  | { count: number; kind: 'collapsed' };

export interface InlineSegmentOptions {
  collapseUnchanged: boolean;
  context: number;
}

function pushBlock(segments: InlineSegment[], block: InlineDiffBlock) {
  const last = segments.at(-1);
  if (last?.kind === 'blocks' && last.type === block.type) {
    last.nodes.push(block.node);
  } else {
    segments.push({ kind: 'blocks', type: block.type, nodes: [block.node] });
  }
}

export function buildInlineSegments(
  blocks: InlineDiffBlock[],
  { collapseUnchanged, context }: InlineSegmentOptions,
): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let i = 0;
  while (i < blocks.length) {
    if (!collapseUnchanged || blocks[i].type !== 'equal') {
      pushBlock(segments, blocks[i]);
      i++;
      continue;
    }

    let end = i;
    while (end < blocks.length && blocks[end].type === 'equal') end++;
    const run = blocks.slice(i, end);
    const keepHead = i === 0 ? 0 : context;
    const keepTail = end === blocks.length ? 0 : context;

    if (run.length - keepHead - keepTail < 2) {
      for (const block of run) pushBlock(segments, block);
    } else {
      for (const block of run.slice(0, keepHead)) pushBlock(segments, block);
      segments.push({ kind: 'collapsed', count: run.length - keepHead - keepTail });
      for (const block of run.slice(run.length - keepTail)) pushBlock(segments, block);
    }
    i = end;
  }
  return segments;
}
