import type { ReviewBatch } from '@haklex/rich-agent-core';
import type { SerializedEditorState } from 'lexical';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { DiffReviewBubble } from '../src/components/DiffReviewBubble';

const emptyState = {
  root: { children: [], direction: null, format: '', indent: 0, type: 'root', version: 1 },
} as unknown as SerializedEditorState;

const batch: ReviewBatch = {
  id: 'b1',
  baseRevision: 0,
  baseSnapshot: emptyState,
  previewSnapshot: emptyState,
  status: 'pending',
  entries: [],
  touchedBlockIds: [],
};

describe('DiffReviewBubble', () => {
  it('places Reject before Accept', () => {
    const html = renderToStaticMarkup(<DiffReviewBubble batch={batch} />);
    const reject = html.indexOf('>Reject<');
    const accept = html.indexOf('>Accept<');
    expect(reject).toBeGreaterThan(-1);
    expect(accept).toBeGreaterThan(reject);
  });
});
