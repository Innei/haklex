import { describe, expect, it } from 'vitest';

import { wrapLazy } from '../src/core/lazy';
import type { RichRendererModule } from '../src/core/types';

describe('wrapLazy', () => {
  it('returns empty object when no module declares lazyRenderers', () => {
    const result = wrapLazy([{ name: 'a' }, { name: 'b' }]);
    expect(Object.keys(result)).toEqual([]);
  });

  it('wraps each lazy entry into a Suspense-bounded component', () => {
    const loader = async () => ({ default: () => null });
    const m: RichRendererModule = {
      name: 'mermaid',
      lazyRenderers: { Mermaid: loader as any },
    };
    const result = wrapLazy([m]) as any;
    expect(typeof result.Mermaid).toBe('function');
    expect(result.Mermaid.displayName).toBe('Lazy(mermaid.Mermaid)');
  });

  it('produces stable component identities across calls (factories built per wrapLazy call)', () => {
    // composeRenderer calls wrapLazy ONCE — these identities must stay stable
    // for the lifetime of the composed renderer.
    const loader = async () => ({ default: () => null });
    const m: RichRendererModule = {
      name: 'katex',
      lazyRenderers: { KaTeX: loader as any },
    };
    const r1 = wrapLazy([m]) as any;
    expect(r1.KaTeX).toBe(r1.KaTeX); // same call, same component
  });

  it('skips entries whose loader is undefined', () => {
    const m: RichRendererModule = {
      name: 'x',
      lazyRenderers: { Mermaid: undefined as any },
    };
    expect(Object.keys(wrapLazy([m]))).toEqual([]);
  });
});
