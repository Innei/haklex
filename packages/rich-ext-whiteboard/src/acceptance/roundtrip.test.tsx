// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { mountEditor } from '../../tests/harness';
import { createWhiteboardStore } from '../editor/store';
import { ROUND_TRIP_FIXTURES, withoutDeleted } from './fixtures';

const cases = Object.entries(ROUND_TRIP_FIXTURES);

describe('round trip without edits', () => {
  it('covers at least ten scenes', () => {
    expect(cases.length).toBeGreaterThanOrEqual(10);
  });

  it.each(cases)('%s survives load and getScene', (_name, scene) => {
    const input = structuredClone(scene);
    const store = createWhiteboardStore(input);
    expect(store.getScene()).toEqual(withoutDeleted(scene));
    expect(input).toEqual(scene);
  });

  it.each(cases)('%s survives mounting the editor', (_name, scene) => {
    const store = createWhiteboardStore(structuredClone(scene));
    const mounted = mountEditor(store);
    try {
      expect(store.getScene()).toEqual(withoutDeleted(scene));
      expect(store.isDirty()).toBe(false);
      expect(store.canUndo()).toBe(false);
    } finally {
      mounted.unmount();
    }
  });
});
