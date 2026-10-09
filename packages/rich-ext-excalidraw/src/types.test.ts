import { describe, expect, it } from 'vitest';

import { parseSnapshot, serializeSnapshot } from './types';

describe('parseSnapshot', () => {
  it('reads a relative scene path as a remote snapshot', () => {
    expect(parseSnapshot('assets/flow.excalidraw')).toEqual({
      type: 'remote',
      url: 'assets/flow.excalidraw',
    });
    expect(parseSnapshot('./flow.excalidraw')).toEqual({
      type: 'remote',
      url: './flow.excalidraw',
    });
  });

  it('keeps a delta against a relative scene path', () => {
    const raw = 'assets/flow.excalidraw\n{"elements":{"0":[1]}}';
    const parsed = parseSnapshot(raw);
    expect(parsed).toEqual({
      type: 'delta',
      baseUrl: 'assets/flow.excalidraw',
      delta: { elements: { '0': [1] } },
    });
    expect(serializeSnapshot(parsed!)).toBe(raw);
  });

  it('rejects text that is not a scene path', () => {
    expect(parseSnapshot('assets/flow.png')).toBeNull();
    expect(parseSnapshot('/etc/passwd.excalidraw')).toBeNull();
    expect(parseSnapshot('javascript:alert(1).excalidraw')).toBeNull();
    expect(parseSnapshot('some prose')).toBeNull();
  });

  it('still reads http and ref snapshots', () => {
    expect(parseSnapshot('https://cdn.example.com/a.excalidraw')).toEqual({
      type: 'remote',
      url: 'https://cdn.example.com/a.excalidraw',
    });
    expect(parseSnapshot('ref:file/abc')).toEqual({ type: 'remote', url: 'ref:file/abc' });
  });
});
