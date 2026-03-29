import { describe, expect, it } from 'vitest';

import { computeDiff, decorateSubtree, diffModifiedNode } from '../src';

function makeDoc(children: any[]) {
  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  };
}

function makeParagraph(text: string) {
  return {
    type: 'paragraph',
    children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: '',
  };
}

describe('computeDiff', () => {
  it('returns empty for identical documents', () => {
    const doc = makeDoc([makeParagraph('Hello')]);
    const hunks = computeDiff(doc, doc);
    expect(hunks).toHaveLength(1);
    expect(hunks[0].type).toBe('equal');
  });

  it('detects an inserted node', () => {
    const old = makeDoc([makeParagraph('Hello')]);
    const next = makeDoc([makeParagraph('Hello'), makeParagraph('World')]);
    const hunks = computeDiff(old, next);
    const insertHunks = hunks.filter((h) => h.type === 'insert');
    expect(insertHunks.length).toBeGreaterThan(0);
  });

  it('detects a deleted node', () => {
    const old = makeDoc([makeParagraph('Hello'), makeParagraph('World')]);
    const next = makeDoc([makeParagraph('Hello')]);
    const hunks = computeDiff(old, next);
    const deleteHunks = hunks.filter((h) => h.type === 'delete');
    expect(deleteHunks.length).toBeGreaterThan(0);
  });

  it('detects a modified node as delete+insert pair', () => {
    const old = makeDoc([makeParagraph('Hello')]);
    const next = makeDoc([makeParagraph('Hello World')]);
    const hunks = computeDiff(old, next);
    expect(hunks.some((h) => h.type === 'delete')).toBe(true);
    expect(hunks.some((h) => h.type === 'insert')).toBe(true);
  });
});

describe('decorateSubtree', () => {
  it('adds delete mark style to text nodes', () => {
    const node = {
      type: 'text',
      text: 'Hello',
      style: '',
      detail: 0,
      format: 0,
      mode: 'normal',
      version: 1,
    } as any;
    const decorated = decorateSubtree(node, 'delete') as any;
    expect(decorated.style).toContain('line-through');
  });

  it('adds insert mark style to text nodes', () => {
    const node = {
      type: 'text',
      text: 'Hello',
      style: '',
      detail: 0,
      format: 0,
      mode: 'normal',
      version: 1,
    } as any;
    const decorated = decorateSubtree(node, 'insert') as any;
    expect(decorated.style).toContain('background-color');
    expect(decorated.style).not.toContain('line-through');
  });
});

describe('diffModifiedNode', () => {
  it('produces char-level diff for text changes', () => {
    const old = makeParagraph('Hello');
    const next = makeParagraph('Hello World');
    const result = diffModifiedNode(old as any, next as any);
    const oldText = (result.oldNode as any).children.map((c: any) => c.text).join('');
    const newText = (result.newNode as any).children.map((c: any) => c.text).join('');
    expect(oldText).toBe('Hello');
    expect(newText).toBe('Hello World');
  });
});
