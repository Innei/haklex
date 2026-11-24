import { allHeadlessNodes } from '@haklex/rich-headless';
import { createHeadlessEditor } from '@lexical/headless';
import { $createParagraphNode, $createTextNode, $getRoot, $parseSerializedNode } from 'lexical';
import { LoroDoc } from 'loro-crdt';
import { describe, expect, it } from 'vitest';

import { createLoroBinding, TREE_NAME } from '../src';

const spec = JSON.stringify({
  data: [{ k: 'a', v: 1 }],
  series: [{ key: 'v' }],
  type: 'bar',
  version: 1,
  x: 'k',
});

function docWithChart(): LoroDoc {
  const doc = new LoroDoc();
  doc.setPeerId(1);
  const editor = createHeadlessEditor({
    nodes: allHeadlessNodes,
    onError: (error) => {
      throw error;
    },
  });
  createLoroBinding(editor, doc);
  editor.update(
    () => {
      const root = $getRoot();
      root.clear();
      for (const text of ['one', 'two'])
        root.append($createParagraphNode().append($createTextNode(text)));
      root.append($parseSerializedNode({ spec, type: 'chart', version: 1 } as never));
      root.append($createParagraphNode().append($createTextNode('after the chart')));
    },
    { discrete: true },
  );
  return doc;
}

function blockTypes(doc: LoroDoc): string[] {
  const root = doc.getTree(TREE_NAME).roots()[0];
  return (root?.children() ?? []).map((child) => String(child.data.get('type')));
}

describe('a peer whose editor lacks a node type', () => {
  it('keeps the unknown block and every block after it in the shared document', () => {
    const doc = docWithChart();
    expect(blockTypes(doc)).toEqual(['paragraph', 'paragraph', 'chart', 'paragraph']);

    const peerDoc = new LoroDoc();
    peerDoc.setPeerId(2);
    peerDoc.import(doc.export({ mode: 'snapshot' }));
    const errors: unknown[] = [];
    const editor = createHeadlessEditor({
      nodes: allHeadlessNodes.filter(
        (node) =>
          (typeof node === 'function' ? node.getType() : node.replace.getType()) !== 'chart',
      ),
      onError: (error) => {
        errors.push(error);
      },
    });
    createLoroBinding(editor, peerDoc);

    expect(blockTypes(peerDoc)).toEqual(['paragraph', 'paragraph', 'chart', 'paragraph']);
  });
});

describe('a peer whose editor lacks a node type, after it is open', () => {
  const withoutChart = () =>
    createHeadlessEditor({
      nodes: allHeadlessNodes.filter(
        (node) =>
          (typeof node === 'function' ? node.getType() : node.replace.getType()) !== 'chart',
      ),
      onError: () => {},
    });

  it('keeps every block when a remote update brings an unknown block', () => {
    const a = new LoroDoc();
    a.setPeerId(1);
    const aEditor = createHeadlessEditor({
      nodes: allHeadlessNodes,
      onError: (error) => {
        throw error;
      },
    });
    const aBinding = createLoroBinding(aEditor, a);
    aEditor.update(
      () => {
        const root = $getRoot();
        root.clear();
        for (const text of ['one', 'two', 'three'])
          root.append($createParagraphNode().append($createTextNode(text)));
      },
      { discrete: true },
    );
    const b = new LoroDoc();
    b.setPeerId(2);
    b.import(a.export({ mode: 'snapshot' }));
    const bEditor = withoutChart();
    const bBinding = createLoroBinding(bEditor, b);

    aEditor.update(
      () => {
        $getRoot()
          .getChildAtIndex(1)!
          .replace($parseSerializedNode({ spec, type: 'chart', version: 1 } as never));
      },
      { discrete: true },
    );
    bBinding.import(a.export({ mode: 'update', from: b.oplogVersion() }));
    aBinding.import(b.export({ mode: 'update', from: a.oplogVersion() }));

    expect(blockTypes(a)).toEqual(['paragraph', 'chart', 'paragraph']);
    expect(blockTypes(b)).toEqual(['paragraph', 'chart', 'paragraph']);
  });

  it('keeps every block when the person types after an unknown block failed to load', () => {
    const doc = docWithChart();
    const peerDoc = new LoroDoc();
    peerDoc.setPeerId(2);
    peerDoc.import(doc.export({ mode: 'snapshot' }));
    const editor = withoutChart();
    createLoroBinding(editor, peerDoc);
    editor.update(
      () => {
        const first = $getRoot().getFirstChild();
        if (first) first.append($createTextNode('!'));
        else $getRoot().append($createParagraphNode().append($createTextNode('typed')));
      },
      { discrete: true },
    );
    expect(blockTypes(peerDoc)).toEqual(['paragraph', 'paragraph', 'chart', 'paragraph']);
  });
});
