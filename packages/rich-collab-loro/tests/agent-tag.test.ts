import { $createParagraphNode, $createTextNode, $getRoot, type LexicalEditor } from 'lexical';
import { LoroDoc } from 'loro-crdt';
import { describe, expect, it } from 'vitest';

import { AGENT_WRITE_TAG, COLLAB_TAG, createLoroBinding } from '../src';
import { createEditor } from './helpers';

function author(peerId: number, commitMessage: string, recordTimestamp: boolean) {
  const doc = new LoroDoc();
  doc.setPeerId(peerId);
  doc.setRecordTimestamp(recordTimestamp);
  const editor = createEditor();
  const binding = createLoroBinding(editor, doc, { commitMessage });
  return { binding, doc, editor };
}

function append(editor: LexicalEditor, text: string): void {
  editor.update(() => $getRoot().append($createParagraphNode().append($createTextNode(text))), {
    discrete: true,
  });
}

function recordTags(editor: LexicalEditor): Set<string>[] {
  const seen: Set<string>[] = [];
  editor.registerUpdateListener(({ tags }) => seen.push(new Set(tags)));
  return seen;
}

function viewerOf(source: LoroDoc) {
  const doc = new LoroDoc();
  doc.setPeerId(99);
  doc.import(source.export({ mode: 'snapshot' }));
  const editor = createEditor();
  const binding = createLoroBinding(editor, doc, { commitMessage: 'human' });
  return { binding, doc, editor, tags: recordTags(editor) };
}

function deliver(
  from: LoroDoc,
  to: { binding: { import: (b: Uint8Array) => void }; doc: LoroDoc },
) {
  to.binding.import(from.export({ mode: 'update', from: to.doc.oplogVersion() }));
}

describe('agent write tagging', () => {
  it('tags a live import of a fresh agent change', () => {
    const agent = author(1, 'agent: add intro', true);
    const viewer = viewerOf(agent.doc);
    append(agent.editor, 'hello');
    deliver(agent.doc, viewer);
    expect(viewer.tags.at(-1)?.has(AGENT_WRITE_TAG)).toBe(true);
    expect(viewer.tags.at(-1)?.has(COLLAB_TAG)).toBe(true);
  });

  it('does not tag a human change', () => {
    const human = author(1, 'human', true);
    const viewer = viewerOf(human.doc);
    append(human.editor, 'hello');
    deliver(human.doc, viewer);
    expect(viewer.tags.at(-1)?.has(COLLAB_TAG)).toBe(true);
    expect(viewer.tags.at(-1)?.has(AGENT_WRITE_TAG)).toBe(false);
  });

  it('does not tag an agent change without a timestamp', () => {
    const agent = author(1, 'agent: add intro', false);
    const viewer = viewerOf(agent.doc);
    append(agent.editor, 'hello');
    deliver(agent.doc, viewer);
    expect(viewer.tags.at(-1)?.has(COLLAB_TAG)).toBe(true);
    expect(viewer.tags.at(-1)?.has(AGENT_WRITE_TAG)).toBe(false);
  });

  it('does not tag an agent change older than fifteen seconds', () => {
    const agent = author(1, 'agent: add intro', true);
    const viewer = viewerOf(agent.doc);
    append(agent.editor, 'hello');
    const realNow = Date.now;
    Date.now = () => realNow() + 16_000;
    try {
      deliver(agent.doc, viewer);
    } finally {
      Date.now = realNow;
    }
    expect(viewer.tags.at(-1)?.has(COLLAB_TAG)).toBe(true);
    expect(viewer.tags.at(-1)?.has(AGENT_WRITE_TAG)).toBe(false);
  });

  it('honors a wider live window from the binding options', () => {
    const agent = author(1, 'agent: add intro', true);
    const doc = new LoroDoc();
    doc.setPeerId(99);
    doc.import(agent.doc.export({ mode: 'snapshot' }));
    const editor = createEditor();
    const binding = createLoroBinding(editor, doc, { agentLiveWindowSeconds: 60 });
    const tags = recordTags(editor);
    append(agent.editor, 'hello');
    const realNow = Date.now;
    Date.now = () => realNow() + 16_000;
    try {
      deliver(agent.doc, { binding, doc });
    } finally {
      Date.now = realNow;
    }
    expect(tags.at(-1)?.has(AGENT_WRITE_TAG)).toBe(true);
  });

  it('does not tag the initial pull of a doc that already holds agent changes', () => {
    const agent = author(1, 'agent: add intro', true);
    append(agent.editor, 'hello');
    const doc = new LoroDoc();
    doc.import(agent.doc.export({ mode: 'snapshot' }));
    const editor = createEditor();
    const tags = recordTags(editor);
    createLoroBinding(editor, doc);
    expect(tags.length).toBeGreaterThan(0);
    expect(tags.some((t) => t.has(AGENT_WRITE_TAG))).toBe(false);
  });
});
