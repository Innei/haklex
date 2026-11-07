import type { DocumentBlocks } from '@haklex/rich-editor';
import type { LexicalEditor } from 'lexical';
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  createEditor,
  KEY_DOWN_COMMAND,
} from 'lexical';
import { describe, expect, it } from 'vitest';

import { createBlockMoveHandler } from '../src/useBlockMoveShortcuts';

const onError = (error: Error) => {
  throw error;
};

function setup() {
  const parent = createEditor({ onError });
  let bKey = '';
  parent.update(
    () => {
      const a = $createParagraphNode().append($createTextNode('A'));
      const b = $createParagraphNode().append($createTextNode('B'));
      $getRoot().append(a, b);
      bKey = b.getKey();
    },
    { discrete: true },
  );
  parent.update(() => $getNodeByKey(bKey)!.selectStart(), { discrete: true });
  parent.registerCommand(
    KEY_DOWN_COMMAND,
    createBlockMoveHandler(parent, () => [], true),
    4,
  );
  return parent;
}

const chord = () =>
  ({
    key: 'ArrowUp',
    shiftKey: true,
    metaKey: true,
    ctrlKey: false,
    altKey: false,
    preventDefault() {},
  }) as unknown as KeyboardEvent;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const order = (editor: LexicalEditor) =>
  editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((child) => child.getTextContent()),
  );

describe('createBlockMoveHandler', () => {
  it('moves the caret block when the chord comes from its own editor', async () => {
    const parent = setup();
    parent.dispatchCommand(KEY_DOWN_COMMAND, chord());
    await flush();
    expect(order(parent)).toEqual(['B', 'A']);
  });

  it('ignores the chord when it was typed inside a nested editor', async () => {
    const parent = setup();
    const nested = createEditor({ onError, parentEditor: parent });
    nested.dispatchCommand(KEY_DOWN_COMMAND, chord());
    await flush();
    expect(order(parent)).toEqual(['A', 'B']);
  });
});

describe('duplicate shortcut', () => {
  it('duplicates the caret block on Mod+D', async () => {
    const parent = setup();
    parent.dispatchCommand(KEY_DOWN_COMMAND, {
      key: 'd',
      shiftKey: false,
      metaKey: true,
      ctrlKey: false,
      altKey: false,
      preventDefault() {},
    } as unknown as KeyboardEvent);
    await flush();
    expect(order(parent)).toEqual(['A', 'B', 'B']);
  });
});

describe('virtualized islands', () => {
  function island() {
    const master = createEditor({ onError });
    const editor = createEditor({ onError });
    const masterKeys: string[] = [];
    master.update(
      () => {
        for (const label of ['A', 'B', 'C']) {
          const block = $createParagraphNode().append($createTextNode(label));
          $getRoot().append(block);
          masterKeys.push(block.getKey());
        }
      },
      { discrete: true },
    );
    let islandKey = '';
    editor.update(
      () => {
        const block = $createParagraphNode().append($createTextNode('B'));
        $getRoot().append(block);
        islandKey = block.getKey();
      },
      { discrete: true },
    );
    editor.update(() => $getNodeByKey(islandKey)!.selectStart(), { discrete: true });
    const documentBlocks = {
      editor: master,
      documentKeys: (from: LexicalEditor, keys: string[]) =>
        from === editor ? keys.flatMap((key) => (key === islandKey ? [masterKeys[1]] : [])) : [],
    } as unknown as DocumentBlocks;
    editor.registerCommand(
      KEY_DOWN_COMMAND,
      createBlockMoveHandler(editor, () => [], true, documentBlocks),
      4,
    );
    return { master, editor };
  }

  it('moves the caret block in the document when the island holds only that block', async () => {
    const { master, editor } = island();
    editor.dispatchCommand(KEY_DOWN_COMMAND, chord());
    await flush();
    expect(order(master)).toEqual(['B', 'A', 'C']);
  });
});
