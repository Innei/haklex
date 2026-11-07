import type { LexicalEditor } from 'lexical';
import {
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $setSelection,
  createEditor,
} from 'lexical';
import { describe, expect, it } from 'vitest';

import { $moveBlocks, $moveBlocksTo, $selectionBlockKeys } from '../src/blockMoves';

function setup(labels: string[]) {
  const editor = createEditor({
    onError: (error) => {
      throw error;
    },
  });
  const keys: Record<string, string> = {};
  editor.update(
    () => {
      for (const label of labels) {
        const paragraph = $createParagraphNode().append($createTextNode(label));
        $getRoot().append(paragraph);
        keys[label] = paragraph.getKey();
      }
    },
    { discrete: true },
  );
  return { editor, keys };
}

function order(editor: LexicalEditor) {
  return editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((child) => child.getTextContent()),
  );
}

function move(editor: LexicalEditor, keys: string[], direction: 'up' | 'down') {
  let moved = false;
  editor.update(
    () => {
      moved = $moveBlocks(keys, direction);
    },
    { discrete: true },
  );
  return moved;
}

describe('$moveBlocks', () => {
  it('moves one block up past its previous sibling', () => {
    const { editor, keys } = setup(['A', 'B', 'C']);
    expect(move(editor, [keys.B], 'up')).toBe(true);
    expect(order(editor)).toEqual(['B', 'A', 'C']);
  });

  it('moves a run of blocks down together', () => {
    const { editor, keys } = setup(['A', 'B', 'C', 'D']);
    move(editor, [keys.A, keys.B], 'down');
    expect(order(editor)).toEqual(['C', 'A', 'B', 'D']);
  });

  it('does nothing at the edges', () => {
    const { editor, keys } = setup(['A', 'B']);
    expect(move(editor, [keys.A], 'up')).toBe(false);
    expect(move(editor, [keys.B], 'down')).toBe(false);
    expect(order(editor)).toEqual(['A', 'B']);
  });
});

describe('$selectionBlockKeys', () => {
  it('returns every root block the text selection touches, in order', () => {
    const { editor, keys } = setup(['A', 'B', 'C', 'D']);
    let result: string[] = [];
    editor.update(
      () => {
        const selection = $createRangeSelection();
        const b = $getNodeByKey(keys.B)!.getFirstDescendant()!;
        const c = $getNodeByKey(keys.C)!.getFirstDescendant()!;
        selection.anchor.set(c.getKey(), 1, 'text');
        selection.focus.set(b.getKey(), 0, 'text');
        $setSelection(selection);
        result = $selectionBlockKeys();
      },
      { discrete: true },
    );
    expect(result).toEqual([keys.B, keys.C]);
  });

  it('returns the caret block for a collapsed selection', () => {
    const { editor, keys } = setup(['A', 'B']);
    let result: string[] = [];
    editor.update(
      () => {
        $getNodeByKey(keys.B)!.selectStart();
        result = $selectionBlockKeys();
      },
      { discrete: true },
    );
    expect(result).toEqual([keys.B]);
  });
});

describe('$moveBlocksTo', () => {
  function drop(editor: LexicalEditor, keys: string[], target: string, before: boolean) {
    let moved = false;
    editor.update(
      () => {
        moved = $moveBlocksTo(keys, target, before);
      },
      { discrete: true },
    );
    return moved;
  }

  it('places dragged blocks after the target in document order', () => {
    const { editor, keys } = setup(['a', 'b', 'c', 'd', 'e']);

    expect(drop(editor, [keys.d, keys.a], keys.c, false)).toBe(true);
    expect(order(editor)).toEqual(['b', 'c', 'a', 'd', 'e']);
  });

  it('places dragged blocks before the target', () => {
    const { editor, keys } = setup(['a', 'b', 'c', 'd']);

    expect(drop(editor, [keys.d], keys.b, true)).toBe(true);
    expect(order(editor)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('ignores a drop onto one of the dragged blocks', () => {
    const { editor, keys } = setup(['a', 'b', 'c']);

    expect(drop(editor, [keys.a, keys.b], keys.b, false)).toBe(false);
    expect(order(editor)).toEqual(['a', 'b', 'c']);
  });

  it('ignores keys that are not blocks of this editor', () => {
    const { editor, keys } = setup(['a', 'b', 'c']);

    expect(drop(editor, ['missing'], keys.b, false)).toBe(false);
    expect(order(editor)).toEqual(['a', 'b', 'c']);
  });
});
