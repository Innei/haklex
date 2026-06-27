import type { CommandItemConfig } from '@haklex/rich-editor/commands';
import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import { $insertNodes } from 'lexical';
import { Boxes } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement, lazy, Suspense } from 'react';

import type { DynamicNodePayload, SerializedDynamicNode } from './DynamicNode';
import { DEFAULT_DYNAMIC_HEIGHT, DynamicNode } from './DynamicNode';

const LazyEditRenderer = lazy(() =>
  import('./DynamicEditRenderer').then((m) => ({
    default: m.DynamicEditRenderer,
  })),
);

export class DynamicEditNode extends DynamicNode {
  static commandItems: CommandItemConfig[] = [
    {
      title: 'Dynamic Component',
      icon: createElement(Boxes, { size: 20 }),
      description: 'Embed an external interactive component',
      keywords: ['dynamic', 'component', 'widget', 'interactive', 'external'],
      section: 'MEDIA',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createDynamicEditNode()]);
        });
      },
    },
  ];

  static clone(node: DynamicEditNode): DynamicEditNode {
    return new DynamicEditNode(node.__url, node.__props, node.__initialHeight, node.__key);
  }

  constructor(
    url: string,
    props: Record<string, unknown> = {},
    initialHeight: number = DEFAULT_DYNAMIC_HEIGHT,
    key?: NodeKey,
  ) {
    super(url, props, initialHeight, key);
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): DynamicEditNode {
    const serializedNode = _serializedNode as unknown as SerializedDynamicNode;
    return new DynamicEditNode(
      serializedNode.url,
      serializedNode.props,
      serializedNode.initialHeight,
    );
  }

  decorate(editor: LexicalEditor, config: EditorConfig): ReactElement {
    if (!editor.isEditable()) {
      return super.decorate(editor, config);
    }

    const fallback = createElement('div', {
      className: 'rich-dynamic-loading',
      style: { minHeight: this.__initialHeight, margin: '1.25rem 0' },
    });

    return createElement(
      Suspense,
      { fallback },
      createElement(LazyEditRenderer, {
        url: this.__url,
        componentProps: this.__props,
        initialHeight: this.__initialHeight,
        nodeKey: this.__key,
      }),
    );
  }
}

export function $createDynamicEditNode(payload: Partial<DynamicNodePayload> = {}): DynamicEditNode {
  return new DynamicEditNode(
    payload.url ?? '',
    payload.props ?? {},
    payload.initialHeight ?? DEFAULT_DYNAMIC_HEIGHT,
  );
}

export function $isDynamicEditNode(node: LexicalNode | null | undefined): node is DynamicEditNode {
  return node instanceof DynamicEditNode;
}
