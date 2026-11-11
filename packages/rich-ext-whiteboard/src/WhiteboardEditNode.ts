import type { CommandItemConfig } from '@haklex/rich-editor/commands';
import { EditableGate, ViewportGate } from '@haklex/rich-editor-ui';
import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import { $getNodeByKey, $insertNodes } from 'lexical';
import { PenTool } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement, lazy, Suspense } from 'react';

import type { WhiteboardSnapshot } from './types';
import { parseSnapshot, serializeSnapshot } from './types';
import { type SerializedWhiteboardNode, WhiteboardNode } from './WhiteboardNode';

const LazyEditRenderer = lazy(() =>
  import('./WhiteboardEditRenderer').then((m) => ({
    default: m.WhiteboardEditRenderer,
  })),
);

export class WhiteboardEditNode extends WhiteboardNode {
  static commandItems: CommandItemConfig[] = [
    {
      title: 'Whiteboard',
      icon: createElement(PenTool, { size: 20 }),
      description: 'Whiteboard canvas',
      keywords: ['excalidraw', 'whiteboard', 'draw', 'canvas'],
      nested: false,
      section: 'MEDIA',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createWhiteboardEditNode('{}')]);
        });
      },
    },
  ];

  static clone(node: WhiteboardEditNode): WhiteboardEditNode {
    return new WhiteboardEditNode(node.__snapshot, node.__key);
  }

  constructor(snapshot: string, key?: NodeKey) {
    super(snapshot, key);
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): WhiteboardEditNode {
    const serializedNode = _serializedNode as unknown as SerializedWhiteboardNode;
    return new WhiteboardEditNode(serializedNode.snapshot).updateFromJSON(_serializedNode);
  }

  decorate(editor: LexicalEditor, config: EditorConfig): ReactElement {
    const nodeKey = this.__key;
    const fallback = createElement('div', {
      className: 'rich-excalidraw-loading',
      style: {
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 10',
        margin: '1rem 0',
      },
    });

    const editable = createElement(ViewportGate, {
      fallback,
      children: createElement(
        Suspense,
        { fallback },
        createElement(LazyEditRenderer, {
          snapshot: parseSnapshot(this.__snapshot),
          onSnapshotChange: (snapshot: WhiteboardSnapshot) => {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey) as WhiteboardNode | null;
              if (node) {
                node.setSnapshot(serializeSnapshot(snapshot));
              }
            });
          },
        }),
      ),
    });

    return createElement(EditableGate, {
      editor,
      editable,
      readOnly: super.decorate(editor, config),
    });
  }
}

export function $createWhiteboardEditNode(snapshot: string): WhiteboardEditNode {
  return new WhiteboardEditNode(snapshot);
}

export function $isWhiteboardEditNode(
  node: LexicalNode | null | undefined,
): node is WhiteboardEditNode {
  return node instanceof WhiteboardEditNode;
}
