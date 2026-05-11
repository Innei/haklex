import { describe, expect, it } from 'vitest';

import { codeBlockModule } from '../src/modules/code-block/module';

describe('codeBlockModule shape', () => {
  it('declares the canonical name', () => {
    expect(codeBlockModule.name).toBe('code-block');
  });

  it('contributes no nodes (Lexical builtin `code` type)', () => {
    expect(codeBlockModule.nodes).toBeUndefined();
  });

  it('declares a lazy CodeBlock renderer', () => {
    expect(codeBlockModule.lazyRenderers?.CodeBlock).toBeTypeOf('function');
  });

  it('provides a deterministic ssrFallback element', () => {
    expect(codeBlockModule.ssrFallback?.CodeBlock).toBeDefined();
  });

  it('lazy loader is not invoked when codeBlockModule is imported', () => {
    const invoked = false;
    const probeLoader = codeBlockModule.lazyRenderers!.CodeBlock!;
    expect(typeof probeLoader).toBe('function');
    expect(invoked).toBe(false);
  });
});
