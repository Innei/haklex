import { allHeadlessNodes } from '@haklex/rich-headless';
import { createHeadlessEditor } from '@lexical/headless';
import type { LexicalEditor } from 'lexical';
import { LoroDoc } from 'loro-crdt';

import { createLoroBinding, type LoroBinding } from '../src';

export interface Peer {
  binding: LoroBinding;
  doc: LoroDoc;
  editor: LexicalEditor;
}

export function createEditor(): LexicalEditor {
  return createHeadlessEditor({
    nodes: allHeadlessNodes,
    onError: (error) => {
      throw error;
    },
  });
}

export function createPeer(peerId: number, from?: Peer): Peer {
  const doc = new LoroDoc();
  doc.setPeerId(peerId);
  if (from) doc.import(from.doc.export({ mode: 'snapshot' }));
  const editor = createEditor();
  const binding = createLoroBinding(editor, doc);
  return { binding, doc, editor };
}

export function sync(a: Peer, b: Peer): void {
  const toB = a.doc.export({ mode: 'update', from: b.doc.oplogVersion() });
  const toA = b.doc.export({ mode: 'update', from: a.doc.oplogVersion() });
  b.binding.import(toB);
  a.binding.import(toA);
}

export function rootJSON(peer: Peer): unknown {
  return peer.editor.getEditorState().toJSON().root;
}
