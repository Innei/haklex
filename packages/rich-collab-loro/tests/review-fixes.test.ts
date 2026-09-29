import { createDefaultRegistry, deserializeFromXml } from '@haklex/rich-litexml';
import {
  $createTextNode,
  $getRoot,
  $isTextNode,
  type ElementNode,
  type LexicalNode,
} from 'lexical';
import { describe, expect, it } from 'vitest';

import { $reconcileRoot, editAtVersion } from '../src';
import { createEditor, createPeer, type Peer, rootJSON, sync } from './helpers';

const registry = createDefaultRegistry();
const parse = (body: string) => deserializeFromXml(`<doc>${body}</doc>`, registry);

function load(peer: Peer, body: string): void {
  peer.editor.update(() => $reconcileRoot(parse(body).root), { discrete: true });
}

function blockTexts(peer: Peer): string[] {
  return peer.editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((node) => node.getTextContent()),
  );
}

function $lastText(node: LexicalNode): ReturnType<typeof $createTextNode> {
  if ($isTextNode(node)) return node;
  const last = (node as ElementNode).getLastChild();
  if (!last) throw new Error('no text');
  return $lastText(last);
}

describe('agent edits keep concurrent human text inside blocks they restructure', () => {
  it('keeps text typed into list items when the agent edits another block', () => {
    const base = '<ul><li>A</li><li>B</li><li>C</li></ul><p>x</p>';
    const server = createPeer(1);
    load(server, base);
    const frontiers = server.doc.frontiers();
    const human = createPeer(2, server);
    human.editor.update(
      () => {
        const list = $getRoot().getFirstChild() as ElementNode;
        for (const item of list.getChildren()) {
          const text = $lastText(item);
          text.setTextContent(`${text.getTextContent()} typed`);
        }
      },
      { discrete: true },
    );
    sync(server, human);
    server.binding.import(
      editAtVersion(
        server.doc,
        frontiers,
        createEditor,
        parse('<ul><li>A</li><li>B</li><li>C</li></ul><p>y</p>'),
      ),
    );
    sync(server, human);
    expect(blockTexts(server)).toEqual(['A typed\n\nB typed\n\nC typed', 'y']);
    expect(rootJSON(human)).toEqual(rootJSON(server));
  });

  it('keeps a run the human added to a heading whose level the agent changed', () => {
    const server = createPeer(1);
    load(server, '<h2>Title</h2>');
    const frontiers = server.doc.frontiers();
    const human = createPeer(2, server);
    human.editor.update(
      () => {
        const heading = $getRoot().getFirstChild() as ElementNode;
        heading.append($createTextNode(' and more').toggleFormat('bold'));
      },
      { discrete: true },
    );
    sync(server, human);
    server.binding.import(
      editAtVersion(server.doc, frontiers, createEditor, parse('<h3>Title</h3>')),
    );
    sync(server, human);
    expect(blockTexts(server)).toEqual(['Title and more']);
    expect(JSON.stringify(rootJSON(server))).toContain('"tag":"h3"');
    expect(rootJSON(human)).toEqual(rootJSON(server));
  });

  it('re-applying an unchanged document produces no ops', () => {
    const body = '<h2>T</h2><ul><li>A</li><li>B</li></ul><p>x</p>';
    const server = createPeer(1);
    load(server, body);
    const before = server.doc.oplogVersion();
    load(server, body);
    expect(server.doc.oplogVersion().toJSON()).toEqual(before.toJSON());
  });
});

describe('remote updates keep keys of untouched blocks', () => {
  it('does not recreate existing element or decorator nodes on pull', () => {
    const a = createPeer(1);
    load(a, '<p>one</p><mermaid>graph LR\n A --> B</mermaid><p>two</p>');
    const b = createPeer(2, a);
    const keysBefore = b.editor.getEditorState().read(() =>
      $getRoot()
        .getChildren()
        .map((node) => node.getKey()),
    );
    a.editor.update(
      () => {
        const last = $getRoot().getLastChild() as ElementNode;
        $lastText(last).setTextContent('two!');
      },
      { discrete: true },
    );
    sync(a, b);
    const keysAfter = b.editor.getEditorState().read(() =>
      $getRoot()
        .getChildren()
        .map((node) => node.getKey()),
    );
    expect(keysAfter).toEqual(keysBefore);
  });
});
