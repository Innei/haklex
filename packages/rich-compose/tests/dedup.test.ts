import { describe, expect, it, vi } from 'vitest';

import { dedupNodes, mergeModules } from '../src/core/dedup';
import type { RichRendererModule } from '../src/core/types';

describe('mergeModules', () => {
  it('returns empty array when both inputs are undefined', () => {
    expect(mergeModules(undefined, undefined)).toEqual([]);
  });

  it('appends modules in order without dedup when all unique', () => {
    const a: RichRendererModule = { name: 'a' };
    const b: RichRendererModule = { name: 'b' };
    const c: RichRendererModule = { name: 'c' };
    expect(mergeModules([a, b], [c])).toEqual([a, b, c]);
  });

  it('skips silently when same module reference appears twice', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const a: RichRendererModule = { name: 'a' };
    const result = mergeModules([a], [a]);
    expect(result).toEqual([a]);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('warns and replaces previous module on name collision', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const a1: RichRendererModule = { name: 'a', renderers: { CodeBlock: (() => null) as any } };
    const a2: RichRendererModule = { name: 'a', renderers: { CodeBlock: (() => null) as any } };
    const b: RichRendererModule = { name: 'b' };
    const result = mergeModules([a1, b], [a2]);
    expect(result).toEqual([a2, b]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('"a"');
    warn.mockRestore();
  });

  it('preserves later-modules-override-earlier semantics on collision', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const v1: RichRendererModule = { name: 'a' };
    const v2: RichRendererModule = { name: 'a' };
    const v3: RichRendererModule = { name: 'a' };
    expect(mergeModules([v1], [v2, v3])).toEqual([v3]);
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});

describe('dedupNodes', () => {
  function makeKlass(type: string) {
    class FakeNode {
      static getType() {
        return type;
      }
    }
    return FakeNode as any;
  }

  it('returns empty array for empty input', () => {
    expect(dedupNodes([])).toEqual([]);
  });

  it('removes duplicate references', () => {
    const Foo = makeKlass('foo');
    const Bar = makeKlass('bar');
    expect(dedupNodes([Foo, Bar, Foo, Bar])).toEqual([Foo, Bar]);
  });

  it('throws when two distinct Klasses share getType()', () => {
    const Foo1 = makeKlass('foo');
    const Foo2 = makeKlass('foo');
    expect(() => dedupNodes([Foo1, Foo2])).toThrow(/type collision on "foo"/);
  });

  it('tolerates Klasses without getType()', () => {
    const A = class {} as any;
    const B = class {} as any;
    expect(dedupNodes([A, B, A])).toEqual([A, B]);
  });
});
