import type {
  EditorConfig,
  LexicalEditor,
  SerializedEditorState,
  SerializedLexicalNode,
} from 'lexical';
import { $insertNodes } from 'lexical';
import { Flag } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { BannerEditDecorator } from '../components/decorators/BannerEditDecorator';
import type { CommandItemConfig } from '../types/slash-menu';
import {
  BannerNode,
  type BannerType,
  normalizeBannerType,
  type SerializedBannerNode,
} from './BannerNode';
import { createNestedEditor } from './shared';

interface LegacySerializedBannerEditNode extends SerializedBannerNode {
  children?: SerializedLexicalNode[];
}

function createContentEditor(): LexicalEditor {
  return createNestedEditor('BannerContent');
}

export class BannerEditNode extends BannerNode {
  __contentEditor: LexicalEditor;

  static commandItems: CommandItemConfig[] = [
    {
      title: 'Banner',
      icon: createElement(Flag, { size: 20 }),
      description: 'Highlighted banner block',
      keywords: ['banner', 'notice', 'announcement'],
      section: 'ADVANCED',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createBannerEditNode('note')]);
        });
      },
    },
  ];

  static clone(node: BannerEditNode): BannerEditNode {
    const cloned = new BannerEditNode(node.__bannerType, node.__contentState, node.__key);
    cloned.__contentEditor = node.__contentEditor;
    return cloned;
  }

  constructor(bannerType: BannerType, contentState?: SerializedEditorState, key?: string) {
    super(bannerType, contentState, key);
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
  ): BannerEditNode {
    const serializedNode = _serializedNode as unknown as SerializedBannerNode;
    const legacy = serializedNode as LegacySerializedBannerEditNode;
    const bannerType = normalizeBannerType(serializedNode.bannerType);

    if (serializedNode.content) {
      return new BannerEditNode(bannerType, serializedNode.content);
    }

    if (legacy.children) {
      const content = {
        root: {
          children: legacy.children,
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState;
      return new BannerEditNode(bannerType, content);
    }

    return new BannerEditNode(bannerType);
  }

  exportJSON(): SerializedBannerNode {
    return {
      ...super.exportJSON(),
      type: 'banner',
      bannerType: this.__bannerType,
      content: this.__contentEditor.getEditorState().toJSON(),
      version: 1,
    };
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(BannerEditDecorator, {
      nodeKey: this.__key,
      bannerType: this.__bannerType,
      contentEditor: this.__contentEditor,
    });
  }
}

export function $createBannerEditNode(
  bannerType: BannerType,
  contentState?: SerializedEditorState,
): BannerEditNode {
  return new BannerEditNode(bannerType, contentState);
}
