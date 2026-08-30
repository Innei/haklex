import {
  $createNodeSelection,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $setSelection,
  createEditor,
  DecoratorNode,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_SPACE_COMMAND,
} from 'lexical';
import { describe, expect, it } from 'vitest';

import { registerBlockExitCommands } from '../src/plugins/BlockExitPlugin';

function createKeyboardEventStub(): KeyboardEvent {
  return {
    preventDefault() {},
    shiftKey: false,
  } as KeyboardEvent;
}

class TestDecoratorNode extends DecoratorNode<null> {
  static getType() {
    return 'test-decorator';
  }

  static clone(node: TestDecoratorNode) {
    return new TestDecoratorNode(node.__key);
  }

  static importJSON() {
    return new TestDecoratorNode();
  }

  exportJSON() {
    return { type: 'test-decorator', version: 1 };
  }

  createDOM() {
    return document.createElement('div');
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return null;
  }

  isInline() {
    return false;
  }
}

function createTestEditor() {
  const editor = createEditor({
    namespace: 'BlockExitPluginTest',
    nodes: [TestDecoratorNode],
    onError: (error) => {
      throw error;
    },
  });

  const unregister = registerBlockExitCommands(editor);

  return { editor, unregister };
}

async function flushEditor() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('registerBlockExitCommands', () => {
  it.each([
    ['ArrowRight', KEY_ARROW_RIGHT_COMMAND, true, 'X'],
    ['Space', KEY_SPACE_COMMAND, false, ' X'],
  ])(
    'inserts plain text after trailing inline code on %s',
    async (_name, command, handled, text) => {
      const { editor, unregister } = createTestEditor();

      try {
        editor.update(() => {
          const paragraph = $createParagraphNode();
          const code = $createTextNode('code');
          code.setFormat('code');
          paragraph.append($createTextNode('prefix '), code);
          $getRoot().append(paragraph);
          code.selectEnd().setFormat(code.getFormat());
        });

        await flushEditor();

        expect(editor.dispatchCommand(command, createKeyboardEventStub())).toBe(handled);

        await flushEditor();

        editor.getEditorState().read(() => {
          const selection = $getSelection();

          expect($isRangeSelection(selection)).toBe(true);
          if ($isRangeSelection(selection)) {
            expect(selection.anchor.type).toBe('text');
            expect(selection.hasFormat('code')).toBe(false);
          }
        });

        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) selection.insertText(text);
        });

        await flushEditor();

        editor.getEditorState().read(() => {
          const children = $getRoot().getFirstChildOrThrow().getChildren();

          expect(children.map((node) => node.getTextContent())).toEqual(['prefix ', 'code', text]);
          expect(children[1]?.hasFormat('code')).toBe(true);
          expect(children[2]?.hasFormat('code')).toBe(false);
          expect(children[2]?.isUnmergeable()).toBe(false);
        });
      } finally {
        unregister();
      }
    },
  );

  it('inserts a virtual paragraph before the first top-level block on ArrowUp', async () => {
    const { editor, unregister } = createTestEditor();

    try {
      editor.update(() => {
        const root = $getRoot();
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode('hello'));
        root.append(paragraph);
        paragraph.selectStart();
      });

      await flushEditor();

      const handled = editor.dispatchCommand(KEY_ARROW_UP_COMMAND, createKeyboardEventStub());

      expect(handled).toBe(true);

      await flushEditor();

      editor.getEditorState().read(() => {
        const root = $getRoot();
        const first = root.getFirstChild();
        const selection = $getSelection();

        expect(root.getChildrenSize()).toBe(2);
        expect($isParagraphNode(first)).toBe(true);
        expect(first?.getTextContent()).toBe('');
        expect($isRangeSelection(selection)).toBe(true);

        if ($isParagraphNode(first) && $isRangeSelection(selection)) {
          expect(selection.anchor.getNode().getTopLevelElementOrThrow().getKey()).toBe(
            first.getKey(),
          );
        }
      });
    } finally {
      unregister();
    }
  });

  it('removes an empty virtual paragraph after focus leaves it', async () => {
    const { editor, unregister } = createTestEditor();

    try {
      editor.update(() => {
        const root = $getRoot();
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode('hello'));
        root.append(paragraph);
        paragraph.selectStart();
      });

      await flushEditor();
      editor.dispatchCommand(KEY_ARROW_UP_COMMAND, createKeyboardEventStub());
      await flushEditor();

      editor.update(() => {
        const paragraph = $getRoot().getLastChild();
        if ($isParagraphNode(paragraph)) {
          paragraph.selectStart();
        }
      });

      await flushEditor();

      editor.getEditorState().read(() => {
        const root = $getRoot();

        expect(root.getChildrenSize()).toBe(1);
        expect(root.getFirstChild()?.getTextContent()).toBe('hello');
      });
    } finally {
      unregister();
    }
  });

  it('keeps a virtual paragraph once it contains content', async () => {
    const { editor, unregister } = createTestEditor();

    try {
      editor.update(() => {
        const root = $getRoot();
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode('hello'));
        root.append(paragraph);
        paragraph.selectStart();
      });

      await flushEditor();
      editor.dispatchCommand(KEY_ARROW_UP_COMMAND, createKeyboardEventStub());
      await flushEditor();

      editor.update(() => {
        const paragraph = $getRoot().getFirstChild();
        if ($isParagraphNode(paragraph)) {
          paragraph.append($createTextNode('draft'));
          paragraph.selectEnd();
        }
      });

      await flushEditor();

      editor.update(() => {
        const paragraph = $getRoot().getLastChild();
        if ($isParagraphNode(paragraph)) {
          paragraph.selectStart();
        }
      });

      await flushEditor();

      editor.getEditorState().read(() => {
        const root = $getRoot();

        expect(root.getChildrenSize()).toBe(2);
        expect(root.getFirstChild()?.getTextContent()).toBe('draft');
        expect(root.getLastChild()?.getTextContent()).toBe('hello');
      });
    } finally {
      unregister();
    }
  });

  it('inserts a virtual paragraph after the last top-level block on ArrowDown', async () => {
    const { editor, unregister } = createTestEditor();

    try {
      editor.update(() => {
        const root = $getRoot();
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode('hello'));
        root.append(paragraph);
        paragraph.selectEnd();
      });

      await flushEditor();

      const handled = editor.dispatchCommand(KEY_ARROW_DOWN_COMMAND, createKeyboardEventStub());

      expect(handled).toBe(true);

      await flushEditor();

      editor.getEditorState().read(() => {
        const root = $getRoot();
        const last = root.getLastChild();
        const selection = $getSelection();

        expect(root.getChildrenSize()).toBe(2);
        expect($isParagraphNode(last)).toBe(true);
        expect(last?.getTextContent()).toBe('');
        expect($isRangeSelection(selection)).toBe(true);

        if ($isParagraphNode(last) && $isRangeSelection(selection)) {
          expect(selection.anchor.getNode().getTopLevelElementOrThrow().getKey()).toBe(
            last.getKey(),
          );
        }
      });
    } finally {
      unregister();
    }
  });

  it('inserts a paragraph after a node-selected decorator on plain Enter', async () => {
    const { editor, unregister } = createTestEditor();

    try {
      editor.update(() => {
        const root = $getRoot();
        const decorator = new TestDecoratorNode();
        root.append(decorator);
        const selection = $createNodeSelection();
        selection.add(decorator.getKey());
        $setSelection(selection);
      });

      await flushEditor();

      const handled = editor.dispatchCommand(KEY_ENTER_COMMAND, createKeyboardEventStub());

      expect(handled).toBe(true);

      await flushEditor();

      editor.getEditorState().read(() => {
        const root = $getRoot();
        const last = root.getLastChild();
        const selection = $getSelection();

        expect(root.getChildrenSize()).toBe(2);
        expect(root.getFirstChild()?.getType()).toBe('test-decorator');
        expect($isParagraphNode(last)).toBe(true);
        expect($isRangeSelection(selection)).toBe(true);

        if ($isParagraphNode(last) && $isRangeSelection(selection)) {
          expect(selection.anchor.getNode().getTopLevelElementOrThrow().getKey()).toBe(
            last.getKey(),
          );
        }
      });
    } finally {
      unregister();
    }
  });
});
