import { describe, expect, it } from 'vitest';

import * as richEditor from '../src/index';

describe('nested editor building blocks', () => {
  it('are exported from the package root for extension packages', () => {
    expect(typeof richEditor.createNestedEditor).toBe('function');
    expect(typeof richEditor.NestedEditorCorePlugins).toBe('function');
    expect(Array.isArray(richEditor.NESTED_EDITOR_NODES)).toBe(true);
  });
});
