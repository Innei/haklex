import { describe, expect, it } from 'vitest';

import { computeInlineDiff } from '../src';

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

const texts = (node: any) => node.children.map((c: any) => ({ text: c.text, style: c.style }));

describe('computeInlineDiff', () => {
  it('keeps unchanged blocks as equal with the original node', () => {
    const a = makeParagraph('Same');
    const blocks = computeInlineDiff(makeDoc([a]) as any, makeDoc([makeParagraph('Same')]) as any);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('equal');
    expect(texts(blocks[0].node)).toEqual([{ text: 'Same', style: '' }]);
  });

  it('merges a modified block into one node with both marks', () => {
    const blocks = computeInlineDiff(
      makeDoc([makeParagraph('Hello world')]) as any,
      makeDoc([makeParagraph('Hello brave world')]) as any,
    );
    expect(blocks.map((b) => b.type)).toEqual(['modify']);
    const children = texts(blocks[0].node);
    expect(children.map((c: any) => c.text).join('')).toContain('brave');
    expect(children.some((c: any) => c.style.includes('background-color'))).toBe(true);
  });

  it('emits decorated insert and delete blocks in document order', () => {
    const blocks = computeInlineDiff(
      makeDoc([makeParagraph('Keep'), makeParagraph('Gone entirely different words')]) as any,
      makeDoc([
        makeParagraph('Keep'),
        makeParagraph('Brand new paragraph here'),
        makeParagraph('Tail'),
      ]) as any,
    );
    expect(blocks[0].type).toBe('equal');
    const changed = blocks.slice(1);
    expect(changed.length).toBeGreaterThan(0);
    for (const block of changed) {
      expect(['insert', 'delete', 'modify']).toContain(block.type);
    }
    const deleted = changed.filter((b) => b.type === 'delete');
    for (const block of deleted) {
      expect(texts(block.node).every((c: any) => c.style.includes('line-through'))).toBe(true);
    }
    const inserted = changed.filter((b) => b.type === 'insert');
    expect(inserted.length).toBeGreaterThan(0);
    for (const block of inserted) {
      expect(texts(block.node).every((c: any) => c.style.includes('background-color'))).toBe(true);
    }
  });

  it('falls back to a delete and insert pair when the change cannot be marked inline', () => {
    const callout = (text: string) => ({
      type: 'alert-quote',
      version: 1,
      alertType: 'caution',
      content: { root: { type: 'root', children: [makeParagraph(text)] } },
    });
    const blocks = computeInlineDiff(
      makeDoc([makeParagraph('Keep'), callout('Old note text')]) as any,
      makeDoc([makeParagraph('Keep'), callout('New note text')]) as any,
    );
    expect(blocks.map((b) => b.type)).toEqual(['equal', 'delete', 'insert']);
    expect((blocks[1].node as any).content.root.children[0].children[0].text).toBe('Old note text');
    expect((blocks[2].node as any).content.root.children[0].children[0].text).toBe('New note text');
  });

  it('falls back to a block pair when a text edit sits next to a changed inline decorator', () => {
    const text = (t: string) => ({
      type: 'text',
      text: t,
      detail: 0,
      format: 0,
      mode: 'normal',
      style: '',
      version: 1,
    });
    const mention = (name: string) => ({ type: 'mention', version: 1, name });
    const paragraph = (children: any[]) => ({ ...makeParagraph(''), children });
    const blocks = computeInlineDiff(
      makeDoc([paragraph([text('Hello world '), mention('alice')])]) as any,
      makeDoc([paragraph([text('Hello brave world '), mention('bob')])]) as any,
    );
    expect(blocks.map((b) => b.type)).toEqual(['delete', 'insert']);
  });
});
