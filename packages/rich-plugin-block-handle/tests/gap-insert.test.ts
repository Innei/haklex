import type { LexicalEditor } from 'lexical';
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  createEditor,
} from 'lexical';
import { describe, expect, it } from 'vitest';

import { $insertSlashParagraph } from '../src/useGapInsert';

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
        const block = $createParagraphNode().append($createTextNode(label));
        $getRoot().append(block);
        keys[label] = block.getKey();
      }
    },
    { discrete: true },
  );
  return { editor, keys };
}

const order = (editor: LexicalEditor) =>
  editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((child) => child.getTextContent()),
  );

const caret = (editor: LexicalEditor) =>
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    return $isRangeSelection(selection)
      ? [selection.anchor.getNode().getTextContent(), selection.anchor.offset]
      : null;
  });

function insert(editor: LexicalEditor, key: string | null, before: boolean) {
  editor.update(() => $insertSlashParagraph(key ? $getNodeByKey(key) : null, before), {
    discrete: true,
  });
}

describe('$insertSlashParagraph', () => {
  it('inserts a slash paragraph before the target with the caret after the slash', () => {
    const { editor, keys } = setup(['a', 'b']);
    insert(editor, keys.b, true);
    expect(order(editor)).toEqual(['a', '/', 'b']);
    expect(caret(editor)).toEqual(['/', 1]);
  });

  it('inserts after the target', () => {
    const { editor, keys } = setup(['a', 'b']);
    insert(editor, keys.b, false);
    expect(order(editor)).toEqual(['a', 'b', '/']);
  });

  it('appends to the document when there is no target', () => {
    const { editor } = setup(['a']);
    insert(editor, null, true);
    expect(order(editor)).toEqual(['a', '/']);
  });
});
