import { describe, expect, it } from 'vitest';

import { renderJson } from '../src/formats/json';
import { parseLiteXmlToState } from '../src/shared/parse-litexml';

describe('renderJson', () => {
  it('emits pretty JSON by default', () => {
    const state = parseLiteXmlToState('<doc><p>Hello</p></doc>');
    const out = renderJson(state, false);
    expect(out).toContain('\n  ');
    const parsed = JSON.parse(out);
    expect(parsed.root.type).toBe('root');
  });

  it('emits compact JSON when requested', () => {
    const state = parseLiteXmlToState('<doc><p>Hello</p></doc>');
    const out = renderJson(state, true);
    expect(out).not.toContain('\n');
    const parsed = JSON.parse(out);
    expect(parsed.root.type).toBe('root');
  });

  it('roundtrips a Lexical JSON input through stringify', () => {
    const initial = parseLiteXmlToState('<doc><p>Hello</p></doc>');
    const serialized = renderJson(initial, true);
    const reparsed = JSON.parse(serialized);
    expect(reparsed).toEqual(initial);
  });
});
