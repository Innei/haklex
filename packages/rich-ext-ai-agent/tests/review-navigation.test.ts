// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import {
  getReviewPosition,
  isTextEntryTarget,
  matchReviewShortcut,
  reconcileCurrentHunk,
  stepReviewHunk,
} from '../src/plugins/review-navigation';

const keys = ['a', 'b', 'c'];

function key(init: Partial<KeyboardEventInit> & { key: string }) {
  return new KeyboardEvent('keydown', init);
}

describe('review position', () => {
  it('reports a 1-based position and the total', () => {
    expect(getReviewPosition(keys, 'b')).toEqual({ position: 2, total: 3 });
  });

  it('reports position 0 when nothing is current', () => {
    expect(getReviewPosition(keys, null)).toEqual({ position: 0, total: 3 });
    expect(getReviewPosition([], null)).toEqual({ position: 0, total: 0 });
  });
});

describe('stepping between hunks', () => {
  it('moves forward and backward', () => {
    expect(stepReviewHunk(keys, 'a', 1)).toBe('b');
    expect(stepReviewHunk(keys, 'c', -1)).toBe('b');
  });

  it('wraps around at both ends', () => {
    expect(stepReviewHunk(keys, 'c', 1)).toBe('a');
    expect(stepReviewHunk(keys, 'a', -1)).toBe('c');
  });

  it('starts from the first or last hunk when nothing is current', () => {
    expect(stepReviewHunk(keys, null, 1)).toBe('a');
    expect(stepReviewHunk(keys, null, -1)).toBe('c');
    expect(stepReviewHunk([], null, 1)).toBeNull();
  });
});

describe('keeping the current hunk after the document changes', () => {
  it('keeps the current hunk while it still exists', () => {
    expect(reconcileCurrentHunk(keys, ['x', 'b', 'c'], 'b')).toBe('b');
  });

  it('moves to the hunk that took the resolved one’s place', () => {
    expect(reconcileCurrentHunk(keys, ['a', 'c'], 'b')).toBe('c');
  });

  it('falls back to the new last hunk when the last one was resolved', () => {
    expect(reconcileCurrentHunk(keys, ['a', 'b'], 'c')).toBe('b');
  });

  it('defaults to the first hunk and clears when none remain', () => {
    expect(reconcileCurrentHunk([], keys, null)).toBe('a');
    expect(reconcileCurrentHunk(keys, [], 'b')).toBeNull();
  });
});

describe('review shortcuts', () => {
  it('maps ⌥↑ / ⌥↓ to previous / next', () => {
    expect(matchReviewShortcut(key({ key: 'ArrowUp', altKey: true }), true)).toBe('previous');
    expect(matchReviewShortcut(key({ key: 'ArrowDown', altKey: true }), true)).toBe('next');
  });

  it('maps ⌘↵ / ⌘⌫ to accept / reject on macOS', () => {
    expect(matchReviewShortcut(key({ key: 'Enter', metaKey: true }), true)).toBe('accept');
    expect(matchReviewShortcut(key({ key: 'Backspace', metaKey: true }), true)).toBe('reject');
    expect(matchReviewShortcut(key({ key: 'Enter', ctrlKey: true }), true)).toBeNull();
  });

  it('uses Ctrl instead of ⌘ elsewhere', () => {
    expect(matchReviewShortcut(key({ key: 'Enter', ctrlKey: true }), false)).toBe('accept');
    expect(matchReviewShortcut(key({ key: 'Backspace', metaKey: true }), false)).toBeNull();
  });

  it('ignores plain keys, extra modifiers and IME composition', () => {
    expect(matchReviewShortcut(key({ key: 'ArrowDown' }), true)).toBeNull();
    expect(
      matchReviewShortcut(key({ key: 'Enter', metaKey: true, shiftKey: true }), true),
    ).toBeNull();
    expect(
      matchReviewShortcut(key({ key: 'ArrowDown', altKey: true, metaKey: true }), true),
    ).toBeNull();
    expect(
      matchReviewShortcut(key({ key: 'Enter', metaKey: true, isComposing: true }), true),
    ).toBeNull();
  });
});

describe('text entry targets', () => {
  it('treats inputs, textareas and editable content as text entry', () => {
    const input = document.createElement('input');
    const textarea = document.createElement('textarea');
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    const child = document.createElement('span');
    editable.append(child);
    document.body.append(editable);
    expect(isTextEntryTarget(input)).toBe(true);
    expect(isTextEntryTarget(textarea)).toBe(true);
    expect(isTextEntryTarget(editable)).toBe(true);
    expect(isTextEntryTarget(child)).toBe(true);
    editable.remove();
  });

  it('does not treat buttons or non-editable islands as text entry', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    const island = document.createElement('div');
    island.contentEditable = 'false';
    const button = document.createElement('button');
    island.append(button);
    editable.append(island);
    document.body.append(editable);
    expect(isTextEntryTarget(button)).toBe(false);
    expect(isTextEntryTarget(document.body)).toBe(false);
    expect(isTextEntryTarget(null)).toBe(false);
    editable.remove();
  });
});
