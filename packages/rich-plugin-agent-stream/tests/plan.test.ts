import { allHeadlessNodes } from '@haklex/rich-headless';
import { createHeadlessEditor } from '@lexical/headless';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
  $parseSerializedNode,
  type LexicalEditor,
} from 'lexical';
import { describe, expect, it } from 'vitest';

import { planReveal } from '../src/plan';

function createEditor(): LexicalEditor {
  return createHeadlessEditor({
    nodes: allHeadlessNodes,
    onError: (error) => {
      throw error;
    },
  });
}

function seeded(lines: string[]): LexicalEditor {
  const editor = createEditor();
  editor.update(
    () => {
      for (const line of lines) {
        $getRoot().append($createParagraphNode().append($createTextNode(line)));
      }
    },
    { discrete: true },
  );
  return editor;
}

function change(editor: LexicalEditor, fn: () => void) {
  const prev = editor.getEditorState();
  editor.update(fn, { discrete: true });
  return planReveal(prev, editor.getEditorState());
}

function keyAt(editor: LexicalEditor, index: number): string {
  return editor.getEditorState().read(() => $getRoot().getChildAtIndex(index)!.getKey());
}

describe('planReveal', () => {
  it('reveals a new paragraph from start to end', () => {
    const editor = seeded(['first']);
    const plan = change(editor, () => {
      $getRoot().append($createParagraphNode().append($createTextNode('hello world')));
    });
    expect(plan).toEqual([
      { kind: 'text', blockKey: keyAt(editor, 1), from: 0, to: 11, text: 'hello world' },
    ]);
  });

  it('reveals only the rewritten middle of an existing paragraph', () => {
    const editor = seeded(['the quick fox jumps']);
    const plan = change(editor, () => {
      const paragraph = $getRoot().getFirstChild();
      if ($isElementNode(paragraph)) {
        paragraph.clear().append($createTextNode('the slow brown fox jumps'));
      }
    });
    expect(plan).toEqual([
      {
        kind: 'text',
        blockKey: keyAt(editor, 0),
        from: 4,
        to: 14,
        text: 'the slow brown fox jumps',
      },
    ]);
  });

  it('treats headings and quotes as text blocks', () => {
    const editor = seeded([]);
    const plan = change(editor, () => {
      $getRoot().append(
        $createHeadingNode('h2').append($createTextNode('Title')),
        $createQuoteNode().append($createTextNode('Said')),
      );
    });
    expect(plan.map((s) => [s.kind, s.kind === 'text' ? s.to : null])).toEqual([
      ['text', 5],
      ['text', 4],
    ]);
  });

  it('reveals a new decorator block as a whole', () => {
    const editor = seeded(['first']);
    const plan = change(editor, () => {
      $getRoot().append(
        $parseSerializedNode({ type: 'image', version: 1, src: 'a.jpg', altText: '' } as never),
      );
    });
    expect(plan).toEqual([{ kind: 'block', blockKey: keyAt(editor, 1) }]);
  });

  it('plans nothing when no text changed', () => {
    const editor = seeded(['same']);
    const plan = change(editor, () => {
      $getRoot().getFirstChildOrThrow<never>();
    });
    expect(plan).toEqual([]);
  });

  it('skips an empty new paragraph', () => {
    const editor = seeded(['first']);
    const plan = change(editor, () => {
      $getRoot().append($createParagraphNode());
    });
    expect(plan).toEqual([]);
  });

  it('counts offsets over text nodes only, ignoring line breaks', () => {
    const editor = seeded([]);
    const plan = change(editor, () => {
      $getRoot().append(
        $createParagraphNode().append(
          $createTextNode('ab'),
          $createLineBreakNode(),
          $createTextNode('cd'),
        ),
      );
    });
    expect(plan).toEqual([
      { kind: 'text', blockKey: keyAt(editor, 0), from: 0, to: 4, text: 'abcd' },
    ]);
  });

  it('reveals the whole text when a block is replaced by a new node', () => {
    const editor = seeded(['hello']);
    const plan = change(editor, () => {
      $getRoot()
        .getFirstChildOrThrow()
        .replace($createParagraphNode().append($createTextNode('hello there')));
    });
    expect(plan).toEqual([
      { kind: 'text', blockKey: keyAt(editor, 0), from: 0, to: 11, text: 'hello there' },
    ]);
  });
});
