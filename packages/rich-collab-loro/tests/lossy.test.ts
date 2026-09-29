import { createHeadlessEditor } from '@lexical/headless';
import {
  $getRoot,
  DecoratorNode,
  type Klass,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
} from 'lexical';
import { LoroDoc } from 'loro-crdt';
import { describe, expect, it } from 'vitest';

import { createLoroBinding } from '../src';

type CardJSON = SerializedLexicalNode & { title: string; extra?: string };

function cardClass(keepsExtra: boolean): Klass<LexicalNode> {
  class Card extends DecoratorNode<null> {
    __title: string;
    __extra: string | undefined;

    static getType(): string {
      return 'card';
    }

    static clone(node: Card): Card {
      return new Card(node.__title, node.__extra, node.__key);
    }

    static importJSON(json: CardJSON): Card {
      return new Card(json.title, keepsExtra ? json.extra : undefined);
    }

    constructor(title = '', extra?: string, key?: NodeKey) {
      super(key);
      this.__title = title;
      this.__extra = extra;
    }

    exportJSON(): CardJSON {
      return keepsExtra
        ? { type: 'card', version: 1, title: this.__title, extra: this.__extra }
        : { type: 'card', version: 1, title: this.__title };
    }

    createDOM(): never {
      throw new Error('headless');
    }

    updateDOM(): boolean {
      return false;
    }

    decorate(): null {
      return null;
    }
  }
  return Card;
}

function peer(id: number, keepsExtra: boolean, from?: LoroDoc) {
  const doc = new LoroDoc();
  doc.setPeerId(id);
  if (from) doc.import(from.export({ mode: 'snapshot' }));
  const editor = createHeadlessEditor({
    nodes: [cardClass(keepsExtra)],
    onError: (error) => {
      throw error;
    },
  });
  return { binding: createLoroBinding(editor, doc), doc, editor };
}

describe('peers whose node classes export different props', () => {
  it('keeps a prop that the lossy peer cannot represent and stops exchanging ops', () => {
    const full = peer(1, true);
    full.editor.update(
      () => {
        $getRoot().append(
          full.editor._nodes.get('card')!.klass.importJSON({
            type: 'card',
            version: 1,
            title: 't',
            extra: 'kept',
          } as CardJSON),
        );
      },
      { discrete: true },
    );
    const lossy = peer(2, false, full.doc);
    lossy.editor.update(
      () => {
        $getRoot().append(
          lossy.editor._nodes.get('card')!.klass.importJSON({
            type: 'card',
            version: 1,
            title: 'second',
          } as CardJSON),
        );
      },
      { discrete: true },
    );
    full.binding.import(lossy.doc.export({ mode: 'update', from: full.doc.oplogVersion() }));
    expect(JSON.stringify(full.editor.getEditorState().toJSON())).toContain('kept');
    const settled = lossy.doc.oplogVersion();
    lossy.binding.import(full.doc.export({ mode: 'update', from: settled }));
    expect(lossy.doc.oplogVersion().toJSON()).toEqual(full.doc.oplogVersion().toJSON());
  });
});
