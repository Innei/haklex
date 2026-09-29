import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
  $isTextNode,
  type LexicalNode,
  type TextNode,
} from 'lexical';
import { describe, expect, it } from 'vitest';

import { createPeer, type Peer, rootJSON, sync } from './helpers';

function write(peer: Peer, fn: () => void): void {
  peer.editor.update(fn, { discrete: true });
}

function seed(peer: Peer, lines: string[]): void {
  write(peer, () => {
    const root = $getRoot();
    root.clear();
    for (const line of lines) {
      root.append($createParagraphNode().append($createTextNode(line)));
    }
  });
}

function textAt(index: number): TextNode {
  const paragraph = $getRoot().getChildAtIndex(index);
  if (!$isElementNode(paragraph)) throw new Error(`no paragraph at ${index}`);
  const text = paragraph.getFirstChild();
  if (!$isTextNode(text)) throw new Error(`no text at ${index}`);
  return text;
}

function paragraphs(peer: Peer): string[] {
  return peer.editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((node: LexicalNode) => node.getTextContent()),
  );
}

describe('createLoroBinding', () => {
  it('builds a second peer from the first peer snapshot', () => {
    const a = createPeer(1);
    seed(a, ['hello', 'world']);
    const b = createPeer(2, a);
    expect(paragraphs(b)).toEqual(['hello', 'world']);
    expect(rootJSON(b)).toEqual(rootJSON(a));
  });

  it('merges concurrent edits in different paragraphs', () => {
    const a = createPeer(1);
    seed(a, ['one', 'two']);
    const b = createPeer(2, a);
    write(a, () => textAt(0).setTextContent('one!'));
    write(b, () => textAt(1).setTextContent('two?'));
    sync(a, b);
    expect(paragraphs(a)).toEqual(['one!', 'two?']);
    expect(rootJSON(b)).toEqual(rootJSON(a));
  });

  it('merges concurrent typing inside the same text node character by character', () => {
    const a = createPeer(1);
    seed(a, ['hello']);
    const b = createPeer(2, a);
    write(a, () => textAt(0).setTextContent('Xhello'));
    write(b, () => textAt(0).setTextContent('helloY'));
    sync(a, b);
    expect(paragraphs(a)).toEqual(['XhelloY']);
    expect(rootJSON(b)).toEqual(rootJSON(a));
  });

  it('syncs structural changes: insert, delete, move', () => {
    const a = createPeer(1);
    seed(a, ['a', 'b', 'c']);
    const b = createPeer(2, a);
    write(a, () => {
      const first = $getRoot().getFirstChild()!;
      $getRoot().getLastChild()!.insertAfter(first);
    });
    write(b, () => {
      $getRoot().getChildAtIndex(1)!.remove();
      $getRoot().append($createParagraphNode().append($createTextNode('d')));
    });
    sync(a, b);
    expect(rootJSON(b)).toEqual(rootJSON(a));
    expect(paragraphs(a).sort()).toEqual(['a', 'c', 'd']);
  });

  it('keeps a local move after syncing', () => {
    const a = createPeer(1);
    seed(a, ['a', 'b', 'c']);
    const b = createPeer(2, a);
    write(a, () => {
      $getRoot().getLastChild()!.insertAfter($getRoot().getFirstChild()!);
    });
    sync(a, b);
    expect(paragraphs(a)).toEqual(['b', 'c', 'a']);
    expect(paragraphs(b)).toEqual(['b', 'c', 'a']);
  });

  it('syncs format splits of a text node', () => {
    const a = createPeer(1);
    seed(a, ['hello world']);
    const b = createPeer(2, a);
    write(a, () => {
      const [, world] = textAt(0).splitText(6);
      world.toggleFormat('bold');
    });
    sync(a, b);
    expect(rootJSON(b)).toEqual(rootJSON(a));
    const formats = b.editor
      .getEditorState()
      .read(() =>
        ($getRoot().getFirstChild() as unknown as { getChildren: () => TextNode[] })
          .getChildren()
          .map((node) => [node.getTextContent(), node.getFormat()]),
      );
    expect(formats).toEqual([
      ['hello ', 0],
      ['world', 1],
    ]);
  });

  it('keeps the caret in place when a remote edit lands earlier in the same text node', () => {
    const a = createPeer(1);
    seed(a, ['hello']);
    const b = createPeer(2, a);
    write(b, () => textAt(0).select(5, 5));
    write(a, () => textAt(0).setTextContent('>> hello'));
    sync(a, b);
    const offset = b.editor.getEditorState().read(() => {
      const selection = b.editor.getEditorState()._selection as { anchor: { offset: number } };
      return selection.anchor.offset;
    });
    expect(offset).toBe(8);
  });

  it('keeps a pending commit message when no commitMessage option is set', () => {
    const a = createPeer(1);
    a.doc.setNextCommitMessage('marker');
    seed(a, ['x']);
    const messages = [...a.doc.getAllChanges().values()].flat().map((change) => change.message);
    expect(messages).toContain('marker');
  });
});
