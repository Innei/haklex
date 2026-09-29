import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
  $isTextNode,
  type TextNode,
} from 'lexical';
import { describe, expect, it } from 'vitest';

import { createPeer, type Peer, rootJSON, sync } from './helpers';

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALPHABET = 'abcdef ';

function $allText(): TextNode[] {
  return $getRoot()
    .getChildren()
    .flatMap((paragraph) =>
      $isElementNode(paragraph) ? paragraph.getChildren().filter($isTextNode) : [],
    );
}

function randomOp(peer: Peer, random: () => number): void {
  const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
  peer.editor.update(
    () => {
      const root = $getRoot();
      const roll = random();
      const texts = $allText();
      if (roll < 0.35 && texts.length > 0) {
        const node = pick(texts);
        node.spliceText(
          Math.floor(random() * (node.getTextContentSize() + 1)),
          0,
          pick([...ALPHABET]),
        );
      } else if (roll < 0.5 && texts.length > 0) {
        const node = pick(texts);
        const size = node.getTextContentSize();
        if (size > 0) node.spliceText(Math.floor(random() * size), 1, '');
      } else if (roll < 0.65) {
        const paragraph = $createParagraphNode().append(
          $createTextNode(pick([...ALPHABET]).repeat(3)),
        );
        const index = Math.floor(random() * (root.getChildrenSize() + 1));
        const anchor = root.getChildAtIndex(index);
        if (anchor) anchor.insertBefore(paragraph);
        else root.append(paragraph);
      } else if (roll < 0.75 && root.getChildrenSize() > 1) {
        pick(root.getChildren()).remove();
      } else if (roll < 0.85 && root.getChildrenSize() > 1) {
        const node = pick(root.getChildren());
        const target = pick(root.getChildren());
        if (!node.is(target)) target.insertAfter(node);
      } else if (texts.length > 0) {
        const node = pick(texts);
        const size = node.getTextContentSize();
        if (size > 1) {
          const parts = node.splitText(1 + Math.floor(random() * (size - 1)));
          pick(parts).toggleFormat('bold');
        }
      }
    },
    { discrete: true },
  );
}

// A pull can make Lexical derive fields (e.g. an emptied paragraph's textFormat)
// that become new local ops, so peers converge once exchanges go quiet.
function settle(a: Peer, b: Peer): void {
  for (let round = 0; round < 3; round++) {
    const before = [a.doc.oplogVersion().toJSON(), b.doc.oplogVersion().toJSON()];
    sync(a, b);
    const after = [a.doc.oplogVersion().toJSON(), b.doc.oplogVersion().toJSON()];
    if (
      JSON.stringify([...before[0]]) === JSON.stringify([...after[0]]) &&
      JSON.stringify([...before[1]]) === JSON.stringify([...after[1]])
    )
      return;
  }
}

describe('concurrent convergence', () => {
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    it(`converges after random concurrent edits (seed ${seed})`, () => {
      const random = mulberry32(seed);
      const a = createPeer(1);
      a.editor.update(
        () => {
          $getRoot()
            .clear()
            .append($createParagraphNode().append($createTextNode('seed text')));
        },
        { discrete: true },
      );
      const b = createPeer(2, a);
      for (let round = 0; round < 60; round++) {
        const opsA = 1 + Math.floor(random() * 3);
        const opsB = 1 + Math.floor(random() * 3);
        for (let i = 0; i < opsA; i++) randomOp(a, random);
        for (let i = 0; i < opsB; i++) randomOp(b, random);
        expect(rootJSON(createPeer(9, a))).toEqual(rootJSON(a));
        if (random() < 0.6) {
          settle(a, b);
          expect(rootJSON(b)).toEqual(rootJSON(a));
        }
      }
      settle(a, b);
      expect(rootJSON(b)).toEqual(rootJSON(a));
    });
  }
});
