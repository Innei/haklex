import type { CommandItemConfig } from '@haklex/rich-editor/commands';
import { ViewportGate } from '@haklex/rich-editor-ui';
import type { EditorConfig, LexicalEditor, LexicalNode, NodeKey } from 'lexical';
import { $getNodeByKey, $insertNodes } from 'lexical';
import { PenTool } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement, lazy, Suspense } from 'react';

import { ExcalidrawNode, type SerializedExcalidrawNode } from './ExcalidrawNode';
import type { ExcalidrawSnapshot } from './types';
import { parseSnapshot, serializeSnapshot } from './types';

const LazyEditRenderer = lazy(() =>
  import('./ExcalidrawEditRenderer').then((m) => ({
    default: m.ExcalidrawEditRenderer,
  })),
);

export class ExcalidrawEditNode extends ExcalidrawNode {
  static commandItems: CommandItemConfig[] = [
    {
      title: 'Whiteboard',
      icon: createElement(PenTool, { size: 20 }),
      description: 'Excalidraw whiteboard canvas',
      keywords: ['excalidraw', 'whiteboard', 'draw', 'canvas'],
      section: 'MEDIA',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createExcalidrawEditNode('{}')]);
        });
      },
    },
  ];

  static clone(node: ExcalidrawEditNode): ExcalidrawEditNode {
    return new ExcalidrawEditNode(node.__snapshot, node.__key);
  }

  constructor(snapshot: string, key?: NodeKey) {
    super(snapshot, key);
  }

  static importJSON(serializedNode: SerializedExcalidrawNode): ExcalidrawEditNode {
    return new ExcalidrawEditNode(serializedNode.snapshot);
  }

  decorate(editor: LexicalEditor, config: EditorConfig): ReactElement {
    const isEditable = editor.isEditable();

    if (!isEditable) {
      return super.decorate(editor, config);
    }

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

    return createElement(ViewportGate, {
      fallback,
      children: createElement(
        Suspense,
        { fallback },
        createElement(LazyEditRenderer, {
          snapshot: parseSnapshot(this.__snapshot),
          onSnapshotChange: (snapshot: ExcalidrawSnapshot) => {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey) as ExcalidrawNode | null;
              if (node) {
                node.setSnapshot(serializeSnapshot(snapshot));
              }
            });
          },
        }),
      ),
    });
  }
}

export function $createExcalidrawEditNode(snapshot: string): ExcalidrawEditNode {
  return new ExcalidrawEditNode(snapshot);
}

export function $isExcalidrawEditNode(
  node: LexicalNode | null | undefined,
): node is ExcalidrawEditNode {
  return node instanceof ExcalidrawEditNode;
}
