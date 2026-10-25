import { describe, expect, it } from 'vitest';

import { parseEditorState } from './parse-editor-state';

describe('parseEditorState', () => {
  it('accepts a serialized editor state with a root', () => {
    const result = parseEditorState('{"root":{"type":"root","children":[]}}');
    expect(result.ok && result.state.root.type).toBe('root');
  });

  it('rejects text that is not JSON', () => {
    expect(parseEditorState('{nope')).toEqual({ ok: false, error: 'Not valid JSON.' });
  });

  it('rejects JSON without a root node', () => {
    expect(parseEditorState('{"foo":1}')).toEqual({
      ok: false,
      error: 'Missing "root": paste a serialized EditorState.',
    });
  });

  it('rejects empty input', () => {
    expect(parseEditorState('   ')).toEqual({ ok: false, error: 'Paste JSON first.' });
  });
});
