import { createDefaultRegistry, deserializeFromXml } from '@haklex/rich-litexml';
import { $getRoot, type NodeKey } from 'lexical';
import { describe, expect, it } from 'vitest';

import { $reconcileRoot, editAtVersion } from '../src';
import { createEditor, createPeer, type Peer, rootJSON, sync } from './helpers';

const registry = createDefaultRegistry();
const parse = (body: string) => deserializeFromXml(`<doc>${body}</doc>`, registry);

function load(peer: Peer, body: string): void {
  peer.editor.update(() => $reconcileRoot(parse(body).root), { discrete: true });
}

function keys(peer: Peer): NodeKey[] {
  return peer.editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((node) => node.getKey()),
  );
}

function texts(peer: Peer): string[] {
  return peer.editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((node) => node.getTextContent()),
  );
}

describe('$reconcileRoot', () => {
  it('produces the target state', () => {
    const peer = createPeer(1);
    load(peer, '<p id="a">one</p><h2 id="b">two</h2>');
    const expected = createPeer(2);
    expected.editor.setEditorState(
      expected.editor.parseEditorState(parse('<p id="a">one</p><h2 id="b">two</h2>')),
    );
    expected.editor.update(() => {}, { discrete: true });
    expect(rootJSON(peer)).toEqual(rootJSON(expected));
  });

  it('keeps node identity for unchanged and edited blocks', () => {
    const peer = createPeer(1);
    load(peer, '<p id="a">one</p><p id="b">two</p><p id="c">three</p>');
    const before = keys(peer);
    load(
      peer,
      '<p id="a">one</p><p id="b">two, edited</p><p id="new">inserted</p><p id="c">three</p>',
    );
    const after = keys(peer);
    expect(texts(peer)).toEqual(['one', 'two, edited', 'inserted', 'three']);
    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[1]);
    expect(after[3]).toBe(before[2]);
  });

  it('removes blocks missing from the target', () => {
    const peer = createPeer(1);
    load(peer, '<p id="a">one</p><p id="b">two</p>');
    load(peer, '<p id="b">two</p>');
    expect(texts(peer)).toEqual(['two']);
  });
});

describe('editAtVersion', () => {
  it('merges an agent edit made on a stale base without reverting concurrent human text', () => {
    const server = createPeer(1);
    load(server, '<p id="a">alpha</p><p id="b">beta</p>');
    const base = server.doc.frontiers();
    const human = createPeer(2, server);
    human.editor.update(
      () => {
        const first = $getRoot().getFirstChild()!;
        (
          first.getFirstChild() as unknown as { setTextContent: (t: string) => void }
        ).setTextContent('alpha typed by human');
      },
      { discrete: true },
    );
    sync(server, human);

    const update = editAtVersion(
      server.doc,
      base,
      createEditor,
      parse('<p id="a">alpha</p><p id="b">beta rewritten by agent</p><p id="c">gamma</p>'),
      'agent',
    );
    server.binding.import(update);
    sync(server, human);

    expect(texts(server)).toEqual(['alpha typed by human', 'beta rewritten by agent', 'gamma']);
    expect(rootJSON(human)).toEqual(rootJSON(server));
  });
});
