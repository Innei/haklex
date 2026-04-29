import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $insertNodes,
  $nodesOfType,
  createEditor,
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type NodeKey,
} from 'lexical';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { getRegisteredNodeKlass } from '../src/utils/getRegisteredNodeKlass';

class DummySlashNode extends DecoratorNode<ReactElement | null> {
  __value: string;

  static slashMenuItems = [
    {
      title: 'Dummy node',
      description: 'Regression fixture for registered-node insertion',
      keywords: ['dummy'],
      section: 'ADVANCED',
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const NodeKlass = getRegisteredNodeKlass(DummySlashNode.getType(), DummySlashNode);
          $insertNodes([new NodeKlass('inserted')]);
        });
      },
    },
  ];

  static getType(): string {
    return 'dummy-slash';
  }

  static clone(node: DummySlashNode): DummySlashNode {
    return new DummySlashNode(node.__value, node.__key);
  }

  static importJSON(): DummySlashNode {
    return new DummySlashNode('');
  }

  constructor(value = '', key?: NodeKey) {
    super(key);
    this.__value = value;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return {} as HTMLElement;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement | null {
    return null;
  }
}

class DummySlashEditNode extends DummySlashNode {
  static getType(): string {
    return DummySlashNode.getType();
  }

  static clone(node: DummySlashEditNode): DummySlashEditNode {
    return new DummySlashEditNode(node.__value, node.__key);
  }

  static importJSON(): DummySlashEditNode {
    return new DummySlashEditNode('');
  }
}

async function flushEditor(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('getRegisteredNodeKlass', () => {
  it('returns the registered edit klass inside editor updates', () => {
    const editor = createEditor({
      namespace: 'GetRegisteredNodeKlassTest',
      nodes: [DummySlashEditNode],
      onError: (error) => {
        throw error;
      },
    });

    let NodeKlass: typeof DummySlashNode | null = null;

    editor.update(() => {
      NodeKlass = getRegisteredNodeKlass(DummySlashNode.getType(), DummySlashNode);
    });

    expect(NodeKlass).toBe(DummySlashEditNode);
  });

  it('falls back to the base klass outside editor updates', () => {
    expect(getRegisteredNodeKlass(DummySlashNode.getType(), DummySlashNode)).toBe(DummySlashNode);
  });

  it('supports slash-menu style insertion through the registered edit klass', async () => {
    const editor = createEditor({
      namespace: 'GetRegisteredNodeKlassSlashMenuTest',
      nodes: [DummySlashEditNode],
      onError: (error) => {
        throw error;
      },
    });

    editor.update(() => {
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode('cursor'));
      $getRoot().append(paragraph);
      paragraph.getFirstChildOrThrow().selectEnd();
    });

    await flushEditor();

    DummySlashEditNode.slashMenuItems[0].onSelect(editor);

    await flushEditor();

    editor.getEditorState().read(() => {
      const nodes = $nodesOfType(DummySlashEditNode);

      expect(nodes).toHaveLength(1);
      expect(nodes[0].__value).toBe('inserted');
    });
  });
});
