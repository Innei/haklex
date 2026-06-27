import type {
  EditorConfig,
  LexicalEditor,
  SerializedEditorState,
  SerializedLexicalNode,
} from 'lexical';
import { $insertNodes, createEditor } from 'lexical';
import { Info, Lightbulb, TriangleAlert as TriangleAlertIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { AlertEditDecorator } from '../components/decorators/AlertEditDecorator';
import { editorTheme } from '../styles/theme';
import type { CommandItemConfig } from '../types/slash-menu';
import { AlertQuoteNode, type AlertType, type SerializedAlertQuoteNode } from './AlertQuoteNode';
import { NESTED_EDITOR_NODES } from './shared';

function createContentEditor(): LexicalEditor {
  return createEditor({
    namespace: 'AlertContent',
    nodes: NESTED_EDITOR_NODES,
    theme: editorTheme,
    onError: (error: Error) => {
      console.error('[AlertContent]', error);
    },
  });
}

export class AlertQuoteEditNode extends AlertQuoteNode {
  __contentEditor: LexicalEditor;

  static commandItems: CommandItemConfig[] = [
    {
      title: 'Callout',
      icon: createElement(Info, { size: 20 }),
      description: 'Info callout block',
      keywords: ['alert', 'note', 'info', 'callout'],
      section: 'ADVANCED',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createAlertQuoteEditNode('note')]);
        });
      },
    },
    {
      title: 'Tip',
      icon: createElement(Lightbulb, { size: 20 }),
      description: 'Highlight a useful tip',
      keywords: ['alert', 'tip', 'hint'],
      section: 'ADVANCED',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createAlertQuoteEditNode('tip')]);
        });
      },
    },
    {
      title: 'Warning',
      icon: createElement(TriangleAlertIcon, { size: 20 }),
      description: 'Warn about something',
      keywords: ['alert', 'warning', 'caution'],
      section: 'ADVANCED',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createAlertQuoteEditNode('warning')]);
        });
      },
    },
  ];

  static clone(node: AlertQuoteEditNode): AlertQuoteEditNode {
    const cloned = new AlertQuoteEditNode(node.__alertType, node.__contentState, node.__key);
    cloned.__contentEditor = node.__contentEditor;
    return cloned;
  }

  constructor(alertType: AlertType, contentState?: SerializedEditorState, key?: string) {
    super(alertType, contentState, key);
    this.__contentEditor = createContentEditor();
    if (contentState) {
      const editorState = this.__contentEditor.parseEditorState(contentState);
      this.__contentEditor.setEditorState(editorState);
    }
  }

  getContentEditor(): LexicalEditor {
    return this.__contentEditor;
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): AlertQuoteEditNode {
    const serializedNode = _serializedNode as unknown as SerializedAlertQuoteNode;
    const node = new AlertQuoteEditNode(serializedNode.alertType, serializedNode.content);
    return node;
  }

  exportJSON(): SerializedAlertQuoteNode {
    return {
      ...super.exportJSON(),
      type: 'alert-quote',
      alertType: this.__alertType,
      content: this.__contentEditor.getEditorState().toJSON(),
      version: 1,
    };
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(AlertEditDecorator, {
      nodeKey: this.__key,
      alertType: this.__alertType,
      contentEditor: this.__contentEditor,
    });
  }
}

export function $createAlertQuoteEditNode(
  alertType: AlertType,
  contentState?: SerializedEditorState,
): AlertQuoteEditNode {
  return new AlertQuoteEditNode(alertType, contentState);
}
