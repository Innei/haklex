import { describe, expect, it } from 'vitest';

import { getEditorHistoryShortcut } from '../src/history-shortcuts';

describe('getEditorHistoryShortcut', () => {
  it('recognizes undo and redo shortcuts when the local form state is clean', () => {
    expect(
      getEditorHistoryShortcut({ key: 'z', metaKey: true, ctrlKey: false, shiftKey: false }),
    ).toBe('undo');

    expect(
      getEditorHistoryShortcut({ key: 'z', metaKey: true, ctrlKey: false, shiftKey: true }),
    ).toBe('redo');

    expect(
      getEditorHistoryShortcut({ key: 'y', metaKey: false, ctrlKey: true, shiftKey: false }),
    ).toBe('redo');
  });

  it('preserves native control undo while local form state has uncommitted edits', () => {
    expect(
      getEditorHistoryShortcut(
        { key: 'z', metaKey: true, ctrlKey: false, shiftKey: false },
        { isDirty: true },
      ),
    ).toBeNull();
  });

  it('ignores unrelated modified keys', () => {
    expect(
      getEditorHistoryShortcut({ key: 'b', metaKey: true, ctrlKey: false, shiftKey: false }),
    ).toBeNull();

    expect(
      getEditorHistoryShortcut({
        altKey: true,
        key: 'z',
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
      }),
    ).toBeNull();
  });
});
