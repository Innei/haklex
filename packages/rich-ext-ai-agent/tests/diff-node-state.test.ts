import type { SerializedEditorState } from 'lexical';
import { describe, expect, it } from 'vitest';

import { projectAgentDiffNodesToFactualState } from '../src/nodes/diff-node-state';

function textNode(text: string) {
  return {
    type: 'text',
    text,
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    version: 1,
  };
}

function paragraph(text: string, blockId: string) {
  return {
    type: 'paragraph',
    children: [textNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    version: 1,
    $: { blockId },
  };
}

describe('projectAgentDiffNodesToFactualState', () => {
  it('projects pending diff nodes back to the pre-accept document', () => {
    const original = paragraph('Original paragraph', 'b1');
    const proposed = paragraph('Proposed paragraph', 'b1');
    const inserted = paragraph('Inserted paragraph', 'b2');
    const deleted = paragraph('Deleted paragraph', 'b3');

    const editorState = {
      root: {
        type: 'root',
        children: [
          {
            type: 'agent-diff',
            version: 2,
            batchId: 'batch-1',
            diffEntryId: 'replace-1',
            opType: 'replace',
            originalNode: original,
            proposedNode: proposed,
          },
          {
            type: 'agent-diff',
            version: 2,
            batchId: 'batch-1',
            diffEntryId: 'insert-1',
            opType: 'insert',
            originalNode: null,
            proposedNode: inserted,
          },
          {
            type: 'agent-diff',
            version: 2,
            batchId: 'batch-1',
            diffEntryId: 'delete-1',
            opType: 'delete',
            originalNode: deleted,
            proposedNode: null,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    } as unknown as SerializedEditorState;

    const projected = projectAgentDiffNodesToFactualState(editorState);

    expect((projected.root as any).children).toEqual([original, deleted]);
  });
});
